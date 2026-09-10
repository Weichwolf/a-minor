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
  const ohat = (t, v = .2) => burst(t, .3, 'highpass', 7000, v);
  const crash = (t, v = .3) => burst(t, .9, 'highpass', 4500, v);
  function tom(t, f0, f1, d, v = .6) { const c = get(), o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(master); o.start(t); o.stop(t + d + .05); }
  const tomH = (t, v) => tom(t, 220, 130, .25, v), tomL = (t, v) => tom(t, 130, 70, .4, v);
  const click = (t, strong) => { const c = get(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = strong ? 1600 : 1000; g.gain.setValueAtTime(.4, t); g.gain.exponentialRampToValueAtTime(.001, t + .04); o.connect(g).connect(master); o.start(t); o.stop(t + .05); };
  const out = {access:null, port:null, drums:true, backing:false, latency:0};
  const NOTE = {kick:36, snare:38, hat:42, ohat:46, crash:49, tomH:47, tomL:45, click:37};
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
  const FX = {tone:(e, t, spb) => tone(e.midi, t, e.dur * spb, e), kick:(e, t) => kick(t, e.vel), snare:(e, t) => snare(t, e.vel), hat:(e, t) => hat(t, e.vel), ohat:(e, t) => ohat(t, e.vel), crash:(e, t) => crash(t, e.vel), tomH:(e, t) => tomH(t, e.vel), tomL:(e, t) => tomL(t, e.vel), click:(e, t) => click(t, e.strong)};

  class Player {
    constructor() { this.playing = false; this.onBeat = null; }
    load(seq, bpm, regen) { this.seq = seq; this.bpm = bpm; this.regen = regen; }
    play() {
      if (this.playing) return; const c = get(); this.playing = true;
      const spb = 60 / this.bpm; let ev = [...this.seq.events].sort((a, b) => a.t - b.t);
      let iter = 0, idx = 0, start = c.currentTime + .1;
      const tick = () => {
        if (!this.playing) return;
        const horizon = c.currentTime + .25;
        while (true) {
          if (!ev.length) break;
          if (idx >= ev.length) { iter++; idx = 0; if (this.regen) { const n = this.regen(); if (n && n.len === this.seq.len) ev = [...n.events].sort((a, b) => a.t - b.t); } }
          const e = ev[idx], t = start + (iter * this.seq.len + e.t) * spb;
          if (t > horizon) break;
          try { (wants(e) ? send : FX[e.type])(e, t, spb); } catch (err) { console.error('Event', e, err); } idx++;
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
  const H = (b, q, v) => Array.from({length:b * 2}, (_, i) => ({t:i * q / 2, type:'hat', vel:v}));
  const Q = (b, q, v) => Array.from({length:b}, (_, i) => ({t:i * q, type:'hat', vel:v}));
  const DRUMS = {
    off: () => [],
    half: (b, q, sec) => {
      const mid = Math.floor(b / 2) * q, ev = [{t:0, type:'kick'}, {t:mid, type:'snare'}];
      if (sec === 'B') ev.push({t:mid - q / 2, type:'kick', vel:.6}, {t:(b - 1) * q, type:'ohat'}, ...H(b, q, .12));
      else if (sec === 'C') ev.push({t:mid + q, type:'kick', vel:.7}, {t:(b - 1) * q + q / 2, type:'kick', vel:.5}, ...Q(b, q, .18));
      else ev.push(...Q(b, q, .18));
      return ev;
    },
    straight: (b, q, sec) => {
      const ev = Array.from({length:b}, (_, i) => ({t:i * q, type:i % 2 ? 'snare' : 'kick'}));
      if (sec === 'B') ev.push({t:q * 1.5, type:'kick', vel:.5}, ...H(b, q, .1), {t:(b - 1) * q + q / 2, type:'ohat'});
      else if (sec === 'C') ev.push({t:q / 2, type:'kick', vel:.5}, {t:q * 2.5, type:'kick', vel:.5}, ...H(b, q, .14));
      else ev.push(...H(b, q, .14));
      return ev;
    },
    double: (b, q, sec) => {
      const ev = Array.from({length:b * 2}, (_, i) => ({t:i * q / 2, type:i % 2 ? 'snare' : 'kick', vel:i % 2 ? .4 : .8}));
      ev.push(...Array.from({length:b * 4}, (_, i) => ({t:i * q / 4, type:sec === 'B' && i % 4 === 2 ? 'ohat' : 'hat', vel:.12})));
      if (sec === 'C') ev.push(...Array.from({length:b * 2}, (_, i) => ({t:i * q / 2 + q / 4, type:'kick', vel:.5})));
      return ev;
    },
  };
  const FILLS = [['snare', 'snare', 'tomH', 'tomL'], ['snare', 'tomH', 'tomH', 'tomL'], ['tomH', 'tomH', 'tomL', 'tomL'], ['snare', 'snare', 'snare', 'tomL']];
  function fill(b, q, style, rnd = () => 1) {
    const n = Math.min(2, b - 1), start = (b - n) * q, ev = [], seq = style === 'double' ? ['snare', 'tomH', 'snare', 'tomL', 'snare', 'tomH', 'tomL', 'tomL'] : FILLS[Math.min(3, Math.floor(rnd() * 4))];
    for (let i = 0; i < n * 2; i++) ev.push({t:start + i * q / 2, type:seq[i % seq.length], vel:.55 + i * .04});
    for (let i = 0; i < n; i++) ev.push({t:start + i * q, type:'kick', vel:.7});
    return ev;
  }
  function build(c) {
    const [beats, unit] = (c.time || '4/4').split('/').map(Number), q = 4 / unit, bar = beats * q;
    const root = c.root || 'E', scale = c.scale || 'aeolian', bars = c.bars ?? 4, ev = [];
    let bass = M.rootPc(root) + 36; if (bass < 40) bass += 12;
    const tok = r => { const [rom, q] = r.split(':'); return {deg:M.romanIndex(rom), bars:1, q}; };
    const parse = l => (l || []).map(r => typeof r === 'string' ? tok(r) : r);
    const parts = {A:parse(c.parts?.A || c.progression || ['i']), B:parse(c.parts?.B), C:parse(c.parts?.C)};
    const form = c.type === 'loop' ? [...(c.form || 'A').toUpperCase()].filter(l => parts[l] && parts[l].length) : ['A'];
    const prog = c.type === 'loop' ? form.flatMap(l => parts[l].map((p, i) => ({...p, sec:l, secStart:i === 0}))) : [{deg:0, bars, sec:''}];
    const total = prog.reduce((a, p) => a + p.bars, 0), steps = [], info = [];
    let acc = 0;
    prog.forEach((p, pi) => { for (let i = 0; i < p.bars; i++) info.push({deg:p.deg, qual:p.q, sec:p.sec, first:i === 0 && p.secStart, last:i === p.bars - 1 && (pi === prog.length - 1 || prog[pi + 1].secStart)}); });
    const chordAt = b => {
      const x = info[b], ch = M.chord(root, scale, x.deg);
      if (x.qual) { const r0 = ch.notes[0]; ch.notes = [r0, r0 + (x.qual === 'maj' ? 4 : 3), r0 + (x.qual === 'dim' ? 6 : 7)]; ch.roman = x.qual === 'maj' ? ch.roman.toUpperCase().replace('°', '') : x.qual === 'min' ? ch.roman.toLowerCase().replace('°', '') : ch.roman.toLowerCase().replace('°', '') + '°'; }
      const off = ch.notes[0] - (M.rootPc(root) + 36); ch.bass = bass + off - (bass + off > 51 ? 12 : 0);
      return ch;
    };
    let t = 0;
    for (let b = 0; b < total; b++) {
      const x = info[b], ch = chordAt(b), r = ch.bass, sec = x.sec, nxt = chordAt((b + 1) % total).bass;
      for (let i = 0; i < beats; i++) steps.push({n:c.type === 'click' ? '' : M.pcName(r, M.usesFlats(root) || /b/.test(root)), roman:i === 0 && c.type === 'loop' ? ch.roman : '', sec:i === 0 && x.first ? sec : '', bar:i === 0});
      if (c.type !== 'click') {
        const B = (tt, m, d, v = .3) => ev.push({t:t + tt, type:'tone', midi:m, dur:d, vel:v, bright:3});
        if (c.type === 'drone') {
          B(0, r, bar, .35); ev.push({t, type:'tone', midi:r + 7, dur:bar, vel:.12, bright:2, sus:.8, attack:.5}, {t, type:'tone', midi:r + 12, dur:bar, vel:.1, bright:2, sus:.8, attack:.5});
        } else {
          ch.notes.forEach((n, i) => ev.push({t, type:'tone', midi:r + (n - ch.notes[0]) + 12 * (i === 0 ? 1 : 0), dur:bar, vel:.09, bright:2, sus:.8, attack:.3}));
          const mid = Math.floor(beats / 2) * q, lastB = (beats - 1) * q;
          if (x.last && beats >= 3) { B(0, r, mid, .35); B(mid, r, q, .28); B(lastB, nxt - 1, q, .3); }
          else if (sec === 'B' && beats >= 4) { B(0, r, mid, .35); B(mid, r + 7, q, .26); B(mid + q, r, bar - mid - q, .26); }
          else if (sec === 'C' && beats >= 4) { B(0, r, mid, .35); B(mid, r, q, .28); B(lastB, r + 12, q, .22); }
          else { B(0, r, beats >= 4 ? mid : bar, .35); if (beats >= 4) B(mid, r, bar - mid, .3); }
        }
        const style = c.drums || 'off', rnd = c.random ? Math.random : () => 1;
        if (style !== 'off') {
          let d = DRUMS[style](beats, q, c.type === 'loop' ? sec : 'A');
          const doFill = c.type === 'loop' && x.last && total > 1 && rnd() < .85;
          if (doFill) { const cut = (beats - Math.min(2, beats - 1)) * q; d = d.filter(e => e.t < cut || e.type === 'hat'); d.push(...fill(beats, q, style, rnd)); }
          if (c.type === 'loop' && x.first && total > 1) d.push({t:0, type:'crash', vel:.35});
          if (c.random) {
            if (rnd() < .3 && beats >= 3) d.push({t:(beats - 1) * q + q / 2, type:'kick', vel:.5});
            if (rnd() < .25 && beats >= 4) d.push({t:Math.floor(beats / 2) * q - q / 2, type:'snare', vel:.18});
            if (rnd() < .2) d.push({t:(beats - 1) * q + q / 2, type:'ohat', vel:.18});
            if (rnd() < .15) { const hs = d.filter(e => e.type === 'hat'); if (hs.length) d.splice(d.indexOf(hs[Math.floor(rnd() * hs.length)]), 1); }
          }
          d.forEach(e => ev.push({...e, t:t + e.t}));
        }
        if (c.random && c.type === 'loop' && rnd() < .2 && beats >= 4) B((beats - 1) * q + q / 2, r + 12, q / 2, .2);
      } else for (let i = 0; i < beats; i++) ev.push({t:t + i * q, type:'click', strong:i === 0});
      t += bar;
    }
    const lag = {tight:0, laid:.045, heavy:.08}[c.feel || 'tight'] ?? 0, jit = c.random ? .012 : 0;
    if (lag || jit) ev.forEach(e => {
      const k = e.type === 'snare' || e.type === 'crash' || e.type === 'tomH' || e.type === 'tomL' ? 1 : e.type === 'hat' || e.type === 'ohat' ? .5 : e.type === 'tone' && e.vel > .2 && c.type === 'loop' ? .6 : 0;
      const off = (lag * k + (jit ? (Math.random() - .5) * 2 * jit : 0)) * q;
      if (off) e.t = Math.max(0, Math.min(t - .01, e.t + off));
    });
    return {events:ev, len:t, bar, beats, q, steps};
  }
  return {build};
})();
