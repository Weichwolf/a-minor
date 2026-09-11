(async () => {
  try { await AM.i18n.ready; } catch (error) {
    document.querySelector('main').textContent = 'Kurs nicht geladen / Course could not load. Use localhost or HTTPS. ' + error.message;
    return;
  }
  const I = AM.i18n, t = I.t, S = AM.store, $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const md = text => text.trim().split(/\n\s*\n/).map(b => /^- /m.test(b) ? '<ul>' + b.split('\n').map(l => '<li>' + inline(l.replace(/^- /, '')) + '</li>').join('') + '</ul>' : '<p>' + inline(b) + '</p>').join('');
  let tracks, phases, units, allEx, player, playerUI, serial = 0;
  const generated = new Map(), scoreDraws = new Set();
  const progress = u => [u.exercises.filter(e => S.isDone(e.id)).length, u.exercises.length];
  function stop() {
    resetPreview(); AM.audio.silence(); player?.stop();
    if (playerUI?.isConnected) playerUI.querySelector('.play').textContent = t('start');
    player = null; playerUI = null;
    document.querySelectorAll('.beats .on').forEach(e => e.classList.remove('on'));
  }
  function index() {
    tracks = Object.entries(I.tracks()).map(([id, track]) => ({id,...track}));
    phases = tracks.flatMap(track => track.phases.map(p => ({...p,track})));
    units = phases.flatMap(phase => phase.units.map(u => ({...u,phase,track:phase.track})));
    allEx = units.flatMap(unit => unit.exercises.map(e => ({...e,unit})));
  }
  function playerControls(cfg, tempo) {
    const c = {time:'4/4',bars:4,drums:'half',...cfg}, meter = AM.music.meter(c.time,c.groups), id = 'pl' + serial++;
    const html = `<div class="player" id="${id}"><div class="row"><button class="play">${t('start')}</button>
      <label>${t('tempo')} <input type="number" value="${tempo || 60}" min="30" max="160" step="1"> ${meter.symbol}/min</label>
      <label>${t('accompaniment')} <select><option value="click">${t('click')}</option><option value="drums"${c.type === 'drums' ? ' selected' : ''}>${t('drums')}</option></select></label>
      <span>${c.time} · ${c.bars} ${t('bars')}</span></div><p class="status small" role="status"></p><div class="beats"></div></div>`;
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return;
      const button = el.querySelector('.play'), input = el.querySelector('input'), select = el.querySelector('select'), status = el.querySelector('.status');
      const seq = () => AM.backing.build({...c,type:select.value});
      const grid = () => { const current = seq(); el.querySelector('.beats').innerHTML = current.steps.map((s,i) => `<span class="${s.strong ? 'b1' : ''}"><em>${Math.floor(i / current.beats) + 1}</em><b>${i % current.beats + 1}</b></span>`).join(''); };
      const start = () => {
        stop(); if (!input.reportValidity() || !Number.isFinite(input.valueAsNumber)) return;
        if (AM.audio.out.port?.state !== 'connected') { status.innerHTML = `<a href="#/midi">${t('connectFirst')}</a>`; return; }
        status.textContent = AM.audio.out.port.name;
        player = new AM.audio.Player(); playerUI = el; player.load(seq(),input.valueAsNumber);
        player.onBeat = b => el.querySelectorAll('.beats span').forEach((e,i) => e.classList.toggle('on',i === b));
        player.onError = error => { stop(); status.textContent = t(error.message) || t('playError'); };
        button.textContent = t('stop'); player.play();
      };
      button.onclick = () => playerUI === el ? stop() : start();
      input.onchange = select.onchange = () => { const active = playerUI === el; if (el.closest('.ex')?.querySelector('.listen[data-playing]')) stop(); grid(); if (active) start(); };
      status.innerHTML = AM.audio.out.port ? esc(AM.audio.out.port.name) : `<a href="#/midi">${t('midiSetup')}</a>`;
      grid();
    });
    return html;
  }
  function diagram(cfg,type) {
    const id = 'diagram' + serial++;
    setTimeout(() => { const el = document.getElementById(id); if (el) AM[type].render(el,{...cfg,flats:AM.music.usesFlats(cfg.root)}); });
    return `<details class="diagram"><summary>${t(type)}</summary><div id="${id}"></div></details>`;
  }
  function scoreBlock(ex,instrument) {
    const id = 'sc' + ex.id, aids = ex.aids || [];
    const html = `<div class="scorewrap" id="${id}"><div class="row small">${aids.length ? `<label><input type="checkbox" data-aid> ${t('aids')}</label>` : ''}
      ${ex.generate ? `<button class="gen">${t('generate')}</button>` : ''}<button class="listen">${t('listen')}</button><span>${t('preview')}</span></div><div class="svg"></div>${ex.score.swing ? `<p class="small">${t('swingFeel')}</p>` : ''}${ex.score.repeat || ex.score.jump ? `<p class="small">${t('playOrder')}: ${AM.notation.barOrder(ex.score).join(' → ')}</p>` : ''}</div>`;
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return;
      const generate = () => AM.notation.generate({...ex.generate,time:ex.score.time});
      if (ex.generate && !generated.has(ex.id)) generated.set(ex.id,generate());
      const sc = () => ({...ex.score,notes:ex.generate ? generated.get(ex.id) : ex.score.notes,instrument});
      const draw = () => AM.notation.render(el.querySelector('.svg'),sc(),Object.fromEntries(aids.map(k => [k,!!el.querySelector('[data-aid]')?.checked])));
      el.querySelector('[data-aid]')?.addEventListener('change',draw);
      el.querySelector('.gen')?.addEventListener('click',() => { stop(); generated.set(ex.id,generate()); draw(); });
      el.querySelector('.listen').onclick = () => {
        const button = el.querySelector('.listen');
        if (button.dataset.playing) { stop(); return; }
        stop(); const bpm = el.closest('.ex')?.querySelector('.player input[type=number]')?.valueAsNumber || ex.tempo || 60, c = AM.audio.get(), spb = 60 / Math.min(160,Math.max(30,bpm)) / AM.music.meter(ex.score.time).q, events = AM.notation.events(sc()), t0 = c.currentTime + .1;
        button.dataset.playing = 'true'; button.textContent = t('stop');
        events.forEach(e => AM.audio.tone(e.midi,t0 + e.t * spb,e.dur * spb * .98,{vel:(e.voice === 1 ? .13 : e.voice === 2 ? .17 : .24) * (e.accent ? 1.35 : 1),bend:e.bend}));
        const duration = AM.notation.barOrder(sc()).length * AM.music.meter(ex.score.time).len;
        previewTimer = setTimeout(resetPreview,(duration * spb + .2) * 1000);
      };
      scoreDraws.add(draw); draw();
    });
    return html;
  }
  let previewTimer;
  function resetPreview() {
    clearTimeout(previewTimer);
    document.querySelectorAll('.listen[data-playing]').forEach(b => { delete b.dataset.playing; b.textContent = t('listen'); });
  }
  function exerciseCard(ex,unit) {
    const done = S.isDone(ex.id), logs = S.get().log.filter(l => l.ex === ex.id);
    return `<article class="ex${done ? ' done' : ''}" id="${ex.id}"><header><span class="kind k-${ex.kind}">${t(ex.kind)}</span><h3>${esc(ex.title)}</h3>
      <label class="donebox"><input type="checkbox" data-done="${ex.id}"${done ? ' checked' : ''}> ${t('mastered')}</label></header>
      ${ex.position ? `<p class="position">${esc(ex.position)}</p>` : ''}<p>${inline(ex.instructions || '')}</p>
      ${ex.score ? scoreBlock(ex,unit.track.instrument) : ''}${ex.fretboard ? diagram(ex.fretboard,'fretboard') : ''}${ex.piano ? diagram(ex.piano,'piano') : ''}
      ${ex.backing ? playerControls(ex.backing,ex.tempo) : ''}<ul class="check">${(ex.checklist || []).map(c => `<li>${esc(c)}</li>`).join('')}</ul>
      <details class="log"><summary>${t('log')} (${logs.length})</summary><form data-log="${ex.id}"><input name="note" aria-label="${t('note')}" placeholder="${t('logPlaceholder')}" required><button>${t('save')}</button></form>
      <ul>${logs.map(l => `<li><span class="date">${esc(l.date)}</span> ${esc(l.note)}</li>`).join('')}</ul></details></article>`;
  }
  const phaseCard = (p,i) => {
    const ex = p.units.flatMap(u => u.exercises), done = ex.filter(e => S.isDone(e.id)).length;
    return `<a class="phase${p.planned ? ' planned' : ''}" href="#/phase/${p.id}"><div class="num">${i}</div><div><h2>${esc(p.title)}</h2><p>${esc(p.goal)}</p><div class="meta">${p.units.length} ${t('units')} · ${ex.length ? `${done}/${ex.length} ${t('exercises')}` : t('planned')}</div></div></a>`;
  };
  const courseLink = () => `<a href="#/">${t('course')}</a>`;
  const views = {
    home:() => `<h1>a-minor</h1><p class="lead">${t('lead')}</p><div class="text"><h2>${t('week')}</h2>${md(t('schedule'))}</div>
      <div class="tracks">${tracks.map(track => `<a class="track" href="#/track/${track.id}"><h2>${esc(track.title)}</h2><p>${esc(track.lead)}</p><div class="meta">${t('scope')}</div></a>`).join('')}</div>`,
    track(id) {
      const track = tracks.find(x => x.id === id); if (!track) return views.home();
      return `<nav class="crumbs">${courseLink()} › ${esc(track.title)}</nav><h1>${esc(track.title)}</h1><p class="lead">${esc(track.lead)}</p><div class="phases">${track.phases.map(phaseCard).join('')}</div>`;
    },
    phase(id) {
      const p = phases.find(x => x.id === id); if (!p) return views.home(); const i = p.track.phases.findIndex(x => x.id === id);
      return `<nav class="crumbs">${courseLink()} › <a href="#/track/${p.track.id}">${esc(p.track.title)}</a> › ${t('phase')} ${i}</nav><h1>${t('phase')} ${i}: ${esc(p.title)}</h1><p class="lead">${esc(p.goal)}</p>
        <div class="units">${p.units.map((u,j) => { const [d,n] = progress(u); return `<a class="unit" href="#/unit/${u.id}"><div class="num">${i}.${j + 1}</div><div><h2>${esc(u.title)}</h2><p>${esc(u.goal)}</p>${n ? `<div class="meta">${d}/${n} ${t('exercises')}</div><div class="bar"><div style="width:${d / n * 100}%"></div></div>` : `<div class="meta">${t('planned')}</div>`}</div></a>`; }).join('')}</div>`;
    },
    unit(id) {
      const u = units.find(x => x.id === id); if (!u) return views.home();
      const siblings = units.filter(x => x.track === u.track && !x.phase.planned), k = siblings.indexOf(u), pi = u.track.phases.findIndex(p => p.id === u.phase.id);
      return `<nav class="crumbs">${courseLink()} › <a href="#/track/${u.track.id}">${esc(u.track.title)}</a> › <a href="#/phase/${u.phase.id}">${t('phase')} ${pi}</a></nav>
        <h1>${esc(u.title)}</h1><p class="lead">${esc(u.goal)}</p><div class="text">${md(u.text || '')}</div>
        ${u.exercises.length ? u.exercises.map(e => exerciseCard(e,u)).join('') : `<p>${t('plannedDetail')}</p>`}
        <nav class="pn">${k > 0 ? `<a href="#/unit/${siblings[k - 1].id}">‹ ${esc(siblings[k - 1].title)}</a>` : '<span></span>'}${k >= 0 && k < siblings.length - 1 ? `<a href="#/unit/${siblings[k + 1].id}">${esc(siblings[k + 1].title)} ›</a>` : ''}</nav>`;
    },
    midi:() => `<h1>MIDI</h1><p>${t('midiLead')}</p><div class="row"><button id="connect">${t('findOutputs')}</button><label>${t('output')} <select id="output"><option value="">${t('chooseDevice')}</option></select></label></div>
      <p id="midi-status" role="status"></p><div class="text">${md(t('hardware'))}</div><p><a href="https://www.alesis.com/rscdn/919/documents/sr18_reference_manual_reve.pdf">SR-18 · System Setup</a> · <a href="https://mx.yamaha.com/files/download/other_assets/0/892960/mx49mx61mx88_en_rm_b0.pdf">MX49 · Reference Manual</a></p>
      ${playerControls({type:'drums',drums:'half',time:'4/4',bars:2},60)}<p>${t('midiTest')}</p>`,
    log() {
      return `<h1>${t('log')}</h1><p class="lead">${t('logLead')}</p><div class="row"><button id="exp">${t('export')}</button><label class="btn">${t('import')} <input type="file" id="imp" accept=".json" hidden></label></div>
      <p id="import-status" role="status"></p><table class="logt"><tr><th>${t('date')}</th><th>${t('exercise')}</th><th>${t('note')}</th><th></th></tr>${S.get().log.map((e,i) => { const ex = allEx.find(x => x.id === e.ex); return `<tr><td>${esc(e.date)}</td><td>${ex ? `<a href="#/unit/${ex.unit.id}#${ex.id}">${esc(ex.title)}</a>` : esc(e.ex)}</td><td>${esc(e.note)}</td><td><button data-del="${esc(e.id)}" aria-label="${t('delete')}">×</button></td></tr>`; }).join('')}</table>`;
    }
  };
  function route() {
    stop(); resetPreview(); scoreDraws.clear();
    const [,v = 'home',id] = location.hash.replace(/^#\/?/,'').match(/^([^/]*)\/?([^#]*)/) || [];
    const main = $('main'); main.innerHTML = (Object.hasOwn(views,v) ? views[v] : views.home)(id); window.scrollTo(0,0);
    document.querySelectorAll('[data-text]').forEach(e => e.textContent = t(e.dataset.text));
    main.querySelectorAll('[data-done]').forEach(i => i.onchange = () => { try { S.toggleDone(i.dataset.done); i.closest('.ex').classList.toggle('done',i.checked); } catch { i.checked = !i.checked; report(t('saveError')); } });
    main.querySelectorAll('form[data-log]').forEach(f => f.onsubmit = ev => {
      ev.preventDefault(); const note = f.elements.note.value.trim(); if (!note) return;
      try { S.addLog({ex:f.dataset.log,note}); } catch { report(t('saveError')); return; }
      location.hash = location.hash.split('#').slice(0,2).join('#') + '#' + f.dataset.log; route();
    });
    main.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { try { S.removeLog(b.dataset.del); route(); } catch { report(t('saveError')); } });
    const output = $('#output');
    if (output) {
      const refresh = ps => {
        if (!output.isConnected) return;
        output.innerHTML = `<option value="">${t('chooseDevice')}</option>` + ps.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
        output.value = AM.audio.out.port?.id || '';
        $('#midi-status').textContent = (t(AM.audio.out.status) || t('findHint')) + (AM.audio.out.port ? ': ' + AM.audio.out.port.name : '');
      };
      refresh(AM.audio.out.access ? [...AM.audio.out.access.outputs.values()].filter(p => p.state === 'connected') : []);
      AM.audio.out.onchange = ps => { if (AM.audio.out.port?.state !== 'connected') stop(); refresh(ps); };
      $('#connect').onclick = () => AM.audio.midiInit().then(refresh);
      output.onchange = () => { stop(); AM.audio.midiSelect(output.value); refresh(AM.audio.out.access ? [...AM.audio.out.access.outputs.values()].filter(p => p.state === 'connected') : []); };
    }
    const anchor = location.hash.split('#')[2]; if (anchor) document.getElementById(anchor)?.scrollIntoView();
    $('#exp')?.addEventListener('click',() => { const a = document.createElement('a'); a.href = 'data:application/json,' + encodeURIComponent(S.export()); a.download = 'a-minor-log.json'; a.click(); });
    const imp = $('#imp'); if (imp) imp.onchange = () => { const file = imp.files[0]; if (file) file.text().then(text => { S.import(text); route(); }).catch(() => { if ($('#import-status')) $('#import-status').textContent = t('importError'); }); };
  }
  function report(message) { $('#app-status').textContent = message; }
  $('#language').value = I.language;
  $('#language').onchange = e => { stop(); resetPreview(); I.set(e.target.value); index(); route(); };
  document.addEventListener('visibilitychange',() => { if (document.hidden) { stop(); resetPreview(); } });
  let resizeFrame;
  window.addEventListener('resize',() => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(() => scoreDraws.forEach(draw => draw())); });
  window.addEventListener('pagehide',stop); window.addEventListener('hashchange',route);
  S.subscribe(source => {
    if (source !== 'remote') return;
    document.querySelectorAll('[data-done]').forEach(e => { e.checked = S.isDone(e.dataset.done); e.closest('.ex').classList.toggle('done',e.checked); });
    const logs = S.get().log;
    document.querySelectorAll('form[data-log]').forEach(form => {
      const entries = logs.filter(e => e.ex === form.dataset.log), details = form.closest('details');
      details.querySelector('summary').textContent = `${t('log')} (${entries.length})`;
      details.querySelector('ul').innerHTML = entries.map(e => `<li><span class="date">${esc(e.date)}</span> ${esc(e.note)}</li>`).join('');
    });
    if (/^#\/(log|phase|track)(?:\/|$)/.test(location.hash)) route();
    report(t('remoteUpdate'));
  });
  I.set(I.language); index(); route();
})();
