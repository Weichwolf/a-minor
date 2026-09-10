(() => {
  const M = AM.music, S = AM.store, $ = s => document.querySelector(s);
  const LBL = {type:'Typ', root:'Grundton', scale:'Skala', time:'Takt', drums:'Drums', show:'Anzeige', window:'Fenster', frets:'Bünde', range:'Bereich'};
  const KIND = {read:'Lesen', improv:'Improvisieren', shape:'Griffbrett', keys:'Klaviatur', technique:'Technik', transcribe:'Transkription', sound:'Sound'};
  const AID = {names:'Tonnamen', strings:'Saiten', fingers:'Finger'};
  const esc = s => s.replace(/[&<>]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;'}[c]));
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const md = t => t.trim().split(/\n\s*\n/).map(b => /^- /m.test(b) ? '<ul>' + b.split('\n').map(l => '<li>' + inline(l.replace(/^- /, '')) + '</li>').join('') + '</ul>' : '<p>' + inline(b) + '</p>').join('');
  const tracks = Object.entries(AM.tracks).map(([id, t]) => ({id, ...t}));
  const phases = tracks.flatMap(t => t.phases.map(p => ({...p, track:t})));
  const units = phases.flatMap(p => p.units.map(u => ({...u, phase:p, track:p.track})));
  const allEx = units.flatMap(u => u.exercises.map(e => ({...e, unit:u})));
  const progress = u => { const n = u.exercises.length; return n ? [u.exercises.filter(e => S.isDone(e.id)).length, n] : null; };
  const uid = p => p + Math.random().toString(36).slice(2, 7);
  const sel = (k, opts, v) => `<label>${LBL[k] || k}<select data-k="${k}">${opts.map(([a, b]) => `<option value="${a}"${a == v ? ' selected' : ''}>${b}</option>`).join('')}</select></label>`;
  const fmt = l => (l || []).map(t => typeof t === 'string' ? t : Array(t.bars).fill(['I','II','III','IV','V','VI','VII'][t.deg] + (t.q ? ':' + t.q : '')).join(' ')).join(' ');
  const ROOTS = 'C C# D Eb E F F# G Ab A Bb B'.split(' ').map(r => [r, r]);
  let player = null, playerUI = null, midiPorts = null;

  function midiControls() {
    if (!navigator.requestMIDIAccess) return '<div class="row small midi"><span>MIDI-Out</span><span class="mute">Browser ohne Web MIDI (Chrome oder Edge nötig)</span></div>';
    const o = AM.audio.out;
    return `<div class="row small midi"><span>MIDI-Out</span><select data-midi>${['<option value="">intern (Synth)</option>', ...(midiPorts || []).map(p => `<option value="${p.id}"${o.port && o.port.id === p.id ? ' selected' : ''}>${esc(p.name)}</option>`)].join('')}</select>
      <button class="rescan" title="Geräte neu suchen">↻</button><span class="mute" data-midi-status>${esc(o.status || 'suche…')}</span>
      <label><input type="checkbox" data-midi-drums${o.drums ? ' checked' : ''}> Drums Kanal 10</label><label><input type="checkbox" data-midi-backing${o.backing ? ' checked' : ''}> Bass/Pad Kanal 1/2</label>
      <label>Latenz <input type="number" data-midi-lat value="${o.latency}" style="width:4em"> ms</label></div>`;
  }
  function refreshMidi(ps) {
    midiPorts = ps;
    document.querySelectorAll('[data-midi]').forEach(x => { const v = x.value; x.innerHTML = '<option value="">intern (Synth)</option>' + ps.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join(''); x.value = ps.some(p => p.id === v) ? v : ''; });
    document.querySelectorAll('[data-midi-status]').forEach(x => x.textContent = AM.audio.out.status || '');
  }
  function bindMidi(el) {
    const s = el.querySelector('[data-midi]'); if (!s) return;
    AM.audio.out.onchange = refreshMidi;
    if (!midiPorts) AM.audio.midiInit().then(refreshMidi);
    el.querySelector('.rescan').onclick = () => { midiPorts = null; AM.audio.midiInit().then(refreshMidi); };
    s.onchange = () => AM.audio.midiSelect(s.value);
    el.querySelector('[data-midi-drums]').onchange = e => AM.audio.out.drums = e.target.checked;
    el.querySelector('[data-midi-backing]').onchange = e => AM.audio.out.backing = e.target.checked;
    el.querySelector('[data-midi-lat]').onchange = e => AM.audio.out.latency = +e.target.value;
  }

  function playerControls(cfg, tempo, label) {
    const c = {type:'drone', root:'E', scale:'aeolian', time:'4/4', bars:4, drums:'off', progression:['i','VII','VI','V'], ...cfg}, id = uid('pl');
    const html = `<div class="player" id="${id}">
      <div class="row">
        <button class="play">▶ Start</button>
        <label>Tempo <input type="number" data-k="tempo" value="${tempo || 60}" min="30" max="240" style="width:4.5em"> bpm</label>
        ${sel('type', [['drone','Drone'],['loop','Akkordfolge'],['click','Klick']], c.type)}
        ${sel('root', ROOTS, c.root)}
        ${sel('scale', Object.entries(M.SCALES).filter(([k]) => k !== 'chromatic').map(([k, v]) => [k, v.name]), c.scale)}
        ${sel('time', [['4/4','4/4'],['3/4','3/4'],['6/8','6/8'],['7/8','7/8'],['5/4','5/4']], c.time)}
        ${sel('drums', [['off','keine'],['half','Half-time'],['straight','Straight'],['double','Double-time']], c.drums)}
        <label>Takte <input type="number" data-k="bars" value="${c.bars}" min="1" max="32" style="width:3.5em"></label>
        <span class="prog"><label>A <input data-k="A" value="${fmt(c.parts?.A || c.progression)}" style="width:8em" title="Stufen, z.B. i VII VI V"></label>
        <label>B <input data-k="B" value="${fmt(c.parts?.B)}" style="width:8em"></label><label>C <input data-k="C" value="${fmt(c.parts?.C)}" style="width:8em"></label>
        <label>Form <input data-k="form" value="${c.form || 'A'}" style="width:5em" title="z.B. A B A C"></label></span>
        <button class="midi" title="Als MIDI-Datei speichern">⬇ MIDI</button>
      </div>${midiControls()}<div class="beats"></div></div>`;
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return;
      bindMidi(el);
      const read = () => { const o = {...c, parts:{}}; el.querySelectorAll('[data-k]').forEach(i => { const k = i.dataset.k; if ('ABC'.includes(k)) o.parts[k] = i.value.trim() ? i.value.trim().split(/\s+/) : []; else o[k] = i.type === 'number' ? +i.value : i.value; }); return o; };
      const beatsEl = el.querySelector('.beats'), playBtn = el.querySelector('.play');
      const grid = seq => { beatsEl.innerHTML = seq.steps.map((s, i) => `<span class="${s.bar ? 'b1' : ''}${s.sec ? ' sec' : ''}"><i>${s.sec || ''}</i><em>${s.roman}</em><b>${s.n}</b></span>`).join(''); };
      const start = () => {
        if (player) { player.stop(); if (playerUI && playerUI !== el) playerUI.querySelector('.play').textContent = '▶ Start'; }
        const o = read(), seq = AM.backing.build(o);
        player = new AM.audio.Player(); playerUI = el; player.load(seq, o.tempo);
        grid(seq);
        player.onBeat = b => beatsEl.querySelectorAll('span').forEach((s, i) => s.classList.toggle('on', i === b));
        player.play(); playBtn.textContent = '■ Stop';
      };
      playBtn.onclick = () => { if (player && player.playing && playerUI === el) { player.stop(); playBtn.textContent = '▶ Start'; beatsEl.querySelectorAll('span').forEach(s => s.classList.remove('on')); } else start(); };
      el.querySelectorAll('[data-k]').forEach(i => i.onchange = () => { el.querySelector('.prog').style.display = read().type === 'loop' ? '' : 'none'; if (player && player.playing && playerUI === el) start(); else grid(AM.backing.build(read())); });
      grid(AM.backing.build(read()));
      el.querySelector('.prog').style.display = c.type === 'loop' ? '' : 'none';
      el._set = cfg => { const full = {A:cfg.parts?.A || cfg.progression || ['i'], B:cfg.parts?.B || [], C:cfg.parts?.C || [], form:cfg.form || 'A', ...cfg}; el.querySelectorAll('[data-k]').forEach(i => { const k = i.dataset.k, v = full[k]; if (v == null) return; i.value = 'ABC'.includes(k) ? fmt(v) : v; }); el.querySelector('.prog').style.display = cfg.type === 'loop' ? '' : 'none'; start(); };
      el.querySelector('.midi').onclick = () => { const o = read(); AM.midi.download(AM.midi.write(AM.backing.build(o), o.tempo, 4), `${label || 'backing'}-${o.root}-${o.scale}-${o.tempo}.mid`); };
    });
    return html;
  }

  function fretboardControls(cfg) {
    const c = {root:'E', scale:'aeolian', show:'degree', frets:15, ...cfg}, id = uid('fb');
    const html = `<div class="fbwrap" id="${id}"><div class="row small">
      ${sel('root', ROOTS, c.root)}${sel('scale', Object.entries(M.SCALES).map(([k, v]) => [k, v.name]), c.scale)}${sel('show', [['degree','Stufen'],['name','Namen']], c.show)}
      ${sel('window', [['','alle Saiten'],['0,2','E A D'],['1,3','A D G'],['2,4','D G C'],['3,5','G C F']], c.window ? c.window.join(',') : '')}${sel('frets', [[5,5],[12,12],[15,15],[24,24]], c.frets)}
    </div><div class="fbsvg"></div></div>`;
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return;
      const draw = () => { const o = {...c}; delete o.pcs; el.querySelectorAll('[data-k]').forEach(i => o[i.dataset.k] = i.value); o.frets = +o.frets; o.window = o.window ? o.window.split(',').map(Number) : null; o.flats = M.usesFlats(o.root) || /b/.test(o.root); if (c.pcs && o.root === c.root && o.scale === c.scale) o.pcs = c.pcs; AM.fretboard.render(el.querySelector('.fbsvg'), o); };
      el.querySelectorAll('[data-k]').forEach(i => i.onchange = draw); draw();
    });
    return html;
  }

  function pianoControls(cfg) {
    const c = {root:'A', scale:'aeolian', show:'degree', ...cfg}, id = uid('pk');
    const html = `<div class="pkwrap" id="${id}"><div class="row small">
      ${sel('root', ROOTS, c.root)}${sel('scale', Object.entries(M.SCALES).map(([k, v]) => [k, v.name]), c.scale)}${sel('show', [['degree','Stufen'],['name','Namen']], c.show)}
      ${sel('window', [['','alle Tasten'],['C2,B3','linke Hand C2–B3'],['C4,C6','rechte Hand C4–C6'],['C3,C5','Mitte C3–C5']], c.window ? c.window.join(',') : '')}
    </div><div class="pksvg"></div></div>`;
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return;
      const draw = () => { const o = {...c}; delete o.pcs; el.querySelectorAll('[data-k]').forEach(i => o[i.dataset.k] = i.value); o.window = o.window ? o.window.split(',') : null; o.flats = M.usesFlats(o.root) || /b/.test(o.root); if (c.pcs && o.root === c.root && o.scale === c.scale) o.pcs = c.pcs; AM.piano.render(el.querySelector('.pksvg'), o); };
      el.querySelectorAll('[data-k]').forEach(i => i.onchange = draw); draw();
    });
    return html;
  }

  function scoreBlock(ex, instrument) {
    const id = 'sc' + ex.id, aids = ex.aids || [], aidKeys = Object.keys(AID).filter(k => k !== 'strings' || instrument === 'guitar');
    const html = `<div class="scorewrap" id="${id}"><div class="row small">
      ${aidKeys.map(k => `<label><input type="checkbox" data-aid="${k}"${aids.includes(k) ? ' checked' : ''}> ${AID[k]}</label>`).join('')}
      ${ex.generate ? '<button class="gen">↻ Neue Folge</button>' : ''}<button class="listen">▶ Anhören</button></div><div class="svg"></div></div>`;
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return;
      let notes = ex.generate ? AM.notation.generate(ex.generate) : ex.score.notes;
      const sc = () => ({...ex.score, notes, instrument});
      const draw = () => { const a = {}; el.querySelectorAll('[data-aid]').forEach(i => a[i.dataset.aid] = i.checked); AM.notation.render(el.querySelector('.svg'), sc(), a); };
      el.querySelectorAll('[data-aid]').forEach(i => i.onchange = draw);
      if (ex.generate) el.querySelector('.gen').onclick = () => { notes = AM.notation.generate(ex.generate); draw(); };
      el.querySelector('.listen').onclick = () => { const c = AM.audio.get(), spb = 60 / (ex.tempo || 60), t0 = c.currentTime + .1; AM.notation.events(sc()).forEach(e => AM.audio.tone(e.midi, t0 + e.t * spb, e.dur * spb * .95, {vel:.28, bright:6})); };
      draw();
    });
    return html;
  }

  function exerciseCard(ex, unit) {
    const done = S.isDone(ex.id), logs = S.get().log.filter(l => l.ex === ex.id), ins = unit.track.instrument;
    return `<article class="ex${done ? ' done' : ''}" id="${ex.id}">
      <header><span class="kind k-${ex.kind}">${KIND[ex.kind] || ex.kind}</span><h3>${esc(ex.title)}</h3>${ex.tempo ? `<span class="tempo">♩ = ${ex.tempo}</span>` : ''}
        <label class="donebox"><input type="checkbox" data-done="${ex.id}"${done ? ' checked' : ''}> erledigt</label></header>
      <p>${inline(ex.instructions || '')}</p>
      ${ex.score ? scoreBlock(ex, ins) : ''}${ex.fretboard ? fretboardControls(ex.fretboard) : ''}${ex.piano ? pianoControls(ex.piano) : ''}
      ${ex.backing ? playerControls(ex.backing, ex.tempo, ex.id) : ''}
      ${ex.checklist ? '<ul class="check">' + ex.checklist.map(c => `<li>${esc(c)}</li>`).join('') + '</ul>' : ''}
      <details class="log"><summary>Log (${logs.length})</summary>
        <form data-log="${ex.id}"><input name="note" placeholder="Ein Fehler, den du gehört hast" required><button>Eintragen</button></form>
        <ul>${logs.map(l => `<li><span class="date">${l.date}</span> ${esc(l.note)}</li>`).join('')}</ul></details></article>`;
  }

  const phaseCard = (p, i) => { const ex = p.units.flatMap(u => u.exercises), d = ex.filter(e => S.isDone(e.id)).length;
    return `<a class="phase${p.planned ? ' planned' : ''}" href="#/phase/${p.id}"><div class="num">${i}</div><div><h2>${esc(p.title)}</h2><p>${esc(p.goal)}</p><div class="meta">${p.units.length} Einheiten · ${ex.length ? `${d}/${ex.length} Übungen` : 'geplant'}</div></div></a>`; };

  const views = {
    home() {
      return `<h1>a-minor</h1><p class="lead">Improvisieren lernen. Doom, Gothic, Barock. Vom Blatt, ohne Tabs. Zwei Tracks, ein Kurs.</p>
      <div class="tracks">${tracks.map(t => `<a class="track" href="#/track/${t.id}"><h2>${esc(t.title)}</h2><p>${esc(t.lead)}</p><div class="meta">${t.phases.length} Phasen</div></a>`).join('')}</div>`;
    },
    track(id) {
      const t = tracks.find(t => t.id === id);
      return `<nav class="crumbs"><a href="#/">Kurs</a> › ${esc(t.title)}</nav><h1>${esc(t.title)}</h1><p class="lead">${esc(t.lead)}</p><div class="phases">${t.phases.map(phaseCard).join('')}</div>`;
    },
    phase(id) {
      const p = phases.find(p => p.id === id), i = p.track.phases.indexOf(p.track.phases.find(x => x.id === id));
      return `<nav class="crumbs"><a href="#/">Kurs</a> › <a href="#/track/${p.track.id}">${esc(p.track.title)}</a> › Phase ${i}</nav><h1>Phase ${i}: ${esc(p.title)}</h1><p class="lead">${esc(p.goal)}</p>
      <div class="units">${p.units.map((u, j) => { const pr = progress(u); return `<a class="unit" href="#/unit/${u.id}"><div class="num">${i}.${j + 1}</div><div><h2>${esc(u.title)}</h2><p>${esc(u.goal)}</p>
        ${pr ? `<div class="bar"><div style="width:${pr[0] / pr[1] * 100}%"></div></div>` : '<div class="meta">geplant</div>'}</div></a>`; }).join('')}</div>`;
    },
    unit(id) {
      const u = units.find(u => u.id === id), tu = units.filter(x => x.track === u.track), k = tu.indexOf(u), pi = u.track.phases.findIndex(p => p.id === u.phase.id), ui = u.phase.units.findIndex(x => x.id === id);
      const nav = `<nav class="pn">${k > 0 ? `<a href="#/unit/${tu[k - 1].id}">‹ ${esc(tu[k - 1].title)}</a>` : '<span></span>'}${k < tu.length - 1 ? `<a href="#/unit/${tu[k + 1].id}">${esc(tu[k + 1].title)} ›</a>` : ''}</nav>`;
      return `<nav class="crumbs"><a href="#/">Kurs</a> › <a href="#/track/${u.track.id}">${esc(u.track.title)}</a> › <a href="#/phase/${u.phase.id}">Phase ${pi}</a> › Einheit ${pi}.${ui + 1}</nav>
      <h1>${esc(u.title)}</h1><p class="lead">${esc(u.goal)}</p><div class="text">${md(u.text || '')}</div>
      ${u.exercises.length ? u.exercises.map(e => exerciseCard(e, u)).join('') : `<p class="planned">Übungen folgen. Neue Übungen in <code>data/${u.track.id}.js</code> eintragen.</p>`}${nav}`;
    },
    griffbrett() { return `<h1>Griffbrett</h1><p class="lead">E A D G C F. Jede Form gilt überall.</p>${fretboardControls({frets:15})}`; },
    klaviatur() { return `<h1>Klaviatur</h1><p class="lead">49 Tasten, C2 bis C6. Jede Tonart hat ihre eigene Form.</p>${pianoControls({root:'A'})}`; },
    player() { return `<h1>Backing</h1><p class="lead">Templates mit Variationen. Was es ist, warum es funktioniert. Klick lädt in den Player, Tempo und Rest bleiben frei.</p>
      <div class="sticky">${playerControls({type:'loop', drums:'half'}, 60, 'backing')}</div>
      ${AM.backings.map(t => `<section class="tpl"><h2>${esc(t.title)}</h2><p class="what">${esc(t.what)}</p><p class="why">${esc(t.why)}</p>
        <div class="vars">${t.variations.map((v, i) => `<button class="var" data-tpl="${t.id}" data-var="${i}"><b>${esc(v.title)}</b><span>${esc(v.note)}</span></button>`).join('')}</div></section>`).join('')}
      <div class="text"><p>Stufen römisch, Groß = Dur, Klein = Moll, Qualität kommt aus der Skala. Erzwingen mit <b>V:maj</b>, <b>v:min</b>, <b>vii:dim</b>. In Phrygisch ist <b>II</b> der bII-Akkord, weil die Skala ihn so liefert.</p>
      <p>MIDI-Out: Drums als GM-Drumset auf Kanal 10 (Kick 36, Snare 38, Hi-Hat 42, Klick 37). Bass Kanal 1, Pad Kanal 2. Sounds am Gerät wählen.</p></div>`; },
    log() {
      const l = S.get().log, name = id => allEx.find(e => e.id === id)?.title || id;
      return `<h1>Log</h1><p class="lead">Ein Eintrag pro Übung und Tag. Ein Fehler, nicht fünf.</p>
      <div class="row"><button id="exp">Export JSON</button><label class="btn">Import <input type="file" id="imp" accept=".json" hidden></label></div>
      <table class="logt"><tr><th>Datum</th><th>Übung</th><th>Notiz</th><th></th></tr>${l.map((e, i) => `<tr><td>${e.date}</td><td><a href="#/unit/${allEx.find(x => x.id === e.ex)?.unit.id}#${e.ex}">${esc(name(e.ex))}</a></td><td>${esc(e.note)}</td><td><button data-del="${i}" title="löschen">×</button></td></tr>`).join('')}</table>`;
    },
  };

  function route() {
    if (player) { player.stop(); player = null; }
    const [, v = 'home', id] = location.hash.replace(/^#\/?/, '').match(/^([^/]*)\/?([^#]*)/) || [];
    const main = $('main'); main.innerHTML = (views[v] || views.home)(id); window.scrollTo(0, 0);
    document.querySelectorAll('nav.top a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#/' + v || (['home', 'track', 'phase', 'unit'].includes(v) && a.getAttribute('href') === '#/')));
    main.querySelectorAll('[data-done]').forEach(i => i.onchange = () => { S.toggleDone(i.dataset.done); i.closest('.ex').classList.toggle('done', i.checked); });
    main.querySelectorAll('form[data-log]').forEach(f => f.onsubmit = ev => { ev.preventDefault(); S.addLog({ex:f.dataset.log, note:f.note.value.trim()}); route(); location.hash = location.hash.split('#')[0] + '#' + f.dataset.log; });
    main.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { S.removeLog(+b.dataset.del); route(); });
    main.querySelectorAll('[data-tpl]').forEach(b => b.onclick = () => { const t = AM.backings.find(t => t.id === b.dataset.tpl), v = t.variations[+b.dataset.var]; main.querySelectorAll('.var').forEach(x => x.classList.toggle('on', x === b)); $('.player')._set(v.cfg); });
    const exp = $('#exp'); if (exp) exp.onclick = () => { const a = document.createElement('a'); a.href = 'data:application/json,' + encodeURIComponent(S.export()); a.download = 'a-minor-log.json'; a.click(); };
    const imp = $('#imp'); if (imp) imp.onchange = () => imp.files[0].text().then(t => { S.import(t); route(); });
  }
  window.addEventListener('hashchange', route); route();
})();
