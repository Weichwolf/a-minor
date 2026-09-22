AM.repertoire = (() => {
  const I=AM.i18n,t=I.t,S=AM.store,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={guitar:'guitarInstrument',keys:'keyboardInstrument',bass:'bassInstrument',drums:'drums'};
  let catalog,run=0,mount=0,controls,external,timer,stopAll=()=>{},draws=[],current;
  const cache=new Map();
  const json=async url=>{const r=await fetch(url);if(!r.ok)throw Error('repertoireLoadError');return r.json();};
  const ready=json('data/repertoire.json').then(data=>catalog=data);
  const link=(instrument,grade)=>'#/repertoire/'+instrument+(grade===undefined?'':'/'+grade);
  const title=instrument=>t(labels[instrument]);
  function stop(){run++;clearInterval(timer);external?.stop();external=null;AM.soundfont.stop();if(controls?.isConnected){controls.querySelectorAll('[data-transport]').forEach(b=>{b.textContent=t(b.dataset.transport);delete b.dataset.playing;});controls.querySelector('.rep-status').textContent='';}}
  function home(spec='') {
    const [instrument,gradeText]=spec.split('/'),grade=gradeText===undefined?undefined:Number(gradeText);
    if(!['guitar','keys'].includes(instrument))return `<h1>${t('repertoire')}</h1><p class="lead">${t('repertoireLead')}</p><div class="tracks">${['guitar','keys'].map(k=>`<a class="track" href="${link(k)}"><h2>${title(k)}</h2><p>${t(k==='guitar'?'repertoireGuitar':'repertoireKeys')}</p><p class="meta">Grade 0–5 · ${t('fivePieces')}</p></a>`).join('')}</div>`;
    const crumbs=`<nav class="crumbs"><a href="#/repertoire">${t('repertoire')}</a> › <a href="${link(instrument)}">${title(instrument)}</a></nav>`;
    if(!Number.isInteger(grade)||grade<0||grade>5)return `${crumbs}<h1>${t('repertoire')} · ${title(instrument)}</h1><div class="phases">${catalog.grades.map((name,i)=>{const pieces=catalog.pieces.filter(p=>p.grade===i),done=pieces.filter(p=>S.isDone('rep-'+instrument+'-'+p.id)).length;return `<a class="phase" href="${link(instrument,i)}"><span class="num">${i}</span><div><h2>Grade ${i}</h2><p>${t('repertoireGrade'+i)}</p><div class="meta">${done}/${pieces.length} ${t('pieces')}</div></div></a>`;}).join('')}</div>`;
    return `${crumbs}<h1>Grade ${grade} · ${title(instrument)}</h1><p class="lead">${t('repertoireGrade'+grade)}</p><div class="units">${catalog.pieces.filter(p=>p.grade===grade).map((p,i)=>`<a class="unit" href="#/piece/${instrument}/${p.id}"><span class="num">${i+1}</span><div><h2>${esc(p.title)}${S.isDone('rep-'+instrument+'-'+p.id)?' ✓':''}</h2><p>${esc(p.description[I.language][instrument])}</p><div class="meta">${esc(p.key)} · ${p.time} · ${p.bars} ${t('bars')}</div></div></a>`).join('')}</div>`;
  }
  function page(spec) {
    const [instrument,id]=spec.split('/'),piece=catalog.pieces.find(p=>p.id===id);
    if(!['guitar','keys'].includes(instrument)||!piece)return home();
    const token=++mount;draws=[];current=null;
    setTimeout(()=>load(piece,instrument,token),0);
    return `<nav class="crumbs"><a href="#/repertoire">${t('repertoire')}</a> › <a href="${link(instrument,piece.grade)}">${title(instrument)} · Grade ${piece.grade}</a></nav><div id="repertoire-piece"><h1>${esc(piece.title)}</h1><p role="status">${t('loadingPiece')}</p></div>`;
  }
  async function load(piece,instrument,token) {
    const target=document.querySelector('#repertoire-piece');
    try {
      if(!cache.has(piece.id))cache.set(piece.id,Promise.all([json(piece.score),fetch(piece.midi).then(r=>{if(!r.ok)throw Error('repertoireLoadError');return r.arrayBuffer();}).then(b=>new Uint8Array(b))]).catch(e=>{cache.delete(piece.id);throw e;}));
      const [score,bytes]=await cache.get(piece.id);if(token!==mount||!target.isConnected)return;
      const sequence=AM.midi.decode(bytes),ex='rep-'+instrument+'-'+piece.id;
      let levels=Object.fromEntries(Object.values(AM.midi.channels).map(ch=>[ch,1])),guide=0;
      try{const value=JSON.parse(localStorage.getItem('a-minor-repertoire-mix-'+instrument)||'null');if(value&&[0,.25,1].includes(value.guide))guide=value.guide;for(const ch of Object.values(AM.midi.channels)){const n=value?.levels?.[ch];if(Number.isFinite(n)&&n>=0&&n<=1)levels[ch]=n;}}catch{}
      current={piece,instrument,sequence,bytes};
      const phases=piece.prerequisites.filter(id=>instrument==='guitar'?id.startsWith('p'):id.startsWith('k')).map(id=>`<a href="#/phase/${id}">${t('phase')} ${id.slice(1)}</a>`).join(' · ');
      target.innerHTML=`<h1>${esc(piece.title)}</h1><p class="lead">${title(instrument)} · Grade ${piece.grade} · ${esc(piece.key)} · ${piece.time} · ${piece.bars} ${t('bars')} · ${AM.music.meter(piece.time).symbol} = ${piece.tempo}</p><p>${esc(piece.description[I.language][instrument])}</p><p class="rep-prerequisites">${t('prerequisites')}: ${phases}</p><p class="small">${t(instrument==='guitar'?'guitarAttack':'repertoireKeys')}</p>
      <div class="rep-player player"><div class="row"><button data-transport="listen">${t('listen')}</button><button data-transport="practice">${t('practice')}</button><label>${t('playbackDestination')} <select id="rep-output"><option value="browser">${t('browserAudio')}</option><option value="midi">MIDI Out</option></select></label><a href="#/midi">${t('midiSetup')}</a></div>
      <div class="row"><label>${t('tempo')} <input id="rep-tempo" type="number" min="30" max="240" value="${piece.tempo}"> ${AM.music.meter(piece.time).symbol}/min</label><label>${t('section')} <select id="rep-section"><option value="all">${t('wholePiece')}</option>${score.sections.map((s,i)=>`<option value="${i}">${esc(s.name)} · ${s.startBar}–${s.startBar+s.bars.length-1}</option>`).join('')}</select></label><label><input id="rep-loop" type="checkbox"> ${t('loop')}</label><label><input id="rep-count" type="checkbox" checked> ${t('countIn')}</label></div>
      <div class="row"><label>${t('guideVoice')} <select id="rep-guide"><option value="0"${guide===0?' selected':''}>${t('muted')}</option><option value="0.25"${guide===.25?' selected':''}>${t('quiet')}</option><option value="1"${guide===1?' selected':''}>${t('normal')}</option></select></label></div><div class="rep-mixer">${Object.entries(AM.midi.channels).map(([role,ch])=>`<label>${title(role)}<input type="range" data-mix="${ch}" min="0" max="100" step="1" value="${Math.round(levels[ch]*100)}"><output>${Math.round(levels[ch]*100)}%</output></label>`).join('')}</div><p class="rep-status small" role="status"></p><progress id="rep-progress" max="${sequence.duration}" value="0" aria-label="${t('playbackProgress')}"></progress><p class="small">${t('sharedMidi')}</p></div>
      <div class="row rep-downloads"><a download href="${encodeURI(piece.midi)}">MIDI</a><a download href="${encodeURI(piece.dir+'/'+piece.title+' '+(instrument==='guitar'?'Guitar':'Keyboard')+'.pdf')}">PDF · ${title(instrument)}</a><a href="#/piece/${instrument==='guitar'?'keys':'guitar'}/${piece.id}">${t('otherPart')}</a><label><input id="rep-aids" type="checkbox"> ${t('aids')}</label></div>
      <div id="rep-scores">${score.sections.map((s,i)=>`<section class="rep-section" data-section="${i}"><h2>${esc(s.name)} <span class="small">· ${t('bars')} ${s.startBar}–${s.startBar+s.bars.length-1} · ${s.time}</span></h2><div class="scorewrap"><div class="svg"></div></div></section>`).join('')}</div>
      <article class="ex rep-log${S.isDone(ex)?' done':''}" id="${ex}"><header><h3>${t('practiceLog')}</h3><label class="donebox"><input type="checkbox" data-done="${ex}"${S.isDone(ex)?' checked':''}> ${t('mastered')}</label></header><p>${t('pieceCriteria')}</p><details class="log"><summary>${t('log')}</summary><form data-log="${ex}"><input name="note" aria-label="${t('note')}" placeholder="${t('logPlaceholder')}" required maxlength="12000"><button>${t('save')}</button></form><ul></ul></details></article>`;
      controls=target.querySelector('.rep-player');
      const save=()=>{try{localStorage.setItem('a-minor-repertoire-mix-'+instrument,JSON.stringify({guide,levels}));}catch{}};
      const updateMix=()=>{for(const input of controls.querySelectorAll('[data-mix]')){input.value=Math.round(levels[input.dataset.mix]*100);input.nextElementSibling.value=input.value+'%';}AM.soundfont.mix(levels);external?.setMix(levels);save();};
      controls.querySelectorAll('[data-mix]').forEach(input=>input.oninput=()=>{levels[input.dataset.mix]=Number(input.value)/100;updateMix();});
      target.querySelector('#rep-guide').onchange=e=>{guide=Number(e.target.value);levels[AM.midi.channels[instrument]]=guide;updateMix();};
      const logs=()=>{const entries=S.get().log.filter(n=>n.ex===ex);target.querySelector('.rep-log summary').textContent=`${t('log')} (${entries.length})`;target.querySelector('.rep-log ul').innerHTML=entries.map(n=>`<li><span class="date">${esc(n.date)}</span> ${esc(n.note)}</li>`).join('');};logs();
      target.querySelector('[data-done]').onchange=e=>{try{S.toggleDone(ex);e.target.closest('.ex').classList.toggle('done',e.target.checked);}catch{e.target.checked=!e.target.checked;target.querySelector('.rep-status').textContent=t('saveError');}};
      target.querySelector('form').onsubmit=e=>{e.preventDefault();const input=e.target.elements.note,note=input.value.trim();if(!note)return;try{S.addLog({ex,note});input.value='';logs();}catch{target.querySelector('.rep-status').textContent=t('saveError');}};
      const draw=()=>{
        const aids=target.querySelector('#rep-aids').checked;
        score.sections.forEach((s,i)=>{const sc={instrument,time:s.time,key:s.bars[0].key,maxFret:piece.maxFret,groups:s.groups,swing:s.bars[0].swing,measureStart:s.startBar,notes:s.bars.flatMap(b=>b[instrument].notes),bass:instrument==='guitar'&&s.bars.every(b=>b.guitar.bass.every(n=>n.r))?undefined:s.bars.flatMap(b=>b[instrument].bass),chords:s.bars.map(b=>b.chord)};AM.notation.render(target.querySelectorAll('.rep-section .svg')[i],sc,{names:aids,strings:aids,frets:aids,fingers:false},Object.fromEntries(['bass','pedal','single','rest'].map(k=>[k,t('reference'+k)])));});
        for(const svg of target.querySelectorAll('svg.score')){const group=document.createElementNS('http://www.w3.org/2000/svg','g');for(const child of [...svg.children])if(!child.matches('.measure,.chord,.section'))group.append(child);svg.append(group);const bounds=group.getBBox(),shift=Math.max(0,bounds.y-52);group.setAttribute('transform',`translate(0,-${shift})`);const box=svg.getBBox(),width=svg.viewBox.baseVal.width;svg.setAttribute('viewBox',`0 0 ${width} ${Math.max(60,box.y+box.height+16)}`);}
      };draws=[draw];draw();target.querySelector('#rep-aids').onchange=draw;
      const start=async mode=>{
        const button=controls.querySelector(`[data-transport="${mode}"]`);if(button.dataset.playing){stopAll();return;}
        stopAll();const ticket=run,status=controls.querySelector('.rep-status'),input=controls.querySelector('#rep-tempo');if(!input.reportValidity())return;
        levels[AM.midi.channels[instrument]]=mode==='practice'?guide:1;updateMix();
        const index=controls.querySelector('#rep-section').value,section=index==='all'?score.sections[0]:score.sections[Number(index)],from=index==='all'?0:sequence.markers[Number(index)].t,to=index==='all'?sequence.duration:sequence.markers[Number(index)+1]?.t??sequence.duration;
        const count=controls.querySelector('#rep-count').checked?AM.music.meter(section.time).len/AM.music.meter(section.time).q:0,pulse=60/piece.tempo,delay=count*pulse;
        const data=index==='all'&&!count?bytes:AM.midi.excerpt(sequence,{from,to,countIn:count,pulse});
        const loop=controls.querySelector('#rep-loop').checked,rate=input.valueAsNumber/piece.tempo;
        button.dataset.playing='loading';button.textContent=t('stop');status.textContent=t('soundfontLoading');
        const finish=error=>{if(ticket!==run)return;clearInterval(timer);delete button.dataset.playing;button.textContent=t(mode);status.textContent=error?(t(error.message)||t('playError')):t('pieceFinished');target.querySelector('#rep-progress').value=error?0:to;};
        try {
          if(controls.querySelector('#rep-output').value==='midi'){
            if(!Object.values(AM.midi.channels).every(ch=>AM.audio.portFor(ch))){status.innerHTML=`<a href="#/midi">${t('connectFirst')}</a>`;delete button.dataset.playing;button.textContent=t(mode);return;}
            external=new AM.MIDIFilePlayer(AM.midi.decode(data),{rate,loop,loopStart:delay,levels,portFor:ch=>AM.audio.portFor(ch),onEnd:finish});external.play();
          }else await AM.soundfont.play(data,{rate,loop,loopStart:delay,levels,onEnd:finish});
          if(ticket!==run)return;button.dataset.playing='playing';status.textContent=t(mode==='practice'?'practice':'listen');
          timer=setInterval(()=>{if(!target.isConnected){stopAll();return;}const position=Math.max(from,Math.min(to,from+(external?.currentTime??AM.soundfont.currentTime)-delay));target.querySelector('#rep-progress').value=position;target.querySelectorAll('.rep-section').forEach((el,i)=>el.classList.toggle('current',position>=sequence.markers[i].t&&position<(sequence.markers[i+1]?.t??sequence.duration)));},100);
        }catch(error){if(ticket===run){stop();status.textContent=t(error.message)||t('soundfontLoadError');}}
      };
      controls.querySelectorAll('[data-transport]').forEach(button=>button.onclick=()=>start(button.dataset.transport));
      for(const id of ['rep-output','rep-tempo','rep-section','rep-loop','rep-count'])controls.querySelector('#'+id).onchange=()=>stopAll();
      document.title=piece.title+' · '+title(instrument)+' · a-minor';
      target.dataset.ready='true';
    }catch(error){if(target.isConnected&&token===mount)target.innerHTML=`<p role="alert">${t('repertoireLoadError')}</p>`;}
  }
  function logEntry(id){const match=/^rep-(guitar|keys)-(r\d-\d)$/.exec(id);if(!match)return;const p=catalog.pieces.find(p=>p.id===match[2]);if(p)return {title:p.title+' · '+title(match[1]),href:'#/piece/'+match[1]+'/'+p.id};}
  return {ready,home,page,stop,configure:o=>{stopAll=o.stopAll;},resize:()=>draws.forEach(fn=>fn()),leave:()=>{mount++;draws=[];current=null;},logEntry,get current(){return current;}};
})();
