AM.notation = (() => {
  const M = AM.music;
  const DUR = {w:4, h:2, q:1, e:.5, s:.25};
  const ACC = {1:'♯', '-1':'♭', 0:'♮', 2:'𝄪', '-2':'𝄫'};
  const CLEF = 'M0 30 c0 6 -8 8 -8 2 c0 -5 8 -5 8 0 v-60 c0 -6 5 -9 6 -2 c1 8 -10 14 -14 24 c-5 14 5 22 13 19 c8 -3 7 -17 -2 -17 c-9 0 -10 12 -3 14';
  const dur = d => DUR[d[0]] * (d.endsWith('.') ? 1.5 : 1);
  const stepOf = (l, o) => M.LETTERS.indexOf(l) + o * 7;

  function render(el, sc, aids = {}) {
    const gap = 10, top = 56, bottom = top + gap * 4, mid = top + gap * 2;
    const key = sc.key || 'C', ks = M.keyAcc(key), keyMap = Object.fromEntries(ks);
    const [beats, unit] = (sc.time || '4/4').split('/').map(Number), barLen = beats * 4 / unit;
    const REF = stepOf('E', 3), yOf = st => bottom - (st - REF) * gap / 2;
    const KSY = {F:0, C:3, G:-1, D:2, A:5, E:1, B:4}, KSYb = {B:4, E:1, A:5, D:2, G:6, C:3, F:7};
    let x = 12, out = '', acc = {}, pos = 0, tie = null;
    out += `<path d="${CLEF}" transform="translate(${x + 14},${bottom})" class="clef"/>`; x += 40;
    ks.forEach(([l, a]) => { out += `<text x="${x}" y="${top + (a > 0 ? KSY[l] : KSYb[l]) * gap / 2 + 4}" class="acc">${ACC[a]}</text>`; x += 9; });
    x += 8;
    out += `<text x="${x}" y="${top + gap * 2 - 2}" class="tsig">${beats}</text><text x="${x}" y="${bottom - 2}" class="tsig">${unit}</text>`; x += 26;
    const items = [];
    (sc.notes || []).forEach((n, i) => {
      const d = dur(n.d || 'q');
      if (pos > 0 && Math.abs(pos % barLen) < 1e-9) { out += `<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" class="bar"/>`; x += 16; acc = {}; }
      const w = Math.max(30, 20 + d * 11);
      if (n.r) {
        out += rest(x, d, mid, gap);
      } else {
        const p = M.parse(n.p), st = stepOf(p.letter, p.octave), y = yOf(st);
        for (let s = REF - 2; s >= st; s -= 2) out += `<line x1="${x - 9}" y1="${yOf(s)}" x2="${x + 9}" y2="${yOf(s)}" class="ledger"/>`;
        for (let s = REF + 10; s <= st; s += 2) out += `<line x1="${x - 9}" y1="${yOf(s)}" x2="${x + 9}" y2="${yOf(s)}" class="ledger"/>`;
        const k = p.letter + p.octave, cur = acc[k] ?? keyMap[p.letter] ?? 0;
        if (p.acc !== cur) { out += `<text x="${x - 16}" y="${y + 4}" class="acc">${ACC[p.acc]}</text>`; acc[k] = p.acc; }
        out += `<ellipse cx="${x}" cy="${y}" rx="5.5" ry="4" transform="rotate(-20 ${x} ${y})" class="head${d >= 2 ? ' open' : ''}"/>`;
        if (n.d?.endsWith('.')) out += `<circle cx="${x + 9}" cy="${y - (st % 2 === REF % 2 ? 3 : 0)}" r="1.8" class="dotd"/>`;
        if (d < 4) {
          const up = y > mid, sx = up ? x + 5 : x - 5, sy = up ? y - 30 : y + 30;
          out += `<line x1="${sx}" y1="${y}" x2="${sx}" y2="${sy}" class="stem"/>`;
          const flags = d < 1 ? (d < .5 ? 2 : 1) : 0;
          for (let f = 0; f < flags; f++) { const fy = sy + (up ? f * 7 : -f * 7); out += `<path d="M${sx} ${fy} c 0 ${up ? 8 : -8} 12 ${up ? 10 : -10} 8 ${up ? 20 : -20} c 2 ${up ? -7 : 7} -2 ${up ? -12 : 12} -8 ${up ? -14 : 14}" class="flag"/>`; }
        }
        if (tie) { out += `<path d="M${tie.x + 6} ${tie.y + 7} q ${(x - tie.x) / 2 - 6} 9 ${x - tie.x - 12} 0" class="tie"/>`; tie = null; }
        if (n.tie) tie = {x, y};
        const pos6 = M.position(p.midi, {s:n.s, maxFret:sc.maxFret ?? 5});
        if (aids.names) out += `<text x="${x}" y="${bottom + 66}" class="aid">${M.name(p.midi, M.usesFlats(key)).replace(/\d/, '')}</text>`;
        if (aids.strings && pos6) out += `<circle cx="${x}" cy="${top - 26}" r="7" class="strc"/><text x="${x}" y="${top - 22.5}" class="strn">${6 - pos6.s}</text>`;
        if (aids.fingers && n.fi != null) out += `<text x="${x}" y="${top - 40}" class="aid">${n.fi}</text>`;
        items.push({x, midi:p.midi, beat:pos, d});
      }
      if (n.r) items.push({x, beat:pos, d, rest:true});
      pos += d; x += w;
    });
    const dbl = Math.abs(pos % barLen) < 1e-9;
    out += `<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" class="bar"/>` + (dbl ? `<line x1="${x + 4}" y1="${top}" x2="${x + 4}" y2="${bottom}" class="bar thick"/>` : '');
    let lines = '';
    for (let i = 0; i < 5; i++) lines += `<line x1="8" y1="${top + i * gap}" x2="${x + 8}" y2="${top + i * gap}" class="staff"/>`;
    el.innerHTML = `<svg viewBox="0 0 ${x + 16} ${bottom + 76}" width="${x + 16}" class="score">${lines}${out}</svg>`;
    return {items, beats:pos};
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
    const flats = M.usesFlats(g.key || 'C'), durs = g.durs || ['q'], notes = [];
    const [b, u] = (g.time || '4/4').split('/').map(Number), barLen = b * 4 / u, total = (g.bars || 2) * barLen;
    let m = pool[Math.floor(Math.random() * pool.length)], pos = 0;
    while (pos < total) {
      const step = Math.round((Math.random() - .5) * (g.leap || 4));
      m = pool[Math.max(0, Math.min(pool.length - 1, pool.indexOf(m) + step))];
      const fit = durs.filter(d => dur(d) <= barLen - pos % barLen), d = fit[Math.floor(Math.random() * fit.length)] || 'q';
      notes.push({p:M.name(m, flats), d}); pos += dur(d);
    }
    return notes;
  }
  return {render, generate, dur};
})();
