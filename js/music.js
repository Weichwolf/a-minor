window.AM = {};
AM.music = (() => {
  const LETTERS = 'CDEFGAB', LPC = [0, 2, 4, 5, 7, 9, 11];
  const SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  const TUNING = ['E2','A2','D3','G3','C4','F4'];
  const SCALES = {
    aeolian:       {name:'Äolisch (natürlich Moll)', iv:[0,2,3,5,7,8,10]},
    phrygian:      {name:'Phrygisch',               iv:[0,1,3,5,7,8,10]},
    harmonicMinor: {name:'Harmonisch Moll',         iv:[0,2,3,5,7,8,11]},
    dorian:        {name:'Dorisch',                 iv:[0,2,3,5,7,9,10]},
    major:         {name:'Dur (Ionisch)',           iv:[0,2,4,5,7,9,11]},
    lydian:        {name:'Lydisch',                 iv:[0,2,4,6,7,9,11]},
    chromatic:     {name:'Chromatisch',             iv:[0,1,2,3,4,5,6,7,8,9,10,11]},
  };
  const DEG = ['1','b2','2','b3','3','4','b5','5','b6','6','b7','7'];
  const KEYS = {
    'C':0,'G':1,'D':2,'A':3,'E':4,'B':5,'F#':6,'F':-1,'Bb':-2,'Eb':-3,'Ab':-4,'Db':-5,'Gb':-6,
    'Am':0,'Em':1,'Bm':2,'F#m':3,'C#m':4,'G#m':5,'Dm':-1,'Gm':-2,'Cm':-3,'Fm':-4,'Bbm':-5,'Ebm':-6,
  };
  const ROM = ['I','II','III','IV','V','VI','VII'];

  function parse(s) {
    const m = /^([A-G])([#b]*)(-?\d)$/.exec(s);
    if (!m) throw Error('Ungültige Note: ' + s);
    const acc = [...m[2]].reduce((a, c) => a + (c === '#' ? 1 : -1), 0);
    return {letter:m[1], acc, octave:+m[3], midi:(+m[3] + 1) * 12 + LPC[LETTERS.indexOf(m[1])] + acc};
  }
  const midi = s => parse(s).midi;
  const pc = m => ((m % 12) + 12) % 12;
  const pcName = (p, flats) => (flats ? FLAT : SHARP)[pc(p)];
  const name = (m, flats) => pcName(m, flats) + (Math.floor(m / 12) - 1);
  const rootPc = root => pc(midi(root + '2'));
  const usesFlats = k => (KEYS[k] ?? 0) < 0 || /b/.test(k);
  const keyAcc = k => { const n = KEYS[k] ?? 0; return n > 0 ? [...'FCGDAEB'.slice(0, n)].map(l => [l, 1]) : [...'BEADGCF'.slice(0, -n)].map(l => [l, -1]); };
  const scalePcs = (root, scale) => SCALES[scale].iv.map(i => pc(rootPc(root) + i));
  const degreeOf = (p, root) => DEG[pc(p - rootPc(root))];
  const fretMidi = (s, f) => midi(TUNING[s]) + f;
  function position(m, o = {}) {
    if (o.s != null) return {s:o.s, f:m - midi(TUNING[o.s])};
    let best = null;
    TUNING.forEach((t, s) => { const f = m - midi(t); if ((!o.window || s >= o.window[0] && s <= o.window[1]) && f >= 0 && f <= (o.maxFret ?? 24) && (!best || f < best.f)) best = {s, f}; });
    return best;
  }
  function chord(root, scale, deg) {
    const iv = SCALES[scale].iv, r = rootPc(root) + 36;
    const p = i => r + iv[(deg + i) % 7] + (deg + i >= 7 ? 12 : 0);
    const a = p(0), b = p(2), c = p(4), t = b - a, f = c - a;
    const q = t === 4 && f === 7 ? '' : t === 3 && f === 7 ? 'm' : t === 3 && f === 6 ? '°' : t === 4 && f === 8 ? '+' : '?';
    const roman = q === '' || q === '+' ? ROM[deg] + (q === '+' ? '+' : '') : ROM[deg].toLowerCase() + (q === '°' ? '°' : '');
    return {notes:[a, b, c], quality:q, roman};
  }
  const romanIndex = r => ROM.indexOf(r.replace(/[°+]/g, '').toUpperCase());
  return {LETTERS, TUNING, SCALES, DEG, KEYS, parse, midi, pc, pcName, name, rootPc, usesFlats, keyAcc, scalePcs, degreeOf, fretMidi, position, chord, romanIndex};
})();
