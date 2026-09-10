AM.audio = (() => {
  let ctx, master, noise;
  const get = () => {
    if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  const freq = m => 440 * 2 ** ((m - 69) / 12);
  function tone(m, t, d, o = {}) {
    const c = get(), f = freq(m), osc = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(), v = o.vel ?? .25;
    osc.type = o.type || 'sawtooth'; osc.frequency.value = f;
    lp.type = 'lowpass'; lp.Q.value = .7;
    lp.frequency.setValueAtTime(f * (o.bright ?? 5), t); lp.frequency.exponentialRampToValueAtTime(f * 1.8, t + Math.min(d, 1.5));
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + (o.attack ?? .01));
    g.gain.setTargetAtTime(v * (o.sus ?? .55), t + .15, .4); g.gain.setTargetAtTime(0, t + d, o.rel ?? .08);
    osc.connect(lp).connect(g).connect(master); osc.start(t); osc.stop(t + d + 1);
  }
  const noiseBuf = () => {
    if (noise) return noise;
    const c = get(), b = c.createBuffer(1, c.sampleRate, c.sampleRate), ch = b.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    return noise = b;
  };
  function burst(t, d, filt, fq, v) {
    const c = get(), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf(); f.type = filt; f.frequency.value = fq;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + d + .05);
  }
  function kick(t, v = .9) {
    const c = get(), o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .35);
    o.connect(g).connect(master); o.start(t); o.stop(t + .4);
  }
  function snare(t, v = .5) { burst(t, .18, 'bandpass', 1800, v); const c = get(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = 190; g.gain.setValueAtTime(v * .6, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(g).connect(master); o.start(t); o.stop(t + .15); }
  const hat = (t, v = .18) => burst(t, .05, 'highpass', 8000, v);
  const click = (t, strong) => { const c = get(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = strong ? 1600 : 1000; g.gain.setValueAtTime(.4, t); g.gain.exponentialRampToValueAtTime(.001, t + .04); o.connect(g).connect(master); o.start(t); o.stop(t + .05); };
  const out = {access:null, port:null, drums:true, backing:false, latency:0};
  const NOTE = {kick:36, snare:38, hat:42, click:37};
  function midiInit() {
    if (!navigator.requestMIDIAccess) { out.status = 'Browser ohne Web MIDI'; return Promise.resolve([]); }
    return navigator.requestMIDIAccess({sysex:false}).then(a => {
      out.access = a; a.onstatechange = () => out.onchange && out.onchange(ports());
      return ports();
    }).catch(e => { out.status = 'Zugriff verweigert: ' + e.name; return []; });
  }
  const ports = () => { const p = out.access ? [...out.access.outputs.values()] : []; out.status = p.length ? p.length + ' Gerät' + (p.length > 1 ? 'e' : '') : 'Zugriff ok, kein MIDI-Ausgang gefunden'; return p; };
  const midiSelect = id => { out.port = id && out.access ? out.access.outputs.get(id) : null; };
  const wants = e => out.port && (e.type === 'tone' ? out.backing : out.drums);
  function send(e, t, spb) {
    const ms = performance.now() + (t - get().currentTime) * 1000 + out.latency;
    const ch = e.type === 'tone' ? (e.vel > .2 ? 0 : 1) : 9, n = e.type === 'tone' ? e.midi : NOTE[e.type];
    const v = e.type === 'tone' ? Math.round(Math.min(1, e.vel * 3) * 100) : e.type === 'click' ? (e.strong ? 120 : 80) : Math.round((e.vel ?? .8) * 110);
    const len = e.type === 'tone' ? e.dur * spb * 1000 - 20 : 60;
    out.port.send([0x90 | ch, n, v], ms); out.port.send([0x80 | ch, n, 0], ms + len);
  }
  const allOff = () => { if (out.port) for (const ch of [0, 1, 9]) out.port.send([0xB0 | ch, 123, 0]); };
  const FX = {tone:(e, t, spb) => tone(e.midi, t, e.dur * spb, e), kick:(e, t) => kick(t, e.vel), snare:(e, t) => snare(t, e.vel), hat:(e, t) => hat(t, e.vel), click:(e, t) => click(t, e.strong)};

  class Player {
    constructor() { this.playing = false; this.onBeat = null; }
    load(seq, bpm) { this.seq = seq; this.bpm = bpm; }
    play() {
      if (this.playing) return; const c = get(); this.playing = true;
      const spb = 60 / this.bpm, ev = [...this.seq.events].sort((a, b) => a.t - b.t);
      let iter = 0, idx = 0, start = c.currentTime + .1;
      const tick = () => {
        if (!this.playing) return;
        const horizon = c.currentTime + .25;
        while (true) {
          if (idx >= ev.length) { iter++; idx = 0; }
          const e = ev[idx], t = start + (iter * this.seq.len + e.t) * spb;
          if (t > horizon) break;
          (wants(e) ? send : FX[e.type])(e, t, spb); idx++;
        }
        const n = this.seq.steps.length, step = Math.floor((c.currentTime - start) / (spb * this.seq.q));
        if (step !== this.lastBeat && this.onBeat) { this.lastBeat = step; this.onBeat(((step % n) + n) % n); }
        this.timer = setTimeout(tick, 40);
      };
      tick();
    }
    stop() { this.playing = false; clearTimeout(this.timer); this.lastBeat = null; allOff(); if (master) { const c = get(); master.gain.cancelScheduledValues(c.currentTime); master.gain.setTargetAtTime(0, c.currentTime, .05); setTimeout(() => master.gain.setValueAtTime(.5, get().currentTime), 300); } }
  }
  return {Player, tone, get, out, midiInit, midiSelect};
})();

AM.backing = (() => {
  const M = AM.music;
  const DRUMS = {
    off:  () => [],
    half: (b, q) => [{t:0, type:'kick'}, {t:Math.floor(b / 2) * q, type:'snare'}, ...Array.from({length:b}, (_, i) => ({t:i * q, type:'hat'}))],
    straight: (b, q) => [...Array.from({length:b}, (_, i) => ({t:i * q, type:i % 2 ? 'snare' : 'kick'})), ...Array.from({length:b * 2}, (_, i) => ({t:i * q / 2, type:'hat'}))],
    double: (b, q) => [...Array.from({length:b * 2}, (_, i) => ({t:i * q / 2, type:i % 2 ? 'snare' : 'kick', vel:i % 2 ? .4 : .8})), ...Array.from({length:b * 4}, (_, i) => ({t:i * q / 4, type:'hat', vel:.12}))],
  };
  function build(c) {
    const [beats, unit] = (c.time || '4/4').split('/').map(Number), q = 4 / unit, bar = beats * q;
    const root = c.root || 'E', scale = c.scale || 'aeolian', bars = c.bars ?? 4, ev = [];
    let bass = M.rootPc(root) + 36; if (bass < 40) bass += 12;
    const tok = r => { const [rom, q] = r.split(':'); return {deg:M.romanIndex(rom), bars:1, q}; };
    const parse = l => (l || []).map(r => typeof r === 'string' ? tok(r) : r);
    const parts = {A:parse(c.parts?.A || c.progression || ['i']), B:parse(c.parts?.B), C:parse(c.parts?.C)};
    const form = c.type === 'loop' ? [...(c.form || 'A').toUpperCase()].filter(l => parts[l] && parts[l].length) : ['A'];
    const prog = c.type === 'loop' ? form.flatMap(l => parts[l].map((p, i) => ({...p, sec:l, secStart:i === 0}))) : [{deg:0, bars, sec:''}];
    const total = prog.reduce((a, p) => a + p.bars, 0), steps = [];
    let t = 0;
    for (let b = 0; b < total; b++) {
      let deg = 0, q, sec = '', first = false, acc = 0; for (const p of prog) { if (b < acc + p.bars) { deg = p.deg; q = p.q; sec = p.sec; first = b === acc && p.secStart; break; } acc += p.bars; }
      const ch = M.chord(root, scale, deg);
      if (q) { const r0 = ch.notes[0]; ch.notes = [r0, r0 + (q === 'maj' ? 4 : 3), r0 + (q === 'dim' ? 6 : 7)]; ch.roman = q === 'maj' ? ch.roman.toUpperCase().replace('°', '') : q === 'min' ? ch.roman.toLowerCase().replace('°', '') : ch.roman.toLowerCase().replace('°', '') + '°'; }
      const off = ch.notes[0] - (M.rootPc(root) + 36), r = bass + off - (bass + off > 51 ? 12 : 0);
      for (let i = 0; i < beats; i++) steps.push({n:c.type === 'click' ? '' : M.pcName(r, M.usesFlats(root) || /b/.test(root)), roman:i === 0 && c.type === 'loop' ? ch.roman : '', sec:i === 0 && first ? sec : '', bar:i === 0});
      if (c.type !== 'click') {
        ev.push({t, type:'tone', midi:r, dur:bar, vel:.35, bright:3, sus:.7});
        if (c.type === 'drone') { ev.push({t, type:'tone', midi:r + 7, dur:bar, vel:.12, bright:2, sus:.8, attack:.5}); ev.push({t, type:'tone', midi:r + 12, dur:bar, vel:.1, bright:2, sus:.8, attack:.5}); }
        else ch.notes.forEach((n, i) => ev.push({t, type:'tone', midi:r + (n - ch.notes[0]) + 12 * (i === 0 ? 1 : 0), dur:bar, vel:.09, type:'tone', bright:2, sus:.8, attack:.3}));
        if (c.type === 'loop' && beats >= 4) ev.push({t:t + Math.floor(beats / 2) * q, type:'tone', midi:r, dur:bar / 2, vel:.3, bright:3});
        DRUMS[c.drums || 'off'](beats, q).forEach(d => ev.push({...d, t:t + d.t}));
      } else for (let i = 0; i < beats; i++) ev.push({t:t + i * q, type:'click', strong:i === 0});
      t += bar;
    }
    return {events:ev, len:t, bar, beats, q, steps};
  }
  return {build};
})();
