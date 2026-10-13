AM.practicePhrasing = (() => {
  const M=AM.music,N=AM.notation;
  // Choose a route across a complete phrase. Pitches, attacks and durations stay
  // fixed: this is physical planning, not an unnotated playback correction.
  function positions(note,tuning,maxFret){
    const pitches=[].concat(note.p).map(M.midi),out=[];
    function visit(index,strings,frets){
      if(index===pitches.length){
        const stopped=frets.filter(f=>f>0);
        if(stopped.length&&Math.max(...stopped)-Math.min(...stopped)>4)return;
        out.push({strings,frets,position:stopped.length?Math.min(...stopped):0});return;
      }
      for(let s=0;s<tuning.length;s++){
        const f=pitches[index]-M.midi(tuning[s]);
        if(f<0||f>maxFret||strings.includes(s))continue;
        if(index&&s!==strings[index-1]+1)continue;
        visit(index+1,[...strings,s],[...frets,f]);
      }
    }
    visit(0,[],[]);return out;
  }
  const same=(a,b)=>a.length===b.length&&a.every((s,i)=>s===b[i]);
  function movement(a,b,beats){
    const shift=Math.abs(a.position-b.position),cross=Math.abs(a.strings[0]-b.strings[0]);
    return (shift*shift+cross*2+Math.max(0,cross-1)*3)/Math.max(.25,beats);
  }
  function place(notes,{tuning=M.TUNING,maxFret=5,locked=0}={}){
    const attacks=[];let elapsed=0;
    for(let index=0;index<notes.length;index++){
      const note=notes[index];
      if(!note.r){
        let choices=positions(note,tuning,maxFret);
        if(index<locked)choices=choices.filter(p=>same(p.strings,[].concat(note.s)));
        if(!choices.length)throw Error('No playable phrase position');
        attacks.push({note,choices,at:elapsed,tiedFrom:notes[index-1]?.tie&&!notes[index-1].r?notes[index-1]:null});
      }
      elapsed+=N.dur(note.d);
    }
    if(!attacks.length)return;
    const layers=[];
    for(let i=0;i<attacks.length;i++){
      const a=attacks[i],previous=attacks[i-1];
      layers.push(a.choices.map(choice=>{
        const local=choice.position*.04;
        if(!previous)return{cost:local,from:-1};
        let cost=Infinity,from=-1;
        previous.choices.forEach((p,j)=>{
          // A tied note must remain on the same string throughout its sustain.
          if(a.tiedFrom){
            const old=[].concat(a.tiedFrom.p).map(M.midi),next=[].concat(a.note.p).map(M.midi);
            if(old.some((pitch,k)=>next.includes(pitch)&&p.strings[k]!==choice.strings[next.indexOf(pitch)]))return;
          }
          const candidate=layers[i-1][j].cost+movement(p,choice,a.at-previous.at)+local;
          if(candidate<cost){cost=candidate;from=j;}
        });
        return{cost,from};
      }));
    }
    let index=layers.at(-1).reduce((best,p,i,all)=>p.cost<all[best].cost?i:best,0);
    if(!Number.isFinite(layers.at(-1)[index].cost))throw Error('No continuous phrase position');
    for(let i=attacks.length-1;i>=0;i--){
      const {note,choices}=attacks[i],strings=choices[index].strings;
      note.s=Array.isArray(note.p)?[...strings]:strings[0];index=layers[i][index].from;
    }
  }
  function demands(piece){
    const sections=piece.sections.filter((s,i,all)=>all.findIndex(x=>x.name===s.name)===i),roles={};
    const maxDensity={guitar:[1,2,2,2,4,4],keys:[1,2,2,2,4,4],bass:[2,2,2,2,4,4],drums:[2,4,4,4,4,4]};
    for(const role of ['guitar','keys','bass','drums']){
      let density=0,rapidLeaps=0,transitions=0,asynchronous=0,handAttacks=0;
      for(const section of sections){
        const previous={},onsets=new Set();let offset=0;
        for(const bar of section.bars){
          const part=AM.practiceGenerator.part(bar,role),events=N.events({...part,time:piece.time,swing:piece.swing});
          const attacks=new Map();
          for(const e of events){
            onsets.add(offset+e.t);const tag=e.voice+':'+e.t;
            if(!attacks.has(tag))attacks.set(tag,{voice:e.voice,at:offset+e.t,pitches:[]});
            attacks.get(tag).pitches.push(e.midi);
          }
          for(const a of [...attacks.values()].sort((a,b)=>a.at-b.at)){
            const center=a.pitches.reduce((s,p)=>s+p,0)/a.pitches.length,last=previous[a.voice];
            if(last){transitions++;if(role!=='drums'&&a.at-last.at<=.5+1e-9&&Math.abs(center-last.center)>7)rapidLeaps++;}
            previous[a.voice]={at:a.at,center};
          }
          if(role==='keys'){
            const right=new Set(events.filter(e=>e.voice!==1).map(e=>e.t)),left=new Set(events.filter(e=>e.voice===1).map(e=>e.t));
            // A held accompaniment under a melody is not the same demand as
            // two moving rhythms. Measure only bars with multiple LH attacks.
            if(right.size>1&&left.size>1){handAttacks+=right.size+left.size;asynchronous+=[...right].filter(t=>!left.has(t)).length+[...left].filter(t=>!right.has(t)).length;}
          }
          offset+=M.meter(piece.time).len;
        }
        density=Math.max(density,onsets.size/offset);
      }
      roles[role]={density,rapidLeapRatio:transitions?rapidLeaps/transitions:0,independence:handAttacks?asynchronous/handAttacks:0};
    }
    const tonality=Math.min(1,Math.abs(M.KEYS[piece.key])/[3,4,4,5,6,6][piece.grade]);
    let combination=0;
    for(const [role,d] of Object.entries(roles)){
      const axes=[role==='drums'?0:tonality,Math.min(1,d.density/maxDensity[role][piece.grade]),Math.min(1,d.rapidLeapRatio*[3,2.5,2,1.5,1.25,1][piece.grade]),d.independence].sort((a,b)=>b-a);
      combination=Math.max(combination,axes[0]+axes[1]);
    }
    return{roles,tonality,combination};
  }
  function fitTempo(piece,range){
    const measured=demands(piece),requested=piece.quarterTempo;
    // Preserve the full reference range for uncomplicated material. When two
    // demands coincide, reserve tempo headroom instead of multiplying demands.
    const headroom=Math.max(0,measured.combination-1.4)/.6;
    const ceiling=Math.round(range[1]-(range[1]-range[0])*.55*headroom);
    piece.quarterTempo=Math.min(requested,ceiling);
    piece.tempo=Math.round(piece.quarterTempo/M.meter(piece.time).q*100)/100;
    return{...measured,requestedTempo:requested,tempoCeiling:ceiling};
  }
  return{place,positions,movement,demands,fitTempo};
})();
