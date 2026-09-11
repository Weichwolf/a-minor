AM.notation = (() => {
  const M = AM.music;
  const DUR = {w:4, h:2, q:1, e:.5, s:.25};
  const ACC = {1:'♯', '-1':'♭', 0:'♮', 2:'𝄪', '-2':'𝄫'};
  const CLEF = {
    treble:{path:'M0 30 c0 6 -8 8 -8 2 c0 -5 8 -5 8 0 v-60 c0 -6 5 -9 6 -2 c1 8 -10 14 -14 24 c-5 14 5 22 13 19 c8 -3 7 -17 -2 -17 c-9 0 -10 12 -3 14', ref:['E', 4], dy:0,
      ks:{F:0, C:3, G:-1, D:2, A:5, E:1, B:4}, ksb:{B:4, E:1, A:5, D:2, G:6, C:3, F:7}},
    bass:{path:'M-4 -30 c 6 -12 22 -8 22 4 c 0 14 -12 22 -24 30 M-4 -30 c -6 0 -7 8 -1 8 c 6 0 5 -8 1 -8', dots:[[22, -34], [22, -26]], ref:['G', 2], dy:-10,
      ks:{F:2, C:5, G:1, D:4, A:7, E:3, B:6}, ksb:{B:6, E:3, A:7, D:4, G:8, C:5, F:9}},
  };
  const dur = d => DUR[d[0]] * (d.endsWith('.') ? 1.5 : 1);
  const stepOf = (l, o) => M.LETTERS.indexOf(l) + o * 7;
  const pitches = n => Array.isArray(n.p) ? n.p : [n.p];

  function layout(staves, barLen) {
    const on = new Set([0]); let total = 0;
    staves.forEach(s => { let p = 0; s.notes.forEach(n => { on.add(p); p += dur(n.d || 'q'); }); total = Math.max(total, p); });
    on.add(total);
    const times = [...on].sort((a, b) => a - b), x = new Map(), bars = [];
    let cur = 0;
    times.forEach((t, i) => {
      if (t > 0 && Math.abs(t % barLen) < 1e-9) { bars.push(cur + 6); cur += 20; }
      x.set(t, cur);
      if (i < times.length - 1) cur += Math.max(28, 16 + (times[i + 1] - t) * 22);
    });
    return {x, bars, total, end:cur};
  }

  function staff(sc, st, L, top, aids, tr, key, x0) {
    const gap = 10, bottom = top + gap * 4, mid = top + gap * 2, C = CLEF[st.clef], ks = M.keyAcc(key), keyMap = Object.fromEntries(ks);
    const REF = stepOf(...C.ref) - tr, yOf = s => bottom - (s - REF) * gap / 2;
    let o = `<path d="${C.path}" transform="translate(${20},${bottom + C.dy})" class="clef"/>`;
    (C.dots || []).forEach(([dx, dy]) => o += `<circle cx="${20 + dx}" cy="${bottom + C.dy + dy}" r="2.2" class="head"/>`);
    let kx = 46; ks.forEach(([l, a]) => { o += `<text x="${kx}" y="${top + (a > 0 ? C.ks[l] : C.ksb[l]) * gap / 2 + 4}" class="acc">${ACC[a]}</text>`; kx += 9; });
    const [beats, unit] = (sc.time || '4/4').split('/').map(Number);
    o += `<text x="${kx + 10}" y="${mid - 2}" class="tsig">${beats}</text><text x="${kx + 10}" y="${bottom - 2}" class="tsig">${unit}</text>`;
    L.bars.forEach(b => o += `<line x1="${x0 + b}" y1="${top}" x2="${x0 + b}" y2="${bottom}" class="bar"/>`);
    if (st.overlay) o = '';
    let acc = {}, pos = 0, tie = null, lastBar = 0;
    st.notes.forEach(n => {
      const d = dur(n.d || 'q'), x = x0 + L.x.get(pos), barNo = Math.floor(pos / (beats * 4 / unit) + 1e-9);
      if (barNo !== lastBar) { acc = {}; lastBar = barNo; }
      if (n.r) { tie = null; o += rest(x, d, mid, gap); if (n.d?.endsWith('.')) o += `<circle cx="${x + 12}" cy="${mid - 4}" r="1.8" class="dotd"/>`; pos += d; return; }
      const ps = pitches(n).map(p => { const q = M.parse(p); return {...q, st:stepOf(q.letter, q.octave), y:yOf(stepOf(q.letter, q.octave))}; }).sort((a, b) => a.st - b.st);
      const lo = ps[0], hi = ps[ps.length - 1];
      for (let s = REF - 2; s >= lo.st; s -= 2) o += `<line x1="${x - 9}" y1="${yOf(s)}" x2="${x + 9}" y2="${yOf(s)}" class="ledger"/>`;
      for (let s = REF + 10; s <= hi.st; s += 2) o += `<line x1="${x - 9}" y1="${yOf(s)}" x2="${x + 9}" y2="${yOf(s)}" class="ledger"/>`;
      let ax = x - 16;
      ps.forEach((p, i) => {
        const k = p.letter + p.octave, cur = acc[k] ?? keyMap[p.letter] ?? 0;
        if (p.acc !== cur) { o += `<text x="${ax}" y="${p.y + 4}" class="acc">${ACC[p.acc]}</text>`; acc[k] = p.acc; ax -= 9; }
        const shift = i > 0 && p.st - ps[i - 1].st === 1 ? 11 : 0;
        o += `<ellipse cx="${x + shift}" cy="${p.y}" rx="5.5" ry="4" transform="rotate(-20 ${x + shift} ${p.y})" class="head${d >= 2 ? ' open' : ''}"/>`;
        if (n.d?.endsWith('.')) o += `<circle cx="${x + 10 + shift}" cy="${p.y - (p.st % 2 === REF % 2 ? 3 : 0)}" r="1.8" class="dotd"/>`;
      });
      if (d < 4) {
        const up = st.direction ? st.direction === 'up' : (lo.y + hi.y) / 2 > mid, sx = up ? x + 5 : x - 5, sy = up ? hi.y - 30 : lo.y + 30, from = up ? lo.y : hi.y;
        o += `<line x1="${sx}" y1="${from}" x2="${sx}" y2="${sy}" class="stem"/>`;
        const flags = d < 1 ? (d < .5 ? 2 : 1) : 0;
        for (let f = 0; f < flags; f++) { const fy = sy + (up ? f * 7 : -f * 7); o += `<path d="M${sx} ${fy} c 0 ${up ? 8 : -8} 12 ${up ? 10 : -10} 8 ${up ? 20 : -20} c 2 ${up ? -7 : 7} -2 ${up ? -12 : 12} -8 ${up ? -14 : 14}" class="flag"/>`; }
      }
      if (tie) { const side = st.direction === 'up' ? -1 : 1; o += `<path d="M${tie.x + 6} ${tie.y + side * 7} q ${(x - tie.x) / 2 - 6} ${side * 9} ${x - tie.x - 12} ${lo.y - tie.y}" class="tie"/>`; tie = null; }
      if (n.tie) tie = {x, y:lo.y};
      if (aids.names) o += `<text x="${x}" y="${bottom + 66}" class="aid">${ps.map(p => p.letter + (p.acc > 0 ? '#'.repeat(p.acc) : 'b'.repeat(-p.acc))).join(' ')}</text>`;
      if (aids.strings && sc.instrument === 'guitar') { const q = M.position(lo.midi, {s:n.s, maxFret:sc.maxFret ?? 5, window:sc.stringWindow}); if (q) o += `<circle cx="${x}" cy="${top - 26}" r="7" class="strc"/><text x="${x}" y="${top - 22.5}" class="strn">${6 - q.s}</text>`; }
      if (aids.fingers && n.fi != null) o += `<text x="${x}" y="${top - 40}" class="aid">${[].concat(n.fi).join('')}</text>`;
      pos += d;
    });
    return {svg:o, bottom};
  }

  function render(el, sc, aids = {}) {
    const [beats, unit] = (sc.time || '4/4').split('/').map(Number), barLen = beats * 4 / unit;
    const poly = sc.instrument === 'guitar' && sc.bass;
    const staves = [{clef:sc.clef || 'treble', notes:sc.notes || [], direction:poly ? 'up' : null}];
    if (sc.bass) staves.push({clef:poly ? 'treble' : 'bass', notes:sc.bass, overlay:!!poly, direction:poly ? 'down' : null});
    const tr = sc.instrument === 'guitar' ? 7 : 0, x0 = 90, L = layout(staves, barLen);
    let top = 56, out = '', lines = '', lastBottom = 0;
    staves.forEach((st, i) => {
      if (st.overlay) top = 56;
      const r = staff(sc, st, L, top, i === 0 ? aids : poly ? {} : {...aids, strings:false}, tr, sc.key || 'C', x0);
      if (!st.overlay) for (let k = 0; k < 5; k++) lines += `<line x1="8" y1="${top + k * 10}" x2="${x0 + L.end + 8}" y2="${top + k * 10}" class="staff"/>`;
      out += r.svg; lastBottom = r.bottom; top = r.bottom + (aids.names ? 90 : 70);
    });
    const xe = x0 + L.end, dbl = Math.abs(L.total % barLen) < 1e-9, y0 = 56;
    out += `<line x1="${xe}" y1="${y0}" x2="${xe}" y2="${lastBottom}" class="bar"/>` + (dbl ? `<line x1="${xe + 4}" y1="${y0}" x2="${xe + 4}" y2="${lastBottom}" class="bar thick"/>` : '');
    if (staves.length > 1 && !poly) out += `<line x1="8" y1="${y0}" x2="8" y2="${lastBottom}" class="bar"/>`;
    el.innerHTML = `<svg viewBox="0 0 ${xe + 16} ${lastBottom + 76}" width="${xe + 16}" class="score">${lines}${out}</svg>`;
    return {beats:L.total};
  }
  function rest(x, d, mid, gap) {
    if (d >= 4) return `<rect x="${x - 6}" y="${mid - gap}" width="12" height="5" class="rest"/>`;
    if (d >= 2) return `<rect x="${x - 6}" y="${mid - 5}" width="12" height="5" class="rest"/>`;
    if (d >= 1) return `<path d="M${x - 3} ${mid - 14} l 7 8 l -6 7 l 6 8 c -6 -3 -9 1 -5 6 c -6 -4 -6 -10 0 -10 l -5 -7 l 5 -6 z" class="rest"/>`;
    return `<path d="M${x + 4} ${mid - 8} l -5 16 M${x + 4} ${mid - 8} c -2 5 -8 5 -8 1 c 0 -3 3 -3 4 -1" class="rest8"/>`;
  }
  function generate(g) {
    const pcs = M.scalePcs(g.root || 'C', g.scale || 'major'), lo = M.midi(g.range[0]), hi = M.midi(g.range[1]);
    const pool = []; for (let m = lo; m <= hi; m++) if (pcs.includes(M.pc(m))) pool.push(m);
    if (!pool.length) throw Error('Leerer Tonbereich');
    const flats = M.usesFlats(g.key || 'C'), durs = g.durs || ['q'], notes = [];
    const [b, u] = (g.time || '4/4').split('/').map(Number), barLen = b * 4 / u, total = (g.bars || 2) * barLen;
    let m = pool[Math.floor(Math.random() * pool.length)], pos = 0;
    while (pos < total) {
      const step = Math.round((Math.random() - .5) * (g.leap || 4));
      m = pool[Math.max(0, Math.min(pool.length - 1, pool.indexOf(m) + step))];
      const fit = durs.filter(d => Number.isFinite(dur(d)) && dur(d) <= Math.min(barLen - pos % barLen, total - pos));
      if (!fit.length) throw Error('Notenwerte füllen den Takt nicht');
      const d = fit[Math.floor(Math.random() * fit.length)];
      notes.push({p:M.name(m, flats), d}); pos += dur(d);
    }
    return notes;
  }
  const events = sc => {
    const ev = [];
    [sc.notes || [], sc.bass || []].forEach((ns, voice) => {
      let t = 0, held = new Map();
      ns.forEach(n => {
        const d = dur(n.d || 'q'), next = new Map();
        if (!n.r) pitches(n).forEach(p => {
          const midi = M.midi(p), previous = held.get(midi);
          const e = previous || {t, midi, dur:0, voice};
          e.dur += d; if (!previous) ev.push(e);
          if (n.tie) next.set(midi, e);
        });
        held = next; t += d;
      });
    });
    return ev;
  };
  return {render, generate, dur, events};
})();
