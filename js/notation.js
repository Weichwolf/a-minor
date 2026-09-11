AM.notation = (() => {
  const M = AM.music, PPQ = 24;
  const DUR = {w:4, h:2, q:1, e:.5, s:.25};
  const ACC = {1:'♯', '-1':'♭', 0:'♮', 2:'𝄪', '-2':'𝄫'};
  const CLEF = {
    treble:{path:'M0 30 c0 6 -8 8 -8 2 c0 -5 8 -5 8 0 v-60 c0 -6 5 -9 6 -2 c1 8 -10 14 -14 24 c-5 14 5 22 13 19 c8 -3 7 -17 -2 -17 c-9 0 -10 12 -3 14', ref:['E', 4], dy:0,
      ks:{F:0, C:3, G:-1, D:2, A:5, E:1, B:4}, ksb:{B:4, E:1, A:5, D:2, G:6, C:3, F:7}},
    bass:{path:'M-4 -30 c 6 -12 22 -8 22 4 c 0 14 -12 22 -24 30 M-4 -30 c -6 0 -7 8 -1 8 c 6 0 5 -8 1 -8', dots:[[22, -34], [22, -26]], ref:['G', 2], dy:-10,
      ks:{F:2, C:5, G:1, D:4, A:7, E:3, B:6}, ksb:{B:6, E:3, A:7, D:4, G:8, C:5, F:9}},
  };
  const ticks = d => { if (!/^[whqes](?:\.|t)?$/.test(d)) throw Error('Invalid duration'); return DUR[d[0]] * PPQ * (d.endsWith('.') ? 1.5 : d.endsWith('t') ? 2 / 3 : 1); };
  const dur = d => ticks(d) / PPQ;
  const esc = value => String(value).replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stepOf = (l, o) => M.LETTERS.indexOf(l) + o * 7;
  const pitches = n => Array.isArray(n.p) ? n.p : [n.p];

  function layout(staves, barLen) {
    const on = new Set([0]); let total = 0;
    staves.forEach(s => { let p = 0; s.notes.forEach(n => { on.add(p); p += ticks(n.d || 'q'); }); total = Math.max(total, p); });
    on.add(total);
    const times = [...on].sort((a, b) => a - b), x = new Map(), bars = [];
    let cur = 0;
    times.forEach((t, i) => {
      if (t > 0 && Math.abs(t % barLen) < 1e-9) { bars.push(cur + 6); cur += 20; }
      x.set(t, cur);
      if (i < times.length - 1) cur += Math.max(28, 16 + (times[i + 1] - t) / PPQ * 22);
    });
    return {x, bars, total, end:cur};
  }

  function staff(sc, st, L, top, aids, tr, key, x0) {
    const gap = 10, bottom = top + gap * 4, mid = top + gap * 2, C = CLEF[st.clef], ks = M.keyAcc(key), keyMap = Object.fromEntries(ks);
    const REF = stepOf(...C.ref) - tr, yOf = s => bottom - (s - REF) * gap / 2;
    let extent = bottom;
    let o = `<path d="${C.path}" transform="translate(${20},${bottom + C.dy})" class="clef"/>`;
    (C.dots || []).forEach(([dx, dy]) => o += `<circle cx="${20 + dx}" cy="${bottom + C.dy + dy}" r="2.2" class="head"/>`);
    let kx = 46; ks.forEach(([l, a]) => { o += `<text x="${kx}" y="${top + (a > 0 ? C.ks[l] : C.ksb[l]) * gap / 2 + 4}" class="acc">${ACC[a]}</text>`; kx += 9; });
    const [beats, unit] = (sc.time || '4/4').split('/').map(Number);
    o += `<text x="${kx + 10}" y="${mid - 2}" class="tsig">${beats}</text><text x="${kx + 10}" y="${bottom - 2}" class="tsig">${unit}</text>`;
    L.bars.forEach(b => o += `<line x1="${x0 + b}" y1="${top}" x2="${x0 + b}" y2="${bottom}" class="bar"/>`);
    if (st.overlay) o = '';
    let acc = {}, pos = 0, ties = [], lastBar = 0, tuplet, slur;
    const stems = [];
    const side = st.direction === 'up' ? -1 : 1;
    const arc = (x1,y1,x2,y2,cls = 'tie') => `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1,y2) + side * 12} ${x2} ${y2}" class="${cls}"/>`;
    st.notes.forEach(n => {
      const d = DUR[(n.d || 'q')[0]], length = ticks(n.d || 'q'), x = x0 + L.x.get(pos), barNo = Math.floor(pos / (beats * PPQ * 4 / unit));
      if (barNo !== lastBar) { acc = {}; lastBar = barNo; }
      if (n.r) { ties = []; const rm = mid + (st.restOffset || 0), ry = rm - (d >= 4 ? gap : 0); extent = Math.max(extent,rm + 18); if (d >= 2 && (ry > bottom || ry < top)) o += `<line x1="${x - 8}" y1="${ry}" x2="${x + 8}" y2="${ry}" class="ledger"/>`; o += rest(x, d, rm, gap); if (n.d?.endsWith('.')) o += `<circle cx="${x + 12}" cy="${rm - 4}" r="1.8" class="dotd"/>`; pos += length; return; }
      const ps = pitches(n).map(p => { const q = M.parse(p); return {...q, index:pitches(n).indexOf(p), st:stepOf(q.letter, q.octave), y:yOf(stepOf(q.letter, q.octave))}; }).sort((a, b) => a.st - b.st);
      const lo = ps[0], hi = ps[ps.length - 1], up = st.direction ? st.direction === 'up' : (lo.y + hi.y) / 2 > mid;
      extent = Math.max(extent,lo.y + (!up && d < 4 ? 34 : 18),aids.names ? bottom + 70 : bottom);
      for (let s = REF - 2; s >= lo.st; s -= 2) o += `<line x1="${x - 9}" y1="${yOf(s)}" x2="${x + 9}" y2="${yOf(s)}" class="ledger"/>`;
      for (let s = REF + 10; s <= hi.st; s += 2) o += `<line x1="${x - 9}" y1="${yOf(s)}" x2="${x + 9}" y2="${yOf(s)}" class="ledger"/>`;
      let ax = x - 16;
      ps.forEach((p, i) => {
        const k = p.letter + p.octave, cur = acc[k] ?? keyMap[p.letter] ?? 0;
        if (p.acc !== cur) { o += `<text x="${ax}" y="${p.y + 4}" class="acc">${ACC[p.acc]}</text>`; acc[k] = p.acc; ax -= 9; }
        const shift = i > 0 && p.st - ps[i - 1].st === 1 ? (up ? 11 : -11) : 0;
        o += n.harmonic ? `<path d="M${x + shift - 6} ${p.y} l6 -5 l6 5 l-6 5 z" class="harmonic"/>` : `<ellipse cx="${x + shift}" cy="${p.y}" rx="5.5" ry="4" transform="rotate(-20 ${x + shift} ${p.y})" class="head${d >= 2 ? ' open' : ''}"/>`;
        if (n.d?.endsWith('.')) o += `<circle cx="${x + 10 + shift}" cy="${p.y - (p.st % 2 === REF % 2 ? 3 : 0)}" r="1.8" class="dotd"/>`;
      });
      if (d < 4) {
        const sx = up ? x + 5 : x - 5, sy = up ? hi.y - 30 : lo.y + 30, from = up ? lo.y : hi.y;
        const flags = d < 1 ? (d < .5 ? 2 : 1) : 0;
        stems.push({sx,sy,from,up,flags,t:pos,end:pos + length,group:Math.floor(pos / (M.meter(sc.time).compound ? PPQ * 1.5 : PPQ))});
      }
      for (const tie of ties) {
        const target = ps.find(p => p.midi === tie.midi);
        if (target) o += arc(tie.x + 6,tie.y + side * 7,x - 6,target.y + side * 7);
      }
      if (pos === 0 && st.incoming) for (const p of ps) if (st.incoming.includes(p.midi)) o += arc(x0 - 24,p.y + side * 10,x - 6,p.y + side * 7);
      ties = n.tie ? ps.map(p => ({x,y:p.y,midi:p.midi})) : [];
      if (n.tuplet) tuplet = {x,y:Math.min(top - 10,hi.y - 42)};
      if (tuplet) tuplet.y = Math.min(tuplet.y,hi.y - 42);
      if (n.tupletEnd && tuplet) {
        o += `<path d="M${tuplet.x - 7} ${tuplet.y + 5} v-5 H${x + 7} v5" class="tuplet"/><text x="${(tuplet.x + x) / 2}" y="${tuplet.y - 3}" class="tuplet-number">3</text>`;
        tuplet = null;
      }
      if (n.slur) slur = {x,y:hi.y - 12};
      if (n.slurEnd && slur) { o += `<path d="M${slur.x} ${slur.y} Q${(slur.x + x) / 2} ${Math.min(slur.y,hi.y - 12) - 14} ${x} ${hi.y - 12}" class="slur"/>`; slur = null; }
      if (n.accent) o += `<text x="${x}" y="${Math.min(top - 8,hi.y - 34)}" class="accent">&gt;</text>`;
      if (n.bend) { const target = M.pcName(hi.midi + n.bend,false); o += `<path d="M${x + 8} ${hi.y - 4} Q${x + 28} ${hi.y - 8} ${x + 28} ${hi.y - 36} l-4 6 m4 -6 l4 6" class="bend"/><text x="${x + 28}" y="${hi.y - 42}" class="aid">${target}</text>`; }
      if (n.staccato) o += `<circle cx="${x}" cy="${lo.y + 12}" r="1.8" class="dotd"/>`;
      if (aids.names) o += `<text x="${x}" y="${bottom + 66}" class="aid">${ps.map(p => p.letter + (p.acc > 0 ? '#'.repeat(p.acc) : 'b'.repeat(-p.acc))).join(' ')}</text>`;
      if (aids.strings && sc.instrument === 'guitar') ps.forEach((p,i) => {
        const q = M.position(p.midi,{s:Array.isArray(n.s) ? n.s[p.index] : n.s,maxFret:sc.maxFret ?? 5,window:sc.stringWindow}), xx = x + (i - (ps.length - 1) / 2) * 15;
        if (q) o += `<circle cx="${xx}" cy="${top - 44}" r="7" class="strc"/><text x="${xx}" y="${top - 40.5}" class="strn">${6 - q.s}</text>`;
      });
      if (aids.fingers && n.fi != null) o += `<text x="${x}" y="${top - 58}" class="aid">${[].concat(n.fi).join('–')}</text>`;
      pos += length;
    });
    for (let i = 0; i < stems.length;) {
      const first = stems[i], group = [first]; let j = i + 1;
      while (first.flags && j < stems.length && stems[j].flags && stems[j].group === first.group && stems[j].up === first.up && stems[j - 1].end === stems[j].t) group.push(stems[j++]);
      const beamY = first.up ? Math.min(...group.map(s => s.sy)) : Math.max(...group.map(s => s.sy));
      group.forEach((s,k) => {
        o += `<line x1="${s.sx}" y1="${s.from}" x2="${s.sx}" y2="${group.length > 1 ? beamY : s.sy}" class="stem"/>`;
        if (group.length === 1) for (let f = 0; f < s.flags; f++) {
          const fy = s.sy + (s.up ? f * 7 : -f * 7);
          o += `<path d="M${s.sx} ${fy} c0 ${s.up ? 8 : -8} 12 ${s.up ? 10 : -10} 8 ${s.up ? 20 : -20} c2 ${s.up ? -7 : 7} -2 ${s.up ? -12 : 12} -8 ${s.up ? -14 : 14}" class="flag"/>`;
        }
        else for (let f = 0; f < s.flags; f++) {
          const next = group[k + 1], prev = group[k - 1], y = beamY + (s.up ? f * 6 : -f * 6);
          if (next?.flags > f) o += `<line x1="${s.sx}" y1="${y}" x2="${next.sx}" y2="${y}" class="beam"/>`;
          else if (!(prev?.flags > f)) o += `<line x1="${s.sx}" y1="${y}" x2="${s.sx + (next ? 9 : -9)}" y2="${y}" class="beam"/>`;
        }
      });
      i = j;
    }
    if (st.outgoing) for (const tie of ties) o += arc(tie.x + 6,tie.y + side * 7,x0 + L.end - 6,tie.y + side * 10);
    return {svg:o, bottom, extent};
  }

  function measures(sc) {
    const size = AM.music.meter(sc.time).len * PPQ;
    return [sc.notes || [],sc.bass || [],sc.inner || []].map(ns => {
      const bars = []; let pos = 0;
      for (const n of ns) {
        const length = ticks(n.d || 'q');
        if (pos % size + length > size) throw Error('Split notes across barlines with ties');
        (bars[Math.floor(pos / size)] ||= []).push(n); pos += length;
      }
      if (pos % size) throw Error('Incomplete measure');
      return bars;
    });
  }
  function references(sc) {
    const bars = measures(sc), lower = sc.bass ? bars[1] : sc.clef === 'bass' ? bars[0] : null;
    const tones = bars[0].map((_,b) => (lower?.[b] || []).reduce((out,n) => {
      const tone = n.r ? null : pitches(n).reduce((a,p) => !a || M.midi(p) < M.midi(a) ? p : a,null);
      if (out.at(-1) !== tone) out.push(tone); return out;
    },[]));
    const fixed = ts => { const ns = [...new Set(ts.filter(Boolean))]; return ns.length === 1 ? ns[0] : null; };
    return tones.map((ts,b) => {
      const tone = fixed(ts), pedal = tone && (fixed(tones[b - 1] || []) === tone || fixed(tones[b + 1] || []) === tone);
      const sounding = bars.some(voice => voice[b]?.some(n => !n.r));
      return {chord:sc.chords?.[b] || '',kind:lower ? pedal ? 'pedal' : 'bass' : sounding ? 'single' : 'rest',tones:ts};
    });
  }
  function barOrder(sc) {
    const count = measures(sc)[0].length, all = Array.from({length:count},(_,i) => i + 1), r = sc.repeat, j = sc.jump;
    const valid = n => Number.isInteger(n) && n >= 1 && n <= count;
    const range = (a,b) => all.filter(n => n >= a && n <= b);
    if (r && j) throw Error('Combined repeat and jump not supported');
    if (r) {
      if (!valid(r.from) || !valid(r.to) || r.from > r.to || !Number.isInteger(r.times || 2) || (r.times || 2) < 2 || (r.times || 2) > 4) throw Error('Invalid repeat');
      if (r.endings && (r.endings.length !== (r.times || 2) || r.endings.some((n,i) => !valid(n) || n !== r.to + i + 1))) throw Error('Invalid endings');
      return [...range(1,r.from - 1),...Array.from({length:r.times || 2},(_,i) => [...range(r.from,r.to),...(r.endings ? [r.endings[i]] : [])]).flat(),...range((r.endings?.at(-1) || r.to) + 1,count)];
    }
    if (j) {
      if (!valid(j.from) || !valid(j.to) || j.to >= j.from) throw Error('Invalid jump');
      if (j.coda) {
        if (!valid(j.coda) || !valid(j.codaAt) || j.coda <= j.from || j.codaAt < j.to || j.codaAt >= j.from) throw Error('Invalid coda');
        return [...range(1,j.from),...range(j.to,j.codaAt),...range(j.coda,count)];
      }
      if (!valid(j.fine) || j.fine < j.to || j.fine > j.from) throw Error('Invalid fine');
      return [...range(1,j.from),...range(j.to,j.fine)];
    }
    return all;
  }
  function render(el, sc, aids = {}, labels = {}) {
    const refs = references(sc);
    const barLen = AM.music.meter(sc.time).len * PPQ, bars = measures(sc), poly = sc.instrument === 'guitar' && !!sc.bass;
    const tr = sc.instrument === 'guitar' ? 7 : 0, x0 = 88 + M.keyAcc(sc.key || 'C').length * 9;
    const width = el.clientWidth || Infinity, count = bars[0].length;
    const makeStaves = (from,to) => {
      const voice = (i,clef,direction,overlay = false) => ({clef,direction,overlay,notes:bars[i].slice(from,to).flat(),incoming:bars[i][from - 1]?.at(-1)?.tie ? pitches(bars[i][from - 1].at(-1)).map(M.midi) : null,outgoing:to < count});
      const staves = [voice(0,sc.clef || 'treble',poly || sc.inner ? 'up' : null)];
      if (sc.bass) staves.push({...voice(1,poly ? 'treble' : 'bass',poly ? 'down' : null,poly),restOffset:poly ? 40 : 0});
      if (sc.inner) staves.push({...voice(2,'treble','down',true),restOffset:20});
      return staves;
    };
    let from = 0, html = '';
    while (from < count) {
      let to = from + 1;
      while (to < count && x0 + layout(makeStaves(from,to + 1),barLen).end + 16 <= width) to++;
      const staves = makeStaves(from,to), L = layout(staves,barLen), y0 = 88;
      let top = y0, out = '', lines = '', lastBottom = 0, contentBottom = 0;
      staves.forEach((st,i) => {
        if (st.overlay) top = y0;
        const r = staff(sc,st,L,top,i === 0 ? aids : poly ? {} : {...aids,strings:false},tr,sc.key || 'C',x0);
        if (!st.overlay) for (let k = 0; k < 5; k++) lines += `<line x1="8" y1="${top + k * 10}" x2="${x0 + L.end + 8}" y2="${top + k * 10}" class="staff"/>`;
        out += r.svg; contentBottom = Math.max(contentBottom,r.extent); lastBottom = Math.max(lastBottom,r.bottom); top = r.bottom + 106;
      });
      const xe = x0 + L.end;
      out += `<line x1="${xe}" y1="${y0}" x2="${xe}" y2="${lastBottom}" class="bar"/>`;
      if (to === count) out += `<line x1="${xe + 4}" y1="${y0}" x2="${xe + 4}" y2="${lastBottom}" class="bar thick"/>`;
      if (staves.length > 1 && !poly) out += `<line x1="8" y1="${y0}" x2="8" y2="${lastBottom}" class="bar"/>`;
      const referenceLines = refs.slice(from,to).map((ref,i) => {
        const names = ref.tones.map(p => p || labels.rest || '—').join(' → ');
        const text = ref.kind === 'single' && ref.chord ? '' : [labels[ref.kind],names].filter(Boolean).join(': ');
        const available = L.x.get((i + 1) * barLen) - L.x.get(i * barLen) - 16, lines = [];
        for (const word of text.split(' ').filter(Boolean)) {
          if (!lines.length || (lines.at(-1).length + word.length + 1) * 6 > available) lines.push(word);
          else lines[lines.length - 1] += ' ' + word;
        }
        return lines;
      });
      const referenceHeight = Math.max(1,...referenceLines.map(lines => lines.length)) * 14;
      for (let b = from; b < to; b++) {
        const x = x0 + L.x.get((b - from) * barLen), end = x0 + L.x.get((b + 1 - from) * barLen) - 14, number = b + 1;
        out += `<text x="${x}" y="14" class="measure">${number}</text>`;
        referenceLines[b - from].forEach((line,i) => { out += `<text x="${x}" y="${contentBottom + 24 + i * 14}" class="harmonic-reference">${esc(line)}</text>`; });
        if (sc.chords?.[b]) out += `<text x="${x}" y="${y0 - 18}" class="chord">${esc(sc.chords[b])}</text>`;
        if (sc.sections?.[b]) out += `<text x="${x + 24}" y="14" class="section">${esc(sc.sections[b])}</text>`;
        const repeat = sc.repeat;
        if (repeat?.from === number) out += `<text x="${x - 14}" y="${y0 + 28}" class="repeat">𝄆</text>`;
        if (repeat && (repeat.endings?.[0] || repeat.to) === number) out += `<text x="${end}" y="${y0 + 28}" class="repeat">𝄇</text>`;
        if (repeat?.endings?.includes(number)) out += `<path d="M${x} 31 v-8 H${end}" class="volta"/><text x="${x + 4}" y="36" class="measure">${repeat.endings.indexOf(number) + 1}.</text>`;
        const j = sc.jump;
        if (j?.to === number && j.to !== 1) out += `<text x="${x + 12}" y="${y0 - 64}" class="navigation">𝄋</text>`;
        if (j?.coda === number) out += `<text x="${x + 12}" y="${y0 - 64}" class="navigation">𝄌</text>`;
        if (j?.codaAt === number) out += `<text x="${x}" y="${contentBottom + referenceHeight + 44}" class="navigation">→ 𝄌</text>`;
        if (j?.fine === number) out += `<text x="${x}" y="${contentBottom + referenceHeight + 44}" class="navigation">Fine</text>`;
        if (j?.from === number) out += `<text x="${x}" y="${contentBottom + referenceHeight + 44}" class="navigation">${j.to === 1 ? 'D.C.' : 'D.S.'} al ${j.coda ? 'Coda' : 'Fine'}</text>`;
      }
      html += `<svg viewBox="0 0 ${xe + 16} ${contentBottom + referenceHeight + 66}" width="${xe + 16}" class="score" data-from="${from + 1}" data-to="${to}">${lines}${out}</svg>`;
      from = to;
    }
    el.innerHTML = html;
    return {beats:count * barLen / PPQ};
  }
  function rest(x, d, mid, gap) {
    if (d >= 4) return `<rect x="${x - 6}" y="${mid - gap}" width="12" height="5" class="rest"/>`;
    if (d >= 2) return `<rect x="${x - 6}" y="${mid - 5}" width="12" height="5" class="rest"/>`;
    if (d >= 1) return `<path d="M${x - 3} ${mid - 14} l 7 8 l -6 7 l 6 8 c -6 -3 -9 1 -5 6 c -6 -4 -6 -10 0 -10 l -5 -7 l 5 -6 z" class="rest"/>`;
    const extra = d < .5 ? `<path d="M${x + 1} ${mid - 1} c -2 5 -8 5 -8 1 c 0 -3 3 -3 4 -1" class="rest8"/>` : '';
    return extra + `<path d="M${x + 4} ${mid - 8} l -5 16 M${x + 4} ${mid - 8} c -2 5 -8 5 -8 1 c 0 -3 3 -3 4 -1" class="rest8"/>`;
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
    const ev = [], voices = sc.repeat || sc.jump ? measures(sc).map(bs => barOrder(sc).flatMap(b => bs[b - 1] || [])) : [sc.notes || [],sc.bass || [],sc.inner || []];
    const warp = t => { const q = t / PPQ, beat = Math.floor(q), f = q - beat; return sc.swing ? beat + (f <= .5 ? f * 4 / 3 : 2 / 3 + (f - .5) * 2 / 3) : q; };
    voices.forEach((notes,voice) => {
      if (!notes.length) return;
      let t = 0, held = new Map();
      notes.forEach(n => {
        const d = ticks(n.d || 'q'), next = new Map();
        if (!n.r) pitches(n).forEach(p => {
          const midi = M.midi(p), previous = held.get(midi);
          const e = previous || {t:warp(t),midi,dur:0,voice};
          e.dur += warp(t + d) - warp(t); if (!previous) ev.push(e);
          if (n.accent) e.accent = true;
          if (n.bend) e.bend = n.bend;
          if (n.staccato) e.dur *= .5;
          if (n.tie) next.set(midi,e);
        });
        held = next; t += d;
      });
    });
    return ev;
  };
  return {render,generate,dur,ticks,events,barOrder,measures,references};
})();
