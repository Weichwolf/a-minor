AM.audio = (() => {
  let ctx;
  const voices = new Set(), players = new Set();
  const get = () => {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  function tone(m, t, d, o = {}) {
    const c = get(), osc = c.createOscillator(), gain = c.createGain();
    osc.type = 'triangle'; osc.frequency.value = 440 * 2 ** ((m - 69) / 12);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(o.vel ?? .25, t + .01);
    gain.gain.setValueAtTime(o.vel ?? .25, t + d);
    gain.gain.linearRampToValueAtTime(0, t + d + .03);
    osc.connect(gain).connect(c.destination); voices.add(osc);
    osc.onended = () => { voices.delete(osc); osc.disconnect(); gain.disconnect(); };
    osc.start(t); osc.stop(t + d + .04);
  }
  const silence = () => { voices.forEach(v => v.stop()); voices.clear(); };
  const out = {access:null, port:null, status:''};
  const NOTE = {kick:36, snare:38, hat:42, click:37};
  const allOff = () => {
    if (out.port?.state !== 'connected') return;
    out.port.clear();
    Object.values(NOTE).forEach(n => out.port.send([0x89, n, 0]));
    out.port.send([0xB9, 123, 0]);
  };
  const ports = () => [...(out.access?.outputs.values() || [])].filter(p => p.state === 'connected');
  async function midiInit() {
    if (!navigator.requestMIDIAccess) { out.status = 'midiUnavailable'; return []; }
    try {
      out.access ||= await navigator.requestMIDIAccess({sysex:false});
      out.access.onstatechange = () => {
        if (out.port?.state === 'disconnected') { players.forEach(p => p.stop()); out.port = null; }
        out.status = out.port ? 'connected' : 'chooseDevice';
        out.onchange?.(ports());
      };
      const ps = ports(); out.status = ps.length ? 'chooseDevice' : 'noOutputs'; return ps;
    } catch (e) { out.status = 'midiDenied'; return []; }
  }
  function midiSelect(id) {
    players.forEach(p => p.stop()); allOff();
    out.port = ports().find(p => p.id === id) || null; out.status = out.port ? 'connected' : 'chooseDevice';
  }
  class Player {
    constructor() { this.playing = false; }
    load(seq, bpm) {
      if (!Number.isFinite(bpm) || bpm < 30 || bpm > 160 || !Number.isFinite(seq.len) || seq.len <= 0 || !seq.events.length) throw Error('Ungültige Sequenz oder Tempo');
      this.seq = seq; this.bpm = bpm;
    }
    play() {
      if (this.playing) return;
      if (!out.port || out.port.state !== 'connected') throw Error('MIDI-Ausgang fehlt');
      this.playing = true; players.add(this);
      const beatMs = 60000 / this.bpm, ev = [...this.seq.events].sort((a, b) => a.t - b.t), start = performance.now() + 100;
      let cycle = 0, index = 0, lastBeat = -1;
      const tick = () => {
        if (!this.playing) return;
        const now = performance.now();
        try {
          if (!out.port || out.port.state !== 'connected') throw Error('disconnected');
          if (now - (start + (cycle * this.seq.len + ev[index].t) * beatMs) > 250) throw Error('timingInterrupted');
          for (let guard = 0; guard < 256; guard++) {
            const e = ev[index], t = start + (cycle * this.seq.len + e.t) * beatMs;
            if (t > now + 100) break;
            const velocity = e.type === 'click' ? (e.strong ? 105 : 70) : Math.round((e.vel ?? .8) * 110);
            out.port.send([0x99, NOTE[e.type], velocity], t);
            out.port.send([0x89, NOTE[e.type], 0], t + 40);
            if (++index === ev.length) { index = 0; cycle++; }
          }
          const beat = Math.floor((now - start) / (beatMs * this.seq.q));
          if (beat >= 0 && beat !== lastBeat) { lastBeat = beat; this.onBeat?.(beat % this.seq.steps.length); }
          this.timer = setTimeout(tick, 25);
        } catch (e) { this.stop(); this.onError?.(e); }
      };
      tick();
    }
    stop() {
      this.playing = false; clearTimeout(this.timer); players.delete(this);
      try { allOff(); } catch (e) { out.status = 'stopError'; }
    }
  }
  return {Player, tone, get, silence, out, midiInit, midiSelect};
})();

AM.backing = (() => {
  function build(c) {
    const [beats, unit] = (c.time || '4/4').split('/').map(Number), q = 4 / unit, bars = c.bars ?? 4;
    if (![3, 4].includes(beats) || unit !== 4 || !Number.isInteger(bars) || bars < 1 || bars > 32 || !['click', 'drums'].includes(c.type)) throw Error('Ungültige Kursbegleitung');
    if (c.type === 'drums' && (beats !== 4 || !['half', 'straight'].includes(c.drums || 'half'))) throw Error('Unbekanntes Schlagzeugmuster');
    const events = [], steps = [], bar = beats * q;
    for (let b = 0; b < bars; b++) {
      for (let i = 0; i < beats; i++) {
        const t = b * bar + i * q; steps.push({bar:i === 0});
        if (c.type === 'click') events.push({t, type:'click', strong:i === 0});
        else {
          events.push({t, type:'hat', vel:i % 2 ? .16 : .22});
          if (c.drums === 'straight') {
            events.push({t, type:i % 2 ? 'snare' : 'kick', vel:i % 2 ? .65 : .85}, {t:t + q / 2, type:'hat', vel:.12});
          } else if (i === 0 || i === 2) events.push({t, type:i === 0 ? 'kick' : 'snare', vel:i === 0 ? .85 : .65});
        }
      }
    }
    return {events, len:bars * bar, bar, beats, q, steps};
  }
  return {build};
})();
