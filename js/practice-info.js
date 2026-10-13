AM.practiceInfo = (() => {
  const M=AM.music,N=AM.notation,t=k=>AM.i18n.t(k),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const display=s=>s.replace(/#/g,'♯').replace(/b/g,'♭'),strip=s=>s.replace(/-?\d+$/,'');
  const format=(k,v)=>t(k).replace(/\{(\w+)\}/g,(_,n)=>v[n]);
  const form=piece=>{const names=piece.sections.map(s=>s.name);let best;
    for(let len=1;len<=Math.floor(names.length/2);len++){let count=1;while(names.slice(0,len).join('|')===names.slice(count*len,(count+1)*len).join('|'))count++;if(count>1&&(!best||len*count>best.len*best.count))best={len,count};}
    if(best){const {len,count}=best;return '('+names.slice(0,len).join('–')+')×'+count+(names.length>len*count?'–'+names.slice(len*count).join('–'):'');}
    return names.join('–');};
  function describe(piece,instrument){
    const unique=piece.sections.filter((s,i,ss)=>ss.findIndex(x=>x.name===s.name)===i);
    const melody=new Map(),harmonic=new Set(),durations=new Set(),used=new Set(),techniques=new Set(),kit=new Set();let rests=false,number=0;
    const sections=unique.map(s=>({name:s.name,length:s.bars.length,bars:s.bars.map(b=>({number:++number,chord:b.chord,roman:b.harmony.roman,degree:b.harmony.degree}))}));
    for(const s of unique)for(const voice of ['notes',...(instrument==='keys'?['bass','inner']:instrument==='drums'?['bass']:[])]){
      let previous,tied=false;
      for(const n of s.bars.flatMap(b=>AM.practiceGenerator.part(b,instrument)[voice]||[])){
        durations.add(n.d);if(n.r){rests=true;tied=false;continue;}
        const pitches=[].concat(n.p).map(M.midi);pitches.forEach(p=>instrument==='drums'?kit.add(p):used.add(M.pc(p)));
        for(const k of ['tie','accent','palmMute','mute','ghost','staccato'])if(n[k])techniques.add(k);
        for(let i=0;i<pitches.length;i++)for(let j=i+1;j<pitches.length;j++)if(instrument!=='drums')harmonic.add(Math.abs(pitches[j]-pitches[i]));
        if(pitches.length!==1||instrument==='drums'){previous=undefined;tied=false;continue;}
        if(previous!==undefined&&!tied){const distance=Math.abs(pitches[0]-previous);melody.set(distance,(melody.get(distance)||0)+1);}
        previous=pitches[0];tied=!!n.tie;
      }
    }
    const rhythms=[];
    for(const [p,k]of [['w','Whole'],['h','Half'],['q','Quarter'],['e','Eighth'],['s','Sixteenth']])if([...durations].some(d=>d.startsWith(p)&&!d.endsWith('t')))rhythms.push(k);
    if([...durations].some(d=>d.endsWith('t')))rhythms.push('Triplet');if([...durations].some(d=>d.endsWith('.')))rhythms.push('Dotted');if(rests)rhythms.push('Rest');
    return{root:piece.root,scale:piece.scale,style:piece.style,focus:piece.roleFocus[instrument],form:piece.form,time:piece.time,tempo:piece.tempo,quarterTempo:piece.quarterTempo,
      sections,usedNotes:[...used].sort((a,b)=>a-b).map(pc=>strip(M.scaleName(60+pc,piece.root,piece.scale))),kit:[...kit].sort((a,b)=>a-b),techniques:[...techniques],
      melodicIntervals:[...melody].sort((a,b)=>b[1]-a[1]||a[0]-b[0]).map(([semitones,count])=>({semitones,count})),harmonicIntervals:[...harmonic].sort((a,b)=>a-b),rhythms,swing:piece.swing,
      sectionLengths:sections.map(s=>s.name+':'+s.length),progressions:sections.map(s=>s.name+': '+s.bars.map(b=>b.chord).filter((c,i,cs)=>i===0||c!==cs[i-1]).join('–'))};
  }
  function interval(n){return n<=12?t('interval'+n):format('intervalCompound',{octaves:Math.floor(n/12),interval:t('interval'+(n%12))});}
  function text(piece,instrument){
    const d=describe(piece,instrument),top=d.melodicIntervals.slice(0,piece.grade===0?2:3).map(x=>x.semitones);
    const largest=Math.max(0,...d.melodicIntervals.map(x=>x.semitones));if(largest>Math.max(0,...top)&&largest>=5)top.push(largest);
    if(d.harmonicIntervals.includes(7)&&!top.includes(7))top.push(7);
    const progress=d.sections.map(s=>s.name+': '+s.bars.map(b=>display(b.chord)+(piece.grade>=2?' ('+display(b.roman)+')':'')).filter((c,i,cs)=>i===0||c!==cs[i-1]).join('–')).join('; ');
    const rhythm=d.rhythms.map(k=>t('practiceRhythm'+k)).join(', ')+(d.swing?', '+t('swingFeel'):'');
    return format(instrument==='drums'?'pieceDrumsSentence':'pieceSentence',{style:t('style_'+d.style),root:display(d.root),scale:t('scale_'+d.scale),form:form(piece),time:d.time,
      chords:progress,intervals:top.length?top.map(interval).join(', '):d.harmonicIntervals.map(interval).join(', '),rhythm,focus:t('focus_'+d.focus)});
  }
  const html=(piece,instrument)=>`<p class="practice-description">${esc(text(piece,instrument))}</p>`;
  return{describe,text,html,interval,form};
})();
