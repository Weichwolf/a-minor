(() => {
  const M = AM.music, S = AM.store, $ = s => document.querySelector(s);
  const LBL = {type:'Typ', root:'Grundton', scale:'Skala', time:'Takt', drums:'Drums', show:'Anzeige', window:'Fenster', frets:'Bünde'};
  const KIND = {read:'Lesen', improv:'Improvisieren', shape:'Griffbrett', technique:'Technik', transcribe:'Transkription'};
  const AID = {names:'Tonnamen', strings:'Saiten', fingers:'Finger'};
  const esc = s => s.replace(/[&<>]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;'}[c]));
  const md = t => t.trim().split(/\n\s*\n/).map(b => /^- /m.test(b) ? '<ul>' + b.split('\n').map(l => '<li>' + inline(l.replace(/^- /, '')) + '</li>').join('') + '</ul>' : '<p>' + inline(b) + '</p>').join('');
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const units = AM.course.flatMap(p => p.units.map(u => ({...u, phase:p})));
  const progress = u => { const n = u.exercises.length; return n ? [u.exercises.filter(e => S.isDone(e.id)).length, n] : null; };
  let player = null, playerUI = null;

  function playerControls(cfg, tempo, label) {
    const c = {type:'drone', root:'E', scale:'aeolian', time:'4/4', bars:4, drums:'off', progression:['i','VII','VI','V'], ...cfg};
    const id = 'pl' + Math.random().toString(36).slice(2, 7), sel = (k, opts, v) => `<label>${LBL[k]}<select data-k="${k}">${opts.map(([a, b]) => `<option value="${a}"${a == v ? ' selected' : ''}>${b}</option>`).join('')}</select></label>`;
    const html = `<div class="player" id="${id}">
      <div class="row">
        <button class="play">▶ Start</button>
        <label>Tempo <input type="number" data-k="tempo" value="${tempo || 60}" min="30" max="240" style="width:4.5em"> bpm</label>
        ${sel('type', [['drone','Drone'],['loop','Akkordfolge'],['click','Klick']], c.type)}
        ${sel('root', 'C C# D Eb E F F# G Ab A Bb B'.split(' ').map(r => [r, r]), c.root)}
        ${sel('scale', Object.entries(M.SCALES).filter(([k]) => k !== 'chromatic').map(([k, v]) => [k, v.name]), c.scale)}
        ${sel('time', [['4/4','4/4'],['3/4','3/4'],['6/8','6/8'],['7/8','7/8'],['5/4','5/4']], c.time)}
        ${sel('drums', [['off','keine'],['half','Half-time'],['straight','Straight'],['double','Double-time']], c.drums)}
        <label>Takte <input type="number" data-k="bars" value="${c.bars}" min="1" max="32" style="width:3.5em"></label>
        <label class="prog">Folge <input data-k="progression" value="${c.progression.join(' ')}" style="width:9em" title="Stufen, z.B. i VII VI V"></label>
        <button class="midi" title="Als MIDI-Datei speichern">⬇ MIDI</button>
      </div>
      <div class="beats"></div></div>`;
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return;
      const read = () => { const o = {...c}; el.querySelectorAll('[data-k]').forEach(i => o[i.dataset.k] = i.dataset.k === 'progression' ? i.value.trim().split(/\s+/) : i.type === 'number' ? +i.value : i.value); return o; };
      const beatsEl = el.querySelector('.beats');
      const drawBeats = seq => { beatsEl.innerHTML = Array.from({length:seq.beats}, (_, i) => `<span>${i + 1}</span>`).join(''); };
      const start = () => {
        if (player) { player.stop(); if (playerUI && playerUI !== el) playerUI.querySelector('.play').textContent = '▶ Start'; }
        const o = read(), seq = AM.backing.build(o);
        player = new AM.audio.Player(); playerUI = el; player.load(seq, o.tempo); drawBeats(seq);
        player.onBeat = b => { const bi = Math.floor((b % seq.bar) / (seq.bar / seq.beats)); beatsEl.querySelectorAll('span').forEach((s, i) => s.classList.toggle('on', i === bi)); };
        player.play(); el.querySelector('.play').textContent = '■ Stop';
      };
      el.querySelector('.play').onclick = () => { if (player && player.playing && playerUI === el) { player.stop(); el.querySelector('.play').textContent = '▶ Start'; beatsEl.querySelectorAll('span').forEach(s => s.classList.remove('on')); } else start(); };
      el.querySelectorAll('[data-k]').forEach(i => i.onchange = () => { el.querySelector('.prog').style.display = read().type === 'loop' ? '' : 'none'; if (player && player.playing && playerUI === el) start(); });
      el.querySelector('.prog').style.display = c.type === 'loop' ? '' : 'none';
      el.querySelector('.midi').onclick = () => { const o = read(); AM.midi.download(AM.midi.write(AM.backing.build(o), o.tempo, 4), `${label || 'backing'}-${o.root}-${o.scale}-${o.tempo}.mid`); };
    });
    return html;
  }

  function fretboardControls(cfg) {
    const c = {root:'E', scale:'aeolian', show:'degree', frets:15, ...cfg}, id = 'fb' + Math.random().toString(36).slice(2, 7);
    const sel = (k, opts, v) => `<label>${LBL[k]}<select data-k="${k}">${opts.map(([a, b]) => `<option value="${a}"${a == v ? ' selected' : ''}>${b}</option>`).join('')}</select></label>`;
    const html = `<div class="fbwrap" id="${id}"><div class="row small">
      ${sel('root', 'C C# D Eb E F F# G Ab A Bb B'.split(' ').map(r => [r, r]), c.root)}
      ${sel('scale', Object.entries(M.SCALES).map(([k, v]) => [k, v.name]), c.scale)}
      ${sel('show', [['degree','Stufen'],['name','Namen']], c.show)}
      ${sel('window', [['','alle Saiten'],['0,2','E A D'],['1,3','A D G'],['2,4','D G C'],['3,5','G C F']], c.window ? c.window.join(',') : '')}
      ${sel('frets', [[5,5],[12,12],[15,15],[24,24]], c.frets)}
    </div><div class="fbsvg"></div></div>`;
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return;
      const draw = () => { const o = {...c}; delete o.pcs; el.querySelectorAll('[data-k]').forEach(i => o[i.dataset.k] = i.value); o.frets = +o.frets; o.window = o.window ? o.window.split(',').map(Number) : null; o.flats = M.usesFlats(o.root) || /b/.test(o.root); if (c.pcs && o.root === c.root && o.scale === c.scale) o.pcs = c.pcs; AM.fretboard.render(el.querySelector('.fbsvg'), o); };
      el.querySelectorAll('[data-k]').forEach(i => i.onchange = draw); draw();
    });
    return html;
  }

  function scoreBlock(ex) {
    const id = 'sc' + ex.id, aids = ex.aids || [];
    const html = `<div class="scorewrap" id="${id}"><div class="row small">
      ${Object.entries(AID).map(([k, v]) => `<label><input type="checkbox" data-aid="${k}"${aids.includes(k) ? ' checked' : ''}> ${v}</label>`).join('')}
      ${ex.generate ? '<button class="gen">↻ Neue Folge</button>' : ''}
      <button class="listen">▶ Anhören</button></div><div class="svg"></div></div>`;
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return;
      let notes = ex.generate ? AM.notation.generate(ex.generate) : ex.score.notes;
      const draw = () => { const a = {}; el.querySelectorAll('[data-aid]').forEach(i => a[i.dataset.aid] = i.checked); AM.notation.render(el.querySelector('.svg'), {...ex.score, notes}, a); };
      el.querySelectorAll('[data-aid]').forEach(i => i.onchange = draw);
      if (ex.generate) el.querySelector('.gen').onclick = () => { notes = AM.notation.generate(ex.generate); draw(); };
      el.querySelector('.listen').onclick = () => { const c = AM.audio.get(), spb = 60 / (ex.tempo || 60); let t = c.currentTime + .1; notes.forEach(n => { const d = AM.notation.dur(n.d || 'q') * spb; if (!n.r) AM.audio.tone(M.midi(n.p), t, d * .95, {vel:.3, bright:6}); t += d; }); };
      draw();
    });
    return html;
  }

  function exerciseCard(ex, unit) {
    const done = S.isDone(ex.id), logs = S.get().log.filter(l => l.ex === ex.id);
    return `<article class="ex${done ? ' done' : ''}" id="${ex.id}">
      <header><span class="kind k-${ex.kind}">${KIND[ex.kind] || ex.kind}</span><h3>${esc(ex.title)}</h3>${ex.tempo ? `<span class="tempo">♩ = ${ex.tempo}</span>` : ''}
        <label class="donebox"><input type="checkbox" data-done="${ex.id}"${done ? ' checked' : ''}> erledigt</label></header>
      <p>${inline(ex.instructions || '')}</p>
      ${ex.score ? scoreBlock(ex) : ''}
      ${ex.fretboard ? fretboardControls(ex.fretboard) : ''}
      ${ex.backing ? playerControls(ex.backing, ex.tempo, ex.id) : ''}
      ${ex.checklist ? '<ul class="check">' + ex.checklist.map(c => `<li>${esc(c)}</li>`).join('') + '</ul>' : ''}
      <details class="log"><summary>Log (${logs.length})</summary>
        <form data-log="${ex.id}"><input name="note" placeholder="Ein Fehler, den du gehört hast" required><button>Eintragen</button></form>
        <ul>${logs.map(l => `<li><span class="date">${l.date}</span> ${esc(l.note)}</li>`).join('')}</ul></details>
    </article>`;
  }

  const views = {
    home() {
      return `<h1>a-minor</h1><p class="lead">Improvisieren lernen in Quartenstimmung. Doom, Gothic, Barock. Vom Blatt, ohne Tabs.</p>
      <div class="phases">${AM.course.map((p, i) => { const ex = p.units.flatMap(u => u.exercises), d = ex.filter(e => S.isDone(e.id)).length;
        return `<a class="phase${p.planned ? ' planned' : ''}" href="#/phase/${p.id}"><div class="num">${i}</div><div><h2>${esc(p.title)}</h2><p>${esc(p.goal)}</p>
          <div class="meta">${p.units.length} Einheiten · ${ex.length ? `${d}/${ex.length} Übungen` : 'geplant'}</div></div></a>`; }).join('')}</div>`;
    },
    phase(id) {
      const p = AM.course.find(p => p.id === id), i = AM.course.indexOf(p);
      return `<nav class="crumbs"><a href="#/">Kurs</a> › Phase ${i}</nav><h1>Phase ${i}: ${esc(p.title)}</h1><p class="lead">${esc(p.goal)}</p>
      <div class="units">${p.units.map((u, j) => { const pr = progress(u); return `<a class="unit" href="#/unit/${u.id}"><div class="num">${i}.${j + 1}</div><div><h2>${esc(u.title)}</h2><p>${esc(u.goal)}</p>
        ${pr ? `<div class="bar"><div style="width:${pr[0] / pr[1] * 100}%"></div></div>` : '<div class="meta">geplant</div>'}</div></a>`; }).join('')}</div>`;
    },
    unit(id) {
      const u = units.find(u => u.id === id), pi = AM.course.indexOf(u.phase), ui = u.phase.units.findIndex(x => x.id === id), k = units.indexOf(u);
      const nav = `<nav class="pn">${k > 0 ? `<a href="#/unit/${units[k - 1].id}">‹ ${esc(units[k - 1].title)}</a>` : '<span></span>'}${k < units.length - 1 ? `<a href="#/unit/${units[k + 1].id}">${esc(units[k + 1].title)} ›</a>` : ''}</nav>`;
      return `<nav class="crumbs"><a href="#/">Kurs</a> › <a href="#/phase/${u.phase.id}">Phase ${pi}</a> › Einheit ${pi}.${ui + 1}</nav>
      <h1>${esc(u.title)}</h1><p class="lead">${esc(u.goal)}</p><div class="text">${md(u.text || '')}</div>
      ${u.exercises.length ? u.exercises.map(e => exerciseCard(e, u)).join('') : '<p class="planned">Übungen folgen. Neue Übungen in <code>data/course.js</code> eintragen.</p>'}${nav}`;
    },
    griffbrett() { return `<h1>Griffbrett</h1><p class="lead">E A D G C F. Jede Form gilt überall.</p>${fretboardControls({frets:15})}`; },
    player() { return `<h1>Backing</h1><p class="lead">Drone, Akkordfolge oder Klick. Tempo frei. MIDI-Export für den Looper oder die DAW.</p>${playerControls({type:'loop', drums:'half'}, 60, 'backing')}
      <div class="text"><p>Stufen für die Akkordfolge: römisch, Qualität ergibt sich aus der Skala. <b>i VII VI V</b> in Äolisch ergibt Em D C Bm. Für ein Dur-V Harmonisch Moll wählen.</p></div>`; },
    log() {
      const l = S.get().log, name = id => { const e = units.flatMap(u => u.exercises).find(e => e.id === id); return e ? e.title : id; };
      return `<h1>Log</h1><p class="lead">Ein Eintrag pro Übung und Tag. Ein Fehler, nicht fünf.</p>
      <div class="row"><button id="exp">Export JSON</button><label class="btn">Import <input type="file" id="imp" accept=".json" hidden></label></div>
      <table class="logt"><tr><th>Datum</th><th>Übung</th><th>Notiz</th><th></th></tr>${l.map((e, i) => `<tr><td>${e.date}</td><td><a href="#/unit/${units.find(u => u.exercises.some(x => x.id === e.ex))?.id}#${e.ex}">${esc(name(e.ex))}</a></td><td>${esc(e.note)}</td><td><button data-del="${i}" title="löschen">×</button></td></tr>`).join('')}</table>`;
    },
  };

  function route() {
    if (player) { player.stop(); player = null; }
    const [, v = 'home', id] = location.hash.replace(/^#\/?/, '').match(/^([^/]*)\/?([^#]*)/) || [];
    const main = $('main'); main.innerHTML = (views[v] || views.home)(id); window.scrollTo(0, 0);
    document.querySelectorAll('nav.top a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#/' + v || (v === 'home' && a.getAttribute('href') === '#/')));
    main.querySelectorAll('[data-done]').forEach(i => i.onchange = () => { S.toggleDone(i.dataset.done); i.closest('.ex').classList.toggle('done', i.checked); });
    main.querySelectorAll('form[data-log]').forEach(f => f.onsubmit = ev => { ev.preventDefault(); S.addLog({ex:f.dataset.log, note:f.note.value.trim()}); route(); location.hash = location.hash.split('#')[0] + '#' + f.dataset.log; });
    main.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { S.removeLog(+b.dataset.del); route(); });
    const exp = $('#exp'); if (exp) exp.onclick = () => { const a = document.createElement('a'); a.href = 'data:application/json,' + encodeURIComponent(S.export()); a.download = 'a-minor-log.json'; a.click(); };
    const imp = $('#imp'); if (imp) imp.onchange = () => imp.files[0].text().then(t => { S.import(t); route(); });
  }
  window.addEventListener('hashchange', route); route();
})();
