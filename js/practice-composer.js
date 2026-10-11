// Version 2. Legacy links keep using practice-generator; bookmarks contain the score itself.
AM.practiceComposer = (() => {
  const M=AM.music, N=AM.notation, clone=v=>JSON.parse(JSON.stringify(v));
  const version=2, styles=['rock','doom','gothic','progressive','baroque','lounge','cinematic'];
  const profiles=[
    {maxFret:5,tempo:[54,72],focus:['pulse','phrase']},
    {maxFret:5,tempo:[60,84],focus:['eighths','changes']},
    {maxFret:7,tempo:[64,88],focus:['syncopation','dotted','sixteenths']},
    {maxFret:9,tempo:[60,88],focus:['arpeggios','triplets','compound','dominant']},
    {maxFret:12,tempo:[60,90],focus:['oddMeter','lydian','sequence','phrasing']},
    {maxFret:12,tempo:[66,100],focus:['voices','comping','development','arrangement']}
  ];
  const cells={
    pulse:['h h','q q h','h q q'],phrase:['q q h','h q q','q q q q'],
    eighths:['e e q h','q e e q q','e e e e h'],changes:['q q h','h q q','q q q q'],
    syncopation:['e q e h','q e q e q'],dotted:['q. e q q','q q. e q'],
    sixteenths:['q s s e h','s s e q q q'],
    arpeggios:['e e e e q q','q e e e e q'],triplets:['et et et q q q','q et et et q q'],
    dominant:['q e e q q','e e q h'],lydian:['q q h','q e e q q'],
    sequence:['e e e e q q','q e e e e q'],phrasing:['q q h','e e q h'],
    voices:['e e q q q','q e e q q'],comping:['e q e q q','q e e q e e'],
    development:['e e s s e q q','q. e e e q'],arrangement:['q e e q q','e e q e e q']
  };
  function random(seed){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let n=Math.imul(s^s>>>15,1|s);n^=n+Math.imul(n^n>>>7,61|n);return((n^n>>>14)>>>0)/4294967296;};}
  function held(p,time,rest=false){
    const ds={'4/4':['w'],'3/4':['h.'],'12/8':['h.','h.'],'5/8':['q','q','e'],'7/8':['q','q','q','e']}[time];
    return ds.map((d,i)=>rest?{r:1,d}:{p:clone(p),d,...(i<ds.length-1?{tie:1}:{})});
  }
  function tuplets(notes){for(let i=0;i<notes.length;i++)if(notes[i].d.endsWith('t')){notes[i].tuplet=3;notes[i+2].tupletEnd=true;i+=2;}return notes;}
  function generate(grade,seed,requestedStyle='mixed'){
    if(!Number.isInteger(grade)||grade<0||grade>5||!Number.isInteger(seed)||seed<0||seed>0xffffffff||!['mixed',...styles].includes(requestedStyle))throw Error('Invalid practice settings');
    const rng=random(seed),pick=xs=>xs[Math.floor(rng()*xs.length)],profile=profiles[grade];
    const style=requestedStyle==='mixed'?pick(styles):requestedStyle;
    let focus=pick(profile.focus),scale='aeolian';
    if(style==='baroque'&&grade>=3)focus=pick(['arpeggios','dominant','sequence'].filter(x=>x!=='sequence'||grade>=4));
    if(style==='progressive'&&grade>=4&&rng()<.65)focus='oddMeter';
    if(style==='lounge'&&grade>=2&&rng()<.5)focus='syncopation';
    if(style==='baroque'&&grade>=3||focus==='dominant')scale='harmonicMinor';
    else if(focus==='lydian')scale='lydian';
    else if(style==='lounge'&&grade>=1)scale=pick(['major','dorian']);
    else if(style==='rock'&&grade>=1&&rng()<.35)scale='major';
    else if(style==='doom'&&grade>=1&&rng()<.35)scale='phrygian';
    const major=['major','lydian'].includes(scale),root=pick(['A','D','E']),key=root+(major?'':'m'),iv=M.SCALES[scale].iv;
    let time=focus==='compound'?'12/8':focus==='oddMeter'?pick(['5/8','7/8']):'4/4';
    if(grade===1&&['baroque','lounge','cinematic'].includes(style)&&rng()<.35)time='3/4';
    if(grade>=5&&style==='cinematic'&&rng()<.3)time='12/8';
    const meter=M.meter(time),len=meter.len,swing=style==='lounge'&&grade>=3&&time==='4/4'&&!['sixteenths','triplets','development'].includes(focus)&&rng()<.5;
    let tempo=profile.tempo[0]+Math.floor(rng()*(profile.tempo[1]-profile.tempo[0]+1));
    if(style==='doom')tempo=Math.max(48,tempo-12);
    const pitch=(d,oct)=>M.scaleName(M.midi(root+oct)+iv[((d%7)+7)%7]+Math.floor(d/7)*12,root,scale);
    const lowRoot=d=>{let m=M.midi(pitch(d,2));while(m>55)m-=12;return M.scaleName(m,root,scale);};
    const plan=grade===0?pick([['A',2,'A',2],['A',2,'B',2],['A',4,'B',4]]):
      grade===1?pick([['A',4,'B',4],['A',4,'B',4,'A',4]]):
      grade===2?pick([['A',4,'A′',4,'B',4],['A',4,'B',4,'A',4,'C',4]]):
      grade===3?pick([['A',4,'B',4,'A',4],['A',4,'A',4,'B',4,'A',4],['A',4,'B',4,'A',4,'C',4]]):
      grade===4?pick([['A',4,'B',4,'A′',4],['A',4,'B',4,'A',4,'C',4],['A',4,'B',4,'A',4,'C',4,'A',4],...(focus==='phrasing'&&time==='4/4'?[['A',4,'B',4,'A′',3]]:[])]):
      pick([['A',4,'A',4,'B',4,'A',4],['A',4,'A′',4,'B',4,'A',4],['A',4,'B',4,'A',4,'C',4,'A',4],['I',2,'A',4,'B',4,'A',4,'O',2],['A',8,'B',8,'A',8]]);
    const lengths=new Map();for(let i=0;i<plan.length;i+=2)lengths.set(plan[i],plan[i+1]);
    const last=plan.at(-2),aCloses=last==='A';
    // Harmonic templates have a destination; the phrase ending is composed to match it.
    const loop=grade===0?[0,0,0,0]:scale==='lydian'?[0,5,1,4]:major?[0,5,3,4]:style==='cinematic'?[0,5,2,6]:
      style==='doom'?(scale==='phrygian'?[0,0,1,0]:[0,0,5,4]):style==='gothic'?[0,6,5,4]:
      style==='baroque'||scale==='harmonicMinor'?[0,3,4,0]:style==='lounge'?[0,3,4,0]:[0,3,6,4];
    const contrast=grade===0?[3,3,0,0]:scale==='lydian'?[1,5,4,0]:major?[3,1,4,0]:scale==='phrygian'?[1,3,1,0]:[3,5,4,0];
    const harmonies={};
    for(const [name,count]of lengths){
      const base=name==='B'||name==='C'?contrast:loop;
      const ds=Array.from({length:count},(_,i)=>base[i%4]);
      if(grade===0&&count===2&&name==='B')ds[0]=3;
      if(name===last||name==='A'&&aCloses||name==='O'){
        ds[ds.length-1]=0;if(grade>0&&ds.length>=3)ds[ds.length-2]=scale==='phrygian'?1:4;
      }
      harmonies[name]=ds;
    }
    function rhythm(){
      if(grade===0)return pick({rock:['q q h','q q q q'],doom:['h h','h q q'],gothic:['h q q','q q h'],progressive:['q q h','h q q'],baroque:['q q q q','q q h'],lounge:['h h','q q h'],cinematic:['h q q','h h']}[style]).split(' ');
      if(time==='3/4')return pick(['q q q','h q','e e q q']).split(' ');
      if(time==='12/8')return pick(['e e e q. e e e q.','q. q. q. q.']).split(' ');
      if(time==='5/8')return pick(['q q e','e e q e']).split(' ');
      if(time==='7/8')return pick(['q q q e','e e q e e e']).split(' ');
      if(style==='doom'&&grade<2)return pick(['h h','h q q']).split(' ');
      return pick(cells[focus]||cells.arpeggios).split(' ');
    }
    const motifRhythms=[rhythm(),rhythm()],contour=grade===0?{rock:[0,0,2,1],doom:[0,2,1,0],gothic:[0,1,0,2],progressive:[0,2,0,1],baroque:[0,1,2,1],lounge:[0,1,2,0],cinematic:[0,2,1,0]}[style]:pick([[0,2,1,0,1,2,1,0],[0,1,2,1,0,2,1,0],[0,2,3,2,1,0,1,2]]);
    const limit=grade===0?4:grade===1?5:7;
    const triad=d=>[0,2,4].map(o=>pitch(d+o,2));
    function voiced(d,center=52,size=3){
      const pcs=Array.from({length:size},(_,i)=>M.pc(M.midi(pitch(d+i*2,2))));
      const choices=[];
      for(let bottom=Math.max(43,center-9);bottom<=Math.min(78,center+3);bottom++)if(pcs.includes(M.pc(bottom))){
        const ns=[bottom];for(let m=bottom+1;m<bottom+12&&ns.length<size;m++)if(pcs.includes(M.pc(m)))ns.push(m);
        if(ns.length===size)choices.push(ns);
      }
      const best=choices.sort((a,b)=>Math.abs(a.reduce((s,n)=>s+n,0)/size-center)-Math.abs(b.reduce((s,n)=>s+n,0)/size-center))[0];
      return best.map(m=>M.scaleName(m,root,scale));
    }
    function guitarChord(d){
      const base=M.midi(pitch(d,2));
      for(const octave of [0,12])for(let s=0;s<5;s++){
        const ns=[base+octave,base+octave+7],fs=ns.map((n,i)=>n-M.midi(M.TUNING[s+i]));
        if(fs.every(f=>f>=0&&f<=profile.maxFret)&&Math.max(...fs)-Math.min(...fs)<=4)return{p:ns.map(m=>M.name(m,M.usesFlats(key))),s:[s,s+1]};
      }
      throw Error('Unplayable guitar chord');
    }
    function melody(name,bar,d,count,oct){
      const ending=bar===count-1&&(name===last||name==='A'&&aCloses||name==='O');
      if(ending){
        const closing={'4/4':['q','q','h'],'3/4':['q','h'],'12/8':['q.','q.','h.'],'5/8':['e','e','q.'],'7/8':['e','e','q','q.']}[time];
        return closing.map((dur,i)=>({p:pitch(i===closing.length-1?0:i===0?2:1,oct),d:dur}));
      }
      const ds=motifRhythms[(bar+(grade===0&&style==='progressive'&&name==='B'?1:0))%2],variant=name==='B'?1:name==='C'||name==='A′'?-1:0;
      const arpeggio=grade>=3&&(focus==='arpeggios'||style==='baroque')&&name==='B';
      // Each cell returns to its chord. A and its varied return retain their rhythmic identity.
      const candidates=[d%7,(d+2)%7,(d+4)%7].filter(x=>x<=limit);
      const anchor=grade===0?(d===3?3:0):candidates.sort((a,b)=>Math.abs(a-2)-Math.abs(b-2))[0]??0;
      const notes=ds.map((dur,i)=>{
        let degree=arpeggio?(d+[0,2,4,2][i%4])%8:Math.max(0,Math.min(limit,anchor+contour[(i+(bar%2)*2)%contour.length]+variant));
        if(i===0)degree=anchor;
        return{p:pitch(degree,oct),d:dur,...(i===0&&grade>=2?{accent:1}:{}),...(style==='rock'&&grade>=1&&dur==='e'?{staccato:1}:{})};
      });
      if(bar===count-1&&notes.length>2&&!notes.at(-1).d.endsWith('t'))notes[notes.length-1]={r:1,d:notes.at(-1).d};
      return tuplets(notes);
    }
    function leftHand(d,name){
      const bass=lowRoot(d);
      if(grade<2)return held(bass,time);
      const fifth=M.scaleName(M.midi(bass)+M.midi(pitch(d+4,2))-M.midi(pitch(d,2)),root,scale);
      if(grade===2){
        if(time==='4/4')return[{p:bass,d:'h'},{p:fifth,d:'h'}];
        return held(bass,time);
      }
      const ps=voiced(d,51,style==='lounge'&&grade>=4?4:3);
      if(time==='12/8')return[{p:bass,d:'q.'},{p:ps,d:'q.'},{p:bass,d:'q.'},{p:ps,d:'q.'}];
      if(time==='5/8'||time==='7/8')return meter.groups.map((g,i)=>({p:i%2?ps:bass,d:g===3?'q.':'q',accent:1}));
      if(focus==='comping'||style==='lounge')return[{p:bass,d:'q'},{r:1,d:'e'},{p:ps,d:'e'},{p:ps,d:'q'},{p:ps,d:'q'}];
      if(style==='cinematic'||style==='gothic'||style==='baroque')return [bass,ps[0],ps[1],ps[2]].map(p=>({p,d:'q'}));
      return[{p:bass,d:'h'},{p:ps,d:'h'}];
    }
    const parts={};
    for(const [name,count]of lengths)parts[name]=Array.from({length:count},(_,bar)=>{
      const d=harmonies[name][bar],harmony=M.chord(root,scale,d),seventh=style==='lounge'&&grade>=4;
      const seventhSize=M.midi(pitch(d+6,2))-M.midi(pitch(d,2));
      const suffix=harmony.quality==='m'?(seventhSize===11?'m(maj7)':'m7'):harmony.quality===''?(seventhSize===11?'maj7':'7'):harmony.quality==='°'?'m7♭5':harmony.quality+'7';
      const chord=pitch(d,2).replace(/-?\d+$/,'')+(seventh?suffix:harmony.quality);
      let right=melody(name,bar,d,count,4),left=leftHand(d,name),guitar=melody(name,bar,d,count,3).map(n=>{
        if(n.r)return n;const pos=M.position(M.midi(n.p),{maxFret:profile.maxFret});if(!pos)throw Error('Unplayable melody');return{...n,s:pos.s};
      });
      if(grade>0&&name==='B'&&['rock','doom','gothic','progressive'].includes(style)){
        const voicing=guitarChord(d),ds=grade===1?held('E3',time).map(n=>n.d):motifRhythms[bar%2];
        guitar=tuplets(ds.map((dur,i)=>({...clone(voicing),d:dur,...(i===0?{accent:1}:{}),...(style==='rock'?{staccato:1}:{})})));
      }
      if(grade===5&&focus==='voices'&&name==='B'){
        // Hand roles exchange in separate registers, without crossing or duplicate pitches.
        left=melody(name,bar,d,count,3);right=held(voiced(d,76,seventh?4:3),time);
      }
      const drum=AM.backing.build({time,bars:1,type:'drums',drums:swing?'shuffle':grade===0?'half':meter.compound?'compound':meter.d===8?'grouped':'straight'});
      return{time,key,chord,harmony:{degree:d,roman:harmony.roman+(seventh?(seventhSize===11?'maj7':'7'):''),notes:seventh?voiced(d,51,4):triad(d)},...(swing?{swing:true}:{}),
        guitar:{notes:guitar,bass:held('E2',time,true)},keys:{notes:right,bass:left},bass:held(lowRoot(d),time),
        drums:drum.events.map(n=>({t:n.t,midi:{kick:36,snare:38,hat:42}[n.type],dur:Math.min(.12,len-n.t),velocity:Math.round(n.vel*95)})),
        dynamics:{guitar:68+(name==='B'?6:0)+[0,3,6,0][bar%4],keys:65+(name==='B'?5:0)+[0,3,6,0][bar%4],bass:62}};
    });
    let number=0,startBeat=0;
    const sections=[];for(let i=0;i<plan.length;i+=2){const name=plan[i],bars=clone(parts[name]).map(b=>({...b,number:++number}));sections.push({name,startBar:number-bars.length+1,startBeat,time,groups:meter.groups,bars});startBeat+=bars.length*len;}
    const form=sections.map(s=>s.name).join('');
    const piece={id:`practice-v${version}-${grade}-${requestedStyle}-${seed}`,generatorVersion:version,grade,seed,requestedStyle,style,focus,root,scale,key,time,tempo,maxFret:profile.maxFret,bars:number,uniqueBars:[...lengths.values()].reduce((a,b)=>a+b,0),form,
      programs:{guitar:style==='baroque'||style==='lounge'?24:grade===0?27:29,keys:0,bass:33,drums:0},prerequisites:[],sections};
    return{piece,score:piece,bytes:AM.practiceGenerator.encode(piece)};
  }
  return{version,styles,profiles,generate};
})();
