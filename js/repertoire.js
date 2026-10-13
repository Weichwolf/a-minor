AM.repertoire = (() => {
  const I=AM.i18n,t=I.t,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={guitar:'guitarInstrument',keys:'keyboardInstrument',bass:'bassInstrument',drums:'drums'};
  let catalog,run=0,mount=0,controls,external,timer,stopAll=()=>{},draws=[],current;
  const cache=new Map();
  const json=async url=>{const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error('repertoireLoadError');return r.json();};
  const ready=json('data/repertoire.json').then(data=>catalog=data);
  const link=(instrument,grade)=>'#/repertoire/'+instrument+(grade===undefined?'':'/'+grade);
  const title=instrument=>t(labels[instrument]);
  function stop(){run++;clearInterval(timer);external?.stop();external=null;AM.soundfont.stop();if(controls?.isConnected){controls.querySelectorAll('[data-transport]').forEach(b=>{b.textContent=t(b.dataset.transport);delete b.dataset.playing;});controls.querySelector('.rep-status').textContent='';}}
  const home=(spec='')=>AM.practice.page(spec.split('/')[0]);
  function page(spec) {
    const [instrument,id]=spec.split('/'),piece=catalog.pieces.find(p=>p.id===id);
    if(!['guitar','keys'].includes(instrument)||!piece)return home();
    const token=++mount;draws=[];current=null;
    setTimeout(()=>load(piece,instrument,token),0);
    return `<nav class="crumbs"><a href="#/practice">${t('practiceMode')}</a> › <a href="${link(instrument,piece.grade)}">${title(instrument)} · Grade ${piece.grade}</a></nav><div id="repertoire-piece"><h1>${esc(piece.title)}</h1><p role="status">${t('loadingPiece')}</p></div>`;
  }
  function generated(piece,instrument,score,bytes,options) {
    const token=++mount;draws=[];current=null;
    setTimeout(()=>load(piece,instrument,token,{score,bytes,...options}),0);
    return `<div id="repertoire-piece" class="practice-piece"><h1>${esc(piece.title)}</h1><p role="status">${t('loadingPiece')}</p></div>`;
  }
  async function load(piece,instrument,token,source) {
    const target=document.querySelector('#repertoire-piece');
    try {
      if(!source&&!cache.has(piece.id))cache.set(piece.id,Promise.all([json(piece.score),fetch(piece.midi,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('repertoireLoadError');return r.arrayBuffer();}).then(b=>new Uint8Array(b))]).catch(e=>{cache.delete(piece.id);throw e;}));
      const [score,bytes]=source?[source.score,source.bytes]:await cache.get(piece.id);if(token!==mount||!target.isConnected)return;
      const sequence=AM.midi.decode(bytes);
      const sections=[];let writtenBars=0;
      score.sections.forEach((section,index)=>{
        const existing=source&&sections.find(s=>s.name===section.name);
        if(existing){existing.playbackIndices.push(index);return;}
        sections.push({...section,startBar:source?writtenBars+1:section.startBar,playbackIndices:[index]});
        writtenBars+=section.bars.length;
      });
      let activeMode=null;
      let levels=Object.fromEntries(Object.values(AM.midi.channels).map(ch=>[ch,1])),guide=0;
      try{const value=JSON.parse(localStorage.getItem('a-minor-repertoire-mix-'+instrument)||'null');if(value&&[0,.25,1].includes(value.guide))guide=value.guide;for(const ch of Object.values(AM.midi.channels)){const n=value?.levels?.[ch];if(Number.isFinite(n)&&n>=0&&n<=1)levels[ch]=n;}}catch{}
      let preferences={};try{preferences=JSON.parse(localStorage.getItem('a-minor-playback'))||{};}catch{}
      let arrangement=preferences.arrangements?.[instrument]??(instrument==='keys'?'solo':'band');
      if(!['solo','band'].includes(arrangement))arrangement='solo';
      const savePreferences=()=>{try{localStorage.setItem('a-minor-playback',JSON.stringify({...preferences,output:controls.querySelector('#rep-output').value,arrangements:{...preferences.arrangements,[instrument]:arrangement}}));}catch{}};
      const effectiveLevels=()=>{const mix=Object.fromEntries(Object.entries(levels).map(([ch,value])=>[ch,source&&arrangement==='solo'&&Number(ch)!==9&&Number(ch)!==AM.midi.channels[instrument]?0:value]));if(instrument==='drums'&&activeMode==='practice'&&guide===0)mix[9]=1;return mix;};
      current={piece,instrument,sequence,bytes,score};
      const midiHref=source?URL.createObjectURL(new Blob([bytes],{type:'audio/midi'})):encodeURI(piece.midi);
      if(source)current.downloadURL=midiHref;
      target.innerHTML=`<h1>${esc(piece.title)}</h1><p class="lead">${title(instrument)} · Grade ${piece.grade} · ${esc(piece.key)} · ${piece.time} · ${source?writtenBars:piece.bars} ${t('bars')} · ${AM.music.meter(piece.time).symbol} = ${piece.tempo}</p>${source?source.infoHTML:`<p>${esc(piece.description[I.language][instrument])}</p>`}${source?`<p class="practice-form small">${esc(source.formText)}</p>`:''}
      <div class="rep-player player"><div class="row"><button data-transport="listen">${t('listen')}</button><button data-transport="practice">${t('practice')}</button><label>${t('playbackDestination')} <select id="rep-output"><option value="browser"${preferences.output==='midi'?'':' selected'}>${t('browserAudio')}</option><option value="midi"${preferences.output==='midi'?' selected':''}>MIDI Out</option></select></label><a href="#/midi">${t('midiSetup')}</a>${source?.controlsHTML??''}</div>
      <div class="row"><label>${t('tempo')} <input id="rep-tempo" type="number" min="30" step="any" max="${240/AM.music.meter(piece.time).q}" value="${piece.tempo}"> ${AM.music.meter(piece.time).symbol}/min</label><label>${t('section')} <select id="rep-section"><option value="all">${t('wholePiece')}</option>${sections.map(s=>`<option value="${s.playbackIndices[0]}">${esc(s.name)} · ${s.startBar}–${s.startBar+s.bars.length-1}</option>`).join('')}</select></label><label><input id="rep-loop" type="checkbox"> ${t('loop')}</label><label><input id="rep-count" type="checkbox" checked> ${t('countIn')}</label></div>
      <div class="row">${source?`<label>${t('arrangement')} <select id="rep-arrangement"><option value="solo"${arrangement==='solo'?' selected':''}>Solo</option><option value="band"${arrangement==='band'?' selected':''}>Band</option></select></label>`:''}<label>${t('guideVoice')} <select id="rep-guide"><option value="0"${guide===0?' selected':''}>${t('muted')}</option><option value="0.25"${guide===.25?' selected':''}>${t('quiet')}</option><option value="1"${guide===1?' selected':''}>${t('normal')}</option></select></label><div class="rep-mixer">${Object.entries(AM.midi.channels).map(([role,ch])=>`<label>${title(role)}<input type="range" data-mix="${ch}" min="0" max="100" step="1" value="${Math.round(levels[ch]*100)}"><output>${Math.round(levels[ch]*100)}%</output></label>`).join('')}</div></div><p class="rep-status small" role="status"></p><progress id="rep-progress" max="${sequence.duration}" value="0" aria-label="${t('playbackProgress')}"></progress></div>
      <div class="row rep-downloads"><a download="${esc(piece.title)}.mid" href="${midiHref}">MIDI</a>${source?`<button id="rep-pdf">${t('downloadScore')}</button>`:`<a download href="${encodeURI(piece.dir+'/'+piece.title+' '+(instrument==='guitar'?'Guitar':'Keyboard')+'.pdf')}">PDF · ${title(instrument)}</a>`}${source?.partOptions?`<label>${t('instrument')} <select id="rep-part">${source.partOptions.map(p=>`<option value="${p.href}"${p.id===instrument?' selected':''}>${p.title}</option>`).join('')}</select></label>`:`<a href="${'#/piece/'+(instrument==='guitar'?'keys':'guitar')+'/'+piece.id}">${t('otherPart')}</a>`}</div>
      <div id="rep-scores">${sections.map(s=>`<section class="rep-section" data-section="${s.playbackIndices[0]}"><h2>${esc(s.name)} <span class="small">· ${t('bars')} ${s.startBar}–${s.startBar+s.bars.length-1} · ${s.time}</span></h2>${Array.from({length:source?Math.ceil(s.bars.length/4):1},()=>'<div class="scorewrap"><div class="svg"></div></div>').join('')}</section>`).join('')}</div>`;
      controls=target.querySelector('.rep-player');
      target.querySelector('#rep-part')?.addEventListener('change',e=>{location.hash=e.target.value;});
      target.querySelector('#rep-pdf')?.addEventListener('click',async event=>{
        const button=event.currentTarget,status=target.querySelector('.rep-status');
        button.disabled=true;button.textContent=t('creatingScore');status.textContent='';
        try{await AM.scorePDF.download(target,{title:piece.title,description:target.querySelector(':scope > .lead').textContent,form:source.formText,theory:AM.practiceInfo.text(piece,instrument),filename:piece.title+' '+title(instrument)+'.pdf'});}
        catch{status.textContent=t('scoreDownloadError');}
        finally{button.disabled=false;button.textContent=t('downloadScore');}
      });
      const save=()=>{try{localStorage.setItem('a-minor-repertoire-mix-'+instrument,JSON.stringify({guide,levels}));}catch{}};
      const updateMix=()=>{for(const input of controls.querySelectorAll('[data-mix]')){input.value=Math.round(levels[input.dataset.mix]*100);input.nextElementSibling.value=input.value+'%';}AM.soundfont.mix(effectiveLevels());external?.setMix(effectiveLevels());save();};
      controls.querySelectorAll('[data-mix]').forEach(input=>input.oninput=()=>{levels[input.dataset.mix]=Number(input.value)/100;updateMix();});
      target.querySelector('#rep-guide').onchange=e=>{if(instrument==='drums'){stopAll();activeMode=null;}guide=Number(e.target.value);levels[AM.midi.channels[instrument]]=guide;updateMix();};
      target.querySelector('#rep-arrangement')?.addEventListener('change',e=>{stopAll();arrangement=e.target.value;updateMix();savePreferences();});
      const draw=()=>{
        sections.forEach((s,i)=>{const svgs=target.querySelectorAll('.rep-section')[i].querySelectorAll('.svg');svgs.forEach((svg,row)=>{const bars=source?s.bars.slice(row*4,row*4+4):s.bars;const parts=bars.map(b=>source?AM.practiceGenerator.part(b,instrument):b[instrument]);const hasInner=parts.some(p=>p.inner);const sc={instrument,time:s.time,key:bars[0].key,maxFret:piece.maxFret,groups:s.groups,swing:bars[0].swing,measureStart:s.startBar+(source?row*4:0),singleLine:!!source,hideReferences:!!source,
          incoming:source&&row>0?['notes','bass','inner'].map(v=>{const n=AM.practiceGenerator.part(s.bars[row*4-1],instrument)[v]?.at(-1);return n?.tie?[].concat(n.p).map(AM.music.midi):null;}):undefined,outgoing:!!source&&row*4+4<s.bars.length,
          notes:parts.flatMap(p=>p.notes),bass:instrument==='bass'||instrument==='guitar'&&parts.every(p=>p.bass.every(n=>n.r))?undefined:parts.flatMap(p=>p.bass),
          inner:hasInner?parts.flatMap(p=>p.inner||AM.practiceRhythm.held('C4',s.time,true)):undefined,
          chords:instrument==='drums'?undefined:bars.map(b=>b.chord),rhythmSlash:parts.every(p=>p.rhythmSlash),percentRepeats:parts.flatMap((p,i)=>p.percentRepeat&&i>0?[i+1]:[]),
          repeat:source?piece.repeat:undefined,programLabels:!source&&instrument==='guitar'?bars.map((b,i)=>b.guitar.program!==undefined&&(i===0||b.guitar.program!==bars[i-1].guitar.program)?t(b.guitar.program===27?'guitarClean':'guitarDrive'):undefined):undefined,signs:bars.map(b=>b.sign),instructions:bars.map(b=>b.instruction)};AM.notation.render(svg,sc,{},Object.fromEntries(['bass','pedal','single','rest'].map(k=>[k,t('reference'+k)])));});});
        for(const svg of target.querySelectorAll('svg.score')){const group=document.createElementNS('http://www.w3.org/2000/svg','g');for(const child of [...svg.children])if(!child.matches('.measure,.chord,.section,.program-label'))group.append(child);svg.append(group);const bounds=group.getBBox(),shift=Math.max(0,bounds.y-52);group.setAttribute('transform',`translate(0,-${shift})`);const box=svg.getBBox(),width=svg.viewBox.baseVal.width;svg.setAttribute('viewBox',`0 0 ${width} ${Math.max(60,box.y+box.height+16)}`);}
      };draws=[draw];draw();
      const start=async mode=>{
        const button=controls.querySelector(`[data-transport="${mode}"]`);if(button.dataset.playing){stopAll();return;}
        stopAll();activeMode=mode;const ticket=run,status=controls.querySelector('.rep-status'),input=controls.querySelector('#rep-tempo');if(!input.reportValidity())return;
        levels[AM.midi.channels[instrument]]=mode==='practice'?guide:1;updateMix();
        const index=controls.querySelector('#rep-section').value,section=index==='all'?score.sections[0]:score.sections[Number(index)],from=index==='all'?0:sequence.markers[Number(index)].t,to=index==='all'?sequence.duration:sequence.markers[Number(index)+1]?.t??sequence.duration;
        const count=controls.querySelector('#rep-count').checked?AM.music.meter(section.time).len/AM.music.meter(section.time).q:0,pulse=60*AM.music.meter(section.time).q/(piece.quarterTempo??piece.tempo*AM.music.meter(section.time).q),delay=count*pulse;
        const solo=source&&arrangement==='solo';
        const muteDrums=instrument==='drums'&&mode==='practice'&&guide===0;
        const data=index==='all'&&!count&&!solo&&!muteDrums?bytes:AM.midi.excerpt(sequence,{from,to,countIn:count,pulse,...(solo?{channels:[AM.midi.channels[instrument]]}:{}),...(muteDrums?{muteChannels:[9]}:{})});
        const loop=controls.querySelector('#rep-loop').checked,rate=input.valueAsNumber/piece.tempo;
        button.dataset.playing='loading';button.textContent=t('stop');status.textContent=t('soundfontLoading');
        const finish=error=>{if(ticket!==run)return;clearInterval(timer);delete button.dataset.playing;button.textContent=t(mode);status.textContent=error?(t(error.message)||t('playError')):t('pieceFinished');target.querySelector('#rep-progress').value=error?0:to;};
        try {
          if(controls.querySelector('#rep-output').value==='midi'){
            if(!(solo?[AM.midi.channels[instrument],...(count?[9]:[])]:Object.values(AM.midi.channels)).every(ch=>AM.audio.portFor(ch))){status.innerHTML=`<a href="#/midi">${t('connectFirst')}</a>`;delete button.dataset.playing;button.textContent=t(mode);return;}
            external=new AM.MIDIFilePlayer(AM.midi.decode(data),{rate,loop,loopStart:delay,levels:effectiveLevels(),portFor:ch=>AM.audio.portFor(ch),onEnd:finish});external.play();
          }else await AM.soundfont.play(data,{rate,loop,loopStart:delay,levels:effectiveLevels(),onEnd:finish});
          if(ticket!==run)return;button.dataset.playing='playing';status.textContent=t(mode==='practice'?'practice':'listen');
          timer=setInterval(()=>{if(!target.isConnected){stopAll();return;}const position=Math.max(from,Math.min(to,from+(external?.currentTime??AM.soundfont.currentTime)-delay));target.querySelector('#rep-progress').value=position;target.querySelectorAll('.rep-section').forEach((el,i)=>el.classList.toggle('current',sections[i].playbackIndices.some(n=>position>=sequence.markers[n].t&&position<(sequence.markers[n+1]?.t??sequence.duration))));},100);
        }catch(error){if(ticket===run){stop();status.textContent=t(error.message)||t('soundfontLoadError');}}
      };
      controls.querySelectorAll('[data-transport]').forEach(button=>button.onclick=()=>start(button.dataset.transport));
      for(const id of ['rep-output','rep-tempo','rep-section','rep-loop','rep-count'])controls.querySelector('#'+id).onchange=()=>{stopAll();if(id==='rep-output')savePreferences();};
      document.title=piece.title+' · '+title(instrument)+' · a-minor';
      target.dataset.ready='true';
      source?.onReady?.(target);
    }catch(error){if(target.isConnected&&token===mount)target.innerHTML=`<p role="alert">${t('repertoireLoadError')}</p>`;}
  }
  return {ready,home,page,generated,stop,configure:o=>{stopAll=o.stopAll;},resize:()=>draws.forEach(fn=>fn()),leave:()=>{mount++;draws=[];if(current?.downloadURL)URL.revokeObjectURL(current.downloadURL);current=null;},get current(){return current;}};
})();
