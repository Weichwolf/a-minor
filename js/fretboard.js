AM.fretboard = (() => {
  const M = AM.music;
  function render(el, o) {
    const frets = o.frets ?? 15, W = 920, left = 44, top = 20, sh = 24;
    const fw = (W - left - 12) / frets, H = top + sh * 5 + 30;
    const flats = o.flats ?? false;
    const pcs = o.pcs ?? (o.scale ? M.scalePcs(o.root, o.scale) : []);
    const rp = o.root ? M.rootPc(o.root) : -1;
    const xOf = f => f === 0 ? left - 18 : left + (f - .5) * fw;
    const yOf = s => top + (5 - s) * sh;
    let g = `<svg viewBox="0 0 ${W} ${H}" class="fb">`;
    g += `<rect x="${left}" y="${top}" width="${fw * frets}" height="${sh * 5}" class="wood"/>`;
    for (let f = 0; f <= frets; f++) {
      const x = left + f * fw;
      g += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + sh * 5}" class="${f ? 'fret' : 'nut'}"/>`;
      if (f) g += `<text x="${x - fw / 2}" y="${top + sh * 5 + 18}" class="fnum">${f}</text>`;
    }
    [3, 5, 7, 9, 12, 15].filter(f => f <= frets).forEach(f => {
      const x = xOf(f), ys = f === 12 ? [1.5, 3.5] : [2.5];
      ys.forEach(y => g += `<circle cx="${x}" cy="${top + sh * y}" r="4.5" class="marker"/>`);
    });
    for (let s = 0; s < 6; s++) {
      const y = yOf(s), dim = o.window && (s < o.window[0] || s > o.window[1]);
      g += `<line x1="${left}" y1="${y}" x2="${left + fw * frets}" y2="${y}" class="string${dim ? ' dim' : ''}" style="stroke-width:${2.4 - s * .3}"/>`;
      for (let f = 0; f <= frets; f++) {
        const m = M.fretMidi(s, f), p = M.pc(m);
        const inSet = pcs.includes(p), x = xOf(f);
        if (!inSet) { if (f === 0) g += `<text x="${x}" y="${y + 4}" class="open">${M.pcName(m, flats)}</text>`; continue; }
        const label = o.show === 'name' ? M.pcName(m, flats) : rp >= 0 ? M.degreeOf(m, o.root) : M.pcName(m, flats);
        g += `<g class="dot${p === rp ? ' root' : ''}${dim ? ' dim' : ''}"><circle cx="${x}" cy="${y}" r="10"/><text x="${x}" y="${y + 3.5}">${label}</text></g>`;
      }
    }
    el.innerHTML = g + '</svg>';
  }
  return {render};
})();
