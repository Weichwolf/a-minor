AM.midi = (() => {
  const TPQ = 480, DRUM = {kick:36, snare:38, hat:42, ohat:46, crash:49, tomH:47, tomL:45, click:37};
  const vlq = n => { const b = [n & 127]; while (n >>= 7) b.unshift((n & 127) | 128); return b; };
  const str = s => [...s].map(c => c.charCodeAt(0));
  const u32 = n => [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255];
  const chunk = (id, d) => [...str(id), ...u32(d.length), ...d];
  function track(msgs, extra = []) {
    msgs.sort((a, b) => a.t - b.t); let last = 0; const d = [...extra];
    for (const m of msgs) { d.push(...vlq(Math.round(m.t - last)), ...m.b); last = m.t; }
    return chunk('MTrk', [...d, 0, 255, 47, 0]);
  }
  function write(seq, bpm, loops = 4) {
    const bass = [], pad = [], drums = [], tempo = Math.round(60e6 / bpm);
    const note = (arr, ch, m, t, dur, vel) => { arr.push({t, b:[0x90 | ch, m, vel]}); arr.push({t:t + dur - 1, b:[0x80 | ch, m, 0]}); };
    for (let i = 0; i < loops; i++) for (const e of seq.events) {
      const t = (i * seq.len + e.t) * TPQ;
      if (e.type === 'tone') note(e.vel > .2 ? bass : pad, e.vel > .2 ? 0 : 1, e.midi, t, e.dur * TPQ, Math.round(Math.min(1, e.vel * 3) * 100));
      else note(drums, 9, DRUM[e.type], t, TPQ / 4, e.type === 'click' ? (e.strong ? 110 : 80) : Math.round((e.vel ?? .8) * 120));
    }
    const meta = [0, 255, 81, 3, tempo >> 16 & 255, tempo >> 8 & 255, tempo & 255];
    const data = [...chunk('MThd', [0, 1, 0, 3, TPQ >> 8, TPQ & 255]),
      ...track(bass, [...meta, 0, 0xC0, 33]), ...track(pad, [0, 0xC1, 48]), ...track(drums)];
    return new Uint8Array(data);
  }
  function download(bytes, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], {type:'audio/midi'})); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  return {write, download};
})();
