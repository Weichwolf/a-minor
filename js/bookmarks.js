AM.bookmarks = (() => {
  const K='a-minor-bookmarks',schema='a-minor-bookmarks',version=2,M=AM.music,N=AM.notation,t=k=>AM.i18n.t(k);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),clone=x=>JSON.parse(JSON.stringify(x));
  const fail=()=>{throw Error('Invalid bookmark file');},string=(s,max)=>typeof s==='string'&&s.length<=max;
  let entries=[],storageInvalid=false;
  function validatePiece(p){
    if(!p||!Number.isInteger(p.grade)||p.grade<0||p.grade>5||!Number.isInteger(p.seed)||p.seed<0||p.seed>0xffffffff||
      !string(p.id,100)||!string(p.title,200)||!Object.hasOwn(M.SCALES,p.scale)||!Object.hasOwn(M.KEYS,p.key)||p.root!==p.key.replace(/m$/,'')||
      !Number.isFinite(p.tempo)||p.tempo<30||p.tempo>300||!Number.isInteger(p.maxFret)||p.maxFret<0||p.maxFret>24||
      !Array.isArray(p.sections)||!p.sections.length||p.sections.length>64||!string(p.form,64))fail();
    if(p.generatorVersion!==3||!AM.practiceComposer.styles.includes(p.style)||p.requestedStyle!==p.style||
      AM.practiceComposer.instruments.some(role=>!AM.practiceCurriculum[p.grade].skills[role].includes(p.roleFocus?.[role])))fail();
    if(p.id!==`practice-${p.grade}-${p.style}-${p.seed}`)fail();
    if(p.contrasting!==undefined&&typeof p.contrasting!=='boolean')fail();
    if(p.theme!==undefined&&(!Array.isArray(p.theme)||p.theme.length!==8||p.theme.some(n=>!Number.isInteger(n)||n<0||n>6)))fail();
    if(p.repeat&&(!Number.isInteger(p.repeat.from)||p.repeat.from!==1||!Number.isInteger(p.repeat.to)||p.repeat.to>24||!Number.isInteger(p.repeat.times)||p.repeat.times<1||p.repeat.times>36))fail();
    const meter=M.meter(p.time);let count=0,beat=0;const names=new Map();
    for(const role of ['guitar','keys','bass','drums'])if(!Number.isInteger(p.programs?.[role])||p.programs[role]<0||p.programs[role]>127)fail();
    const voice=(notes,len,instrument)=>{
      if(!Array.isArray(notes)||!notes.length||notes.length>48)fail();let duration=0;
      for(const n of notes){
        if(!n||!string(n.d,3))fail();duration+=N.dur(n.d);
        for(const k of Object.keys(n))if(!['p','s','r','d','tie','accent','staccato','tuplet','tupletEnd','velocity','velocities','mute','palmMute','ghost'].includes(k))fail();
        if(n.r){if(n.p!==undefined)fail();continue;}
        for(const flag of ['r','tie','accent','staccato','tupletEnd','mute','palmMute','ghost'])if(n[flag]!==undefined&&![1,true,false,0].includes(n[flag]))fail();
        if(n.velocity!==undefined&&(!Number.isInteger(n.velocity)||n.velocity<1||n.velocity>127))fail();
        if(n.velocities!==undefined&&(!Array.isArray(n.velocities)||n.velocities.length!==[].concat(n.p).length||n.velocities.some(v=>!Number.isInteger(v)||v<1||v>127)))fail();
        const ps=[].concat(n.p);if(!ps.length||ps.length>(instrument==='guitar'?6:instrument==='bass'?1:5))fail();const ms=ps.map(note=>M.midi(note));
        if(ms.some(m=>!Number.isInteger(m)||m<(instrument==='bass'?28:instrument==='drums'?35:36)||m>(instrument==='drums'?59:84))||new Set(ms).size!==ms.length)fail();
        if(instrument==='guitar'||instrument==='bass'){
          const ss=[].concat(n.s);if(ss.length!==ps.length)fail();const fs=ss.map((s,i)=>ms[i]-M.midi((instrument==='bass'?M.BASS_TUNING:M.TUNING)[s]));
          if(ss.some(s=>!Number.isInteger(s)||s<0||s>(instrument==='bass'?3:5))||new Set(ss).size!==ss.length||fs.some(f=>f<0||f>p.maxFret))fail();
          const positive=fs.filter(f=>f>0);if(positive.length&&Math.max(...positive)-Math.min(...positive)>4)fail();
        }else if(instrument==='keys'&&Math.max(...ms)-Math.min(...ms)>12)fail();
      }
      if(Math.abs(duration-len)>1e-9)fail();
    };
    for(const s of p.sections){
      if(!string(s.name,4)||!/^(?:[ABC]′?|[SO])$/.test(s.name)||s.time!==p.time||!Array.isArray(s.bars)||![4,8].includes(s.bars.length)||s.startBar!==count+1||s.startBeat!==beat)fail();
      if(s.variationOf!==undefined&&(s.name!==s.variationOf+'′'||!names.has(s.variationOf)))fail();
      if(s.character!==undefined){const allowed={guitar:['riff','melody','arpeggio','chords','rest'],keys:['riff','melody','arpeggio','chords'],bass:['support','moving'],drums:['lightGroove','build','riffGroove']};for(const role of Object.keys(allowed))if(!allowed[role].includes(s.character?.[role]))fail();}
      M.meter(s.time,s.groups);
      for(const b of s.bars){
        if(b.number!==++count||b.time!==p.time||b.key!==p.key||!string(b.chord,80))fail();
        for(const role of ['guitar','keys']){if(b[role]?.program!==undefined&&(!Number.isInteger(b[role].program)||b[role].program<0||b[role].program>127))fail();voice(b[role]?.notes,meter.len,role);voice(b[role]?.bass,meter.len,role==='guitar'?'rests':'keys');}
        voice(b.bass,meter.len,'bass');
        voice(b.drumPart?.notes,meter.len,'drums');voice(b.drumPart?.bass,meter.len,'drums');
        if(b.keys.inner)voice(b.keys.inner,meter.len,'keys');
        if(!Array.isArray(b.drums)||b.drums.length>96)fail();
        for(const n of b.drums)if(!Number.isFinite(n.t)||n.t<0||!Number.isFinite(n.dur)||n.dur<=0||n.t+n.dur>meter.len+1e-9||!Number.isInteger(n.midi)||n.midi<0||n.midi>127||!Number.isInteger(n.velocity)||n.velocity<1||n.velocity>127)fail();
        for(const role of ['guitar','keys','bass','drums'])if(!Number.isInteger(b.dynamics?.[role])||b.dynamics[role]<12||b.dynamics[role]>110)fail();
        if(!b.harmony||!Number.isInteger(b.harmony.degree)||b.harmony.degree<0||b.harmony.degree>6||!string(b.harmony.roman,16))fail();
        beat+=meter.len;
      }
      const body=JSON.stringify(s.bars.map(({number,...bar})=>bar));if(names.has(s.name)&&names.get(s.name)!==body)fail();names.set(s.name,body);
    }
    const unique=p.sections.filter((s,i,ss)=>ss.findIndex(x=>x.name===s.name)===i).reduce((n,s)=>n+s.bars.length,0);
    if(count>256||count!==p.bars||unique!==p.uniqueBars||p.sections.map(s=>s.name).join('')!==p.form)fail();
    AM.practiceGenerator.encode(p);return p;
  }
  function validate(text){
    if(!string(text,12000000))fail();const data=JSON.parse(text);
    if(data?.schema!==schema||data.version!==version||!Array.isArray(data.bookmarks)||data.bookmarks.length>500)fail();
    const keys=new Set();return data.bookmarks.map(e=>{
      if(!e||!AM.practiceComposer.instruments.includes(e.instrument)||!string(e.name,120)||!string(e.note,2000)||!string(e.createdAt,30)||!Number.isFinite(Date.parse(e.createdAt)))fail();
      const p=validatePiece(e.piece),key=p.id+':'+e.instrument;
      if(e.key!==key||keys.has(key))fail();keys.add(key);
      const url=AM.practice.link(e.instrument,p.grade,p.seed,p.style);
      if(e.url!==url)fail();
      return{key,instrument:e.instrument,name:e.name,note:e.note,createdAt:e.createdAt,url,piece:clone(p)};
    });
  }
  // Storage is read after all modules have initialized, because validation shares URL rules.
  let loaded=false;
  function load(){if(loaded)return;loaded=true;storageInvalid=false;try{const text=localStorage.getItem(K);if(text){const data=JSON.parse(text);if(!(data?.schema===schema&&data.version===1))entries=validate(text);}}catch{entries=[];storageInvalid=true;}}
  function serialize(list=entries){return JSON.stringify({schema,version,bookmarks:list},null,2);}
  function commit(list){if(storageInvalid)throw Error('Invalid stored bookmarks');localStorage.setItem(K,serialize(list));entries=list;}
  const all=()=>{load();return clone(entries);};
  const find=(piece,instrument)=>{load();return entries.find(e=>e.key===piece.id+':'+instrument);};
  const fromURL=url=>{load();const composition=href=>href.replace(/^#\/practice\/(guitar|keys|bass|drums)\//,'#/practice/');return clone(entries.find(e=>e.url===url)||entries.find(e=>composition(e.url)===composition(url))||null);};
  function toggle(piece,instrument,url){load();const e=find(piece,instrument);if(e)commit(entries.filter(x=>x!==e));else{
    if(entries.length>=500)throw Error('Bookmark limit');validatePiece(piece);
    commit([...entries,{key:piece.id+':'+instrument,instrument,url,piece:clone(piece),createdAt:new Date().toISOString(),name:'',note:''}]);
  }return!!find(piece,instrument);}
  function update(key,name,note){load();if(!string(name,120)||!string(note,2000))fail();commit(entries.map(e=>e.key===key?{...e,name:name.trim(),note:note.trim()}:e));}
  function remove(key){load();commit(entries.filter(e=>e.key!==key));}
  function importJSON(text){load();const incoming=validate(text),keys=new Set(entries.map(e=>e.key)),added=incoming.filter(e=>!keys.has(e.key));if(entries.length+added.length>500)fail();const invalid=storageInvalid;storageInvalid=false;try{commit([...entries,...added]);}catch(error){storageInvalid=invalid;throw error;}return added.length;}
  function exportJSON(){load();return serialize(entries.map(e=>({...e,analysis:AM.practiceInfo.describe(e.piece,e.instrument)})));}
  function exportCSV(base=location.href.split('#')[0]){
    load();const fields=['id','seed','generatorVersion','instrument','grade','requestedStyle','style','root','scale','key','tempo','time','form','playedBars','writtenBars','sectionLengths','chords','melodicIntervalsSemitones','harmonicIntervalsSemitones','rhythms','focus','name','note','createdAt','url'];
    const cell=value=>{let s=String(value??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
    return '\uFEFF'+[fields,...entries.map(e=>{
      const p=e.piece,d=AM.practiceInfo.describe(p,e.instrument);
      return[p.id,p.seed,p.generatorVersion??1,e.instrument,p.grade,p.requestedStyle??'legacy',p.style??'legacy',p.root,p.scale,p.key,p.tempo,p.time,p.form,p.bars,p.uniqueBars,d.sectionLengths.join(' | '),d.progressions.join(' | '),d.melodicIntervals.map(x=>x.semitones).join(' | '),d.harmonicIntervals.join(' | '),d.rhythms.join(' | '),d.focus,e.name,e.note,e.createdAt,base+e.url];
    })].map(row=>row.map(cell).join(',')).join('\r\n');
  }
  function download(contents,filename,type){const href=URL.createObjectURL(new Blob([contents],{type})),a=document.createElement('a');a.href=href;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),30000);}
  function bindPiece(target,piece,instrument,url){
    const button=target.querySelector('#piece-bookmark');if(!button)return;
    const draw=()=>{const saved=!!find(piece,instrument);button.textContent=(saved?'★ ':'☆ ')+t(saved?'bookmarked':'bookmark');button.setAttribute('aria-pressed',String(saved));};
    draw();button.onclick=()=>{try{toggle(piece,instrument,url);draw();}catch{target.querySelector('.rep-status').textContent=t('saveError');}};
  }
  function page(){
    const list=all().reverse();setTimeout(mount,0);
    return `<h1>${t('bookmarks')}</h1><p class="lead">${t('bookmarksLead')}</p><div class="row"><button id="bookmarks-json"${storageInvalid?' disabled':''}>JSON ↓</button><button id="bookmarks-csv"${storageInvalid?' disabled':''}>CSV ↓</button><label class="btn">JSON ↑<input type="file" id="bookmarks-import" accept=".json,application/json" hidden></label></div><p id="bookmarks-status" role="status">${storageInvalid?t('bookmarksStorageError'):''}</p><div id="bookmark-list">${list.length?list.map(e=>`<article class="bookmark-card" data-bookmark="${esc(e.key)}"><div class="row"><a class="bookmark-open" href="${esc(e.url)}"><strong>${esc(e.name||e.piece.title)}</strong></a><button class="bookmark-remove" aria-label="${t('delete')}">×</button></div><p class="small">${t({guitar:'guitarInstrument',keys:'keyboardInstrument',bass:'bassInstrument',drums:'drums'}[e.instrument])} · Grade ${e.piece.grade} · ${t('style_'+(e.piece.style??'legacy'))} · ${esc(e.piece.key)} · ${esc(e.piece.form)} · ${e.piece.bars} ${t('bars')}</p><details><summary>${t('bookmarkEdit')}</summary><form class="bookmark-edit"><label>${t('bookmarkName')}<input name="name" maxlength="120" value="${esc(e.name)}"></label><label>${t('bookmarkNote')}<textarea name="note" maxlength="2000" rows="2">${esc(e.note)}</textarea></label><button>${t('save')}</button></form></details>${e.note?`<p class="bookmark-note">${esc(e.note)}</p>`:''}</article>`).join(''):`<p>${t('bookmarksEmpty')}</p>`}</div>`;
  }
  function mount(){
    const list=document.querySelector('#bookmark-list');if(!list)return;const status=document.querySelector('#bookmarks-status');
    document.querySelector('#bookmarks-json').onclick=()=>download(exportJSON(),'a-minor-bookmarks.json','application/json');
    document.querySelector('#bookmarks-csv').onclick=()=>download(exportCSV(),'a-minor-bookmarks.csv','text/csv;charset=utf-8');
    document.querySelector('#bookmarks-import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>12000000)fail();const count=importJSON(await file.text());document.querySelector('main').innerHTML=page();setTimeout(()=>{document.querySelector('#bookmarks-status').textContent=t('bookmarksImported').replace('{count}',count);},0);}catch{status.textContent=t('importError');}};
    list.querySelectorAll('[data-bookmark]').forEach(card=>{
      card.querySelector('.bookmark-remove').onclick=()=>{try{remove(card.dataset.bookmark);card.remove();if(!entries.length)list.textContent=t('bookmarksEmpty');}catch{status.textContent=t('saveError');}};
      card.querySelector('form').onsubmit=e=>{e.preventDefault();try{update(card.dataset.bookmark,e.target.elements.name.value,e.target.elements.note.value);document.querySelector('main').innerHTML=page();}catch{status.textContent=t('saveError');}};
    });
  }
  window.addEventListener?.('storage',e=>{if(e.key!==K)return;loaded=false;load();if(location.hash==='#/bookmarks')document.querySelector('main').innerHTML=page();else{
    const c=AM.repertoire.current;if(c)bindPiece(document.querySelector('#repertoire-piece'),c.piece,c.instrument,location.hash);
  }});
  return{all,find,fromURL,toggle,update,remove,importJSON,exportJSON,exportCSV,validatePiece,bindPiece,page};
})();
