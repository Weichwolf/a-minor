AM.fretboard = (() => {
  const M = AM.music;
  function render(el, o) {
    const frets = o.frets ?? 15, first = o.firstFret ?? 0, left = 70, top = 20, sh = 28;
    const count = frets - Math.max(1,first) + 1, fw = 48, W = left + fw * count + 12, H = top + sh * 5 + 30;
    if (!Number.isInteger(frets) || !Number.isInteger(first) || first < 0 || frets < Math.max(first,1) || frets > 24) throw Error('Invalid fret range');
    const flats = o.flats ?? false;
    const pcs = o.pcs ?? (o.scale ? M.scalePcs(o.root, o.scale) : []);
    const rp = o.root ? M.rootPc(o.root) : -1;
    const xOf = f => f === 0 ? left - 18 : left + (f - Math.max(1,first) + .5) * fw;
    const yOf = s => top + (5 - s) * sh;
    let g = `<svg viewBox="0 0 ${W} ${H}" class="fb" style="min-width:${W}px" role="img" aria-label="P4 · E2 A2 D3 G3 C4 F4">`;
    g += `<rect x="${left}" y="${top}" width="${fw * count}" height="${sh * 5}" class="wood"/>`;
    for (let f = 0; f <= count; f++) {
      const x = left + f * fw;
      g += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + sh * 5}" class="${!f && first === 0 ? 'nut' : 'fret'}"/>`;
      if (f) g += `<text x="${x - fw / 2}" y="${top + sh * 5 + 18}" class="fnum">${Math.max(1,first) + f - 1}</text>`;
    }
    [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].filter(f => f >= first && f <= frets).forEach(f => {
      const x = xOf(f), ys = f % 12 === 0 ? [1.5, 3.5] : [2.5];
      ys.forEach(y => g += `<circle cx="${x}" cy="${top + sh * y}" r="4.5" class="marker"/>`);
    });
    for (let s = 0; s < 6; s++) {
      const y = yOf(s), dim = o.window && (s < o.window[0] || s > o.window[1]);
      g += `<text x="19" y="${y + 4}" class="open">${6 - s} · ${M.TUNING[s]}</text>`;
      g += `<line x1="${left}" y1="${y}" x2="${left + fw * count}" y2="${y}" class="string${dim ? ' dim' : ''}" style="stroke-width:${2.4 - s * .3}"/>`;
      for (let f = first; f <= frets; f++) {
        const m = M.fretMidi(s, f), p = M.pc(m);
        const inSet = o.positions ? o.positions.some(pos => pos.s === s && pos.f === f) : pcs.includes(p), x = xOf(f);
        if (!inSet) continue;
        const name = o.scale && o.root ? M.scaleName(m,o.root,o.scale).replace(/-?\d+$/,'') : M.pcName(m,flats);
        const label = o.show === 'name' ? (o.positions ? M.name(m,flats) : name) : rp >= 0 ? M.degreeOf(m, o.root,o.scale) : name;
        g += `<g class="dot${p === rp ? ' root' : ''}${dim ? ' dim' : ''}" data-string="${6 - s}" data-fret="${f}" data-midi="${m}"><title>${M.name(m,flats)} · ${6 - s}/${f}</title><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y + 3.5}">${label}</text></g>`;
      }
    }
    el.innerHTML = g + '</svg>';
  }
  return {render};
})();
