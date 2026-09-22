AM.piano = (() => {
  const M = AM.music;
  function render(el, o) {
    const lo = M.midi(o.range?.[0] || 'C2'), hi = M.midi(o.range?.[1] || 'C6'), flats = o.flats ?? false;
    const pcs = o.pcs ?? (o.scale ? M.scalePcs(o.root, o.scale) : []), rp = o.root ? M.rootPc(o.root) : -1;
    const isB = m => [1, 3, 6, 8, 10].includes(M.pc(m));
    const whites = []; for (let m = lo; m <= hi; m++) if (!isB(m)) whites.push(m);
    const ww = 24, wh = 90, bw = 14, bh = 56, W = whites.length * ww + 2, H = wh + 22;
    const wx = new Map(whites.map((m, i) => [m, i * ww + 1]));
    const label = m => o.show === 'name' ? (o.scale && o.root ? M.scaleName(m,o.root,o.scale).replace(/-?\d+$/,'') : M.pcName(m, flats)) : rp >= 0 ? M.degreeOf(m, o.root,o.scale) : M.pcName(m, flats);
    const selected = m => o.notes ? o.notes.some(p => M.midi(p) === m) : pcs.includes(M.pc(m));
    const dim = m => o.window && (m < M.midi(o.window[0]) || m > M.midi(o.window[1]));
    let g = `<svg viewBox="0 0 ${W} ${H}" class="pk" role="img" aria-label="${M.name(lo)}–${M.name(hi)}">`;
    whites.forEach(m => { const x = wx.get(m), on = selected(m);
      g += `<rect x="${x}" y="1" width="${ww}" height="${wh}" class="w${dim(m) ? ' dim' : ''}"/>`;
      if (M.pc(m) === 0) g += `<text x="${x + ww / 2}" y="${wh + 16}" class="oct">C${Math.floor(m / 12) - 1}</text>`;
      if (on) g += `<g data-midi="${m}" class="dot${M.pc(m) === rp ? ' root' : ''}${dim(m) ? ' dim' : ''}"><title>${M.name(m,flats)}</title><circle cx="${x + ww / 2}" cy="${wh - 14}" r="9"/><text x="${x + ww / 2}" y="${wh - 10.5}">${label(m)}</text></g>`; });
    for (let m = lo; m <= hi; m++) if (isB(m)) { const x = wx.get(m - 1) + ww - bw / 2, on = selected(m);
      g += `<rect x="${x}" y="1" width="${bw}" height="${bh}" class="b${dim(m) ? ' dim' : ''}"/>`;
      if (on) g += `<g data-midi="${m}" class="dot${M.pc(m) === rp ? ' root' : ''}${dim(m) ? ' dim' : ''}"><title>${M.name(m,flats)}</title><circle cx="${x + bw / 2}" cy="${bh - 11}" r="7"/><text x="${x + bw / 2}" y="${bh - 8}" style="font-size:9px">${label(m)}</text></g>`; }
    el.innerHTML = g + '</svg>';
  }
  return {render};
})();
