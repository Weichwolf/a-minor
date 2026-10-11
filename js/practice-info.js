AM.practiceInfo = (() => {
  const M=AM.music,t=k=>AM.i18n.t(k),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const display=s=>s.replace(/#/g,'♯').replace(/b/g,'♭'),strip=s=>s.replace(/-?\d+$/,'');
  const format=(k,v)=>t(k).replace(/\{(\w+)\}/g,(_,n)=>v[n]);
  function describe(piece,instrument){
    const unique=piece.sections.filter((s,i,ss)=>ss.findIndex(x=>x.name===s.name)===i),rootMidi=M.midi(piece.root+'3'),iv=M.SCALES[piece.scale].iv;
    const melody=new Map(),harmonic=new Set(),durations=new Set(),used=new Set();let rests=false,number=0;
    const sections=unique.map(s=>({name:s.name,length:s.bars.length,bars:s.bars.map(b=>{
      const d=b.harmony?.degree??iv.indexOf(M.pc(M.midi(b.bass.find(n=>!n.r).p)-rootMidi));
      const triad=M.chord(piece.root,piece.scale,d),acc=M.degreeOf(M.midi(piece.root+'3')+iv[d],piece.root,piece.scale).replace(/\d/g,'');
      return{number:++number,chord:b.chord,roman:acc+(b.harmony?.roman??triad.roman),degree:d};
    })}));
    for(const s of unique)for(const voice of ['notes',...(instrument==='keys'?['bass']:[])]){
      let previous,tied=false;
      for(const n of s.bars.flatMap(b=>b[instrument][voice])){
        durations.add(n.d);if(n.r){rests=true;tied=false;continue;}
        const pitches=[].concat(n.p).map(M.midi);pitches.forEach(p=>used.add(M.pc(p)));
        for(let i=0;i<pitches.length;i++)for(let j=i+1;j<pitches.length;j++)harmonic.add(Math.abs(pitches[j]-pitches[i]));
        if(pitches.length!==1){previous=undefined;tied=false;continue;}
        if(previous!==undefined&&!tied){const distance=Math.abs(pitches[0]-previous);melody.set(distance,(melody.get(distance)||0)+1);}
        previous=pitches[0];tied=!!n.tie;
      }
    }
    const rhythms=[];
    for(const [p,k]of [['w','Whole'],['h','Half'],['q','Quarter'],['e','Eighth'],['s','Sixteenth']])if([...durations].some(d=>d.startsWith(p)&&!d.endsWith('t')))rhythms.push(k);
    if([...durations].some(d=>d.endsWith('t')))rhythms.push('Triplet');if([...durations].some(d=>d.endsWith('.')))rhythms.push('Dotted');if(rests)rhythms.push('Rest');
    const melodicIntervals=[...melody].sort((a,b)=>b[1]-a[1]||a[0]-b[0]).map(([semitones,count])=>({semitones,count}));
    return{root:piece.root,scale:piece.scale,style:piece.style??'legacy',focus:piece.focus??'phrase',form:piece.form,time:piece.time,tempo:piece.tempo,
      sections,usedNotes:[...used].sort((a,b)=>a-b).map(pc=>strip(M.scaleName(60+pc,piece.root,piece.scale))),
      melodicIntervals,harmonicIntervals:[...harmonic].sort((a,b)=>a-b),rhythms,swing:unique.some(s=>s.bars.some(b=>b.swing)),
      sectionLengths:sections.map(s=>s.name+':'+s.length),progressions:sections.map(s=>s.name+': '+s.bars.map(b=>b.chord).filter((c,i,cs)=>i===0||c!==cs[i-1]).join('–'))};
  }
  function interval(n){return n<=12?t('interval'+n):format('intervalCompound',{octaves:Math.floor(n/12),interval:t('interval'+(n%12))});}
  function text(piece,instrument){
    const d=describe(piece,instrument),top=d.melodicIntervals.slice(0,piece.grade===0?2:3).map(x=>x.semitones);
    const largest=Math.max(0,...d.melodicIntervals.map(x=>x.semitones));if(largest>Math.max(0,...top)&&largest>=5)top.push(largest);
    if(d.harmonicIntervals.includes(7)&&!top.includes(7))top.push(7);
    const progress=d.sections.map(s=>s.name+': '+s.bars.map(b=>display(b.chord)+(piece.grade>=2?' ('+display(b.roman)+')':'')).filter((c,i,cs)=>i===0||c!==cs[i-1]).join('–')).join('; ');
    const rhythm=d.rhythms.filter(k=>!['Whole','Rest'].includes(k)).map(k=>t('practiceRhythm'+k)).join(', ')+(d.swing?', '+t('swingFeel'):'');
    return format('pieceSentence',{style:t('style_'+d.style),root:display(d.root),scale:t('scale_'+d.scale),form:piece.sections.map(s=>s.name).join('–'),time:d.time,
      chords:progress,intervals:top.length?top.map(interval).join(', '):d.harmonicIntervals.map(interval).join(', '),rhythm,focus:t(instrument==='guitar'&&d.focus==='voices'?'focus_guitarVoices':'focus_'+d.focus)});
  }
  const html=(piece,instrument)=>`<p class="practice-description">${esc(text(piece,instrument))}</p>`;
  return{describe,text,html,interval};
})();
