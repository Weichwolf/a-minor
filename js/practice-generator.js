AM.practiceGenerator = (() => {
  const M = AM.music, N = AM.notation, MIDI = AM.midi;
  // The grade boundaries are the same as in the repertoire curriculum.
  const profiles = [
    {phases:[0],maxFret:5,scales:['aeolian'],times:['4/4'],tempo:[52,68]},
    {phases:[1,2],maxFret:5,scales:['aeolian','phrygian'],times:['4/4','3/4'],tempo:[60,82]},
    {phases:[3],maxFret:7,scales:['aeolian','phrygian'],times:['4/4'],tempo:[60,88]},
    {phases:[4,5],maxFret:9,scales:['harmonicMinor','aeolian'],times:['4/4','12/8'],tempo:[52,80]},
    {phases:[6,7],maxFret:12,scales:['aeolian','lydian'],times:['4/4','5/8','7/8'],tempo:[54,84]},
    {phases:[8],maxFret:12,scales:['aeolian','phrygian','harmonicMinor','lydian'],times:['4/4','12/8','7/8'],tempo:[60,92]}
  ];
  const rhythms = {
    '4/4': [
      ['h h','q q h','h q q','q q q q'],
      ['e e q h','q e e h','e e e e q q','q q e e q'],
      ['q. e q q','e q e h','q s s e q q','e e q e q e'],
      ['et et et q et et et q','q et et et h','e e e e e e q'],
      ['qt qt qt qt qt qt','e e s s e q q','q. e e e q'],
      ['s s e e e q e e','et et et e e et et et e e','e q e e e q']
    ],
    '3/4': [['h q','q q q','q h'],['e e q q','q e e q','e e e e q']],
    '12/8': [['q. q. q. q.','e e e q. e e e q.','e e e e e e e e e q.']],
    '5/8': [['q q e','e e q e','e e e e e']],
    '7/8': [['q q q e','e e q e e e','q e e e q']]
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  function random(seed) {
    let state = seed >>> 0;
    return () => {
      state += 0x6D2B79F5;
      let n = Math.imul(state ^ state >>> 15, 1 | state);
      n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }
  function generate(grade, seed) {
    if (!Number.isInteger(grade) || grade < 0 || grade > 5 || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw Error('Invalid practice settings');
    const profile = profiles[grade], rng = random(seed), choose = list => list[Math.floor(rng()*list.length)];
    const root = choose(['E','A','D']), scale = choose(profile.scales), time = choose(profile.times);
    const iv = M.SCALES[scale].iv, major = scale === 'lydian', key = root + (major ? '' : 'm');
    const meter = M.meter(time), len = meter.len, tempo = profile.tempo[0] + Math.floor(rng()*(profile.tempo[1]-profile.tempo[0]+1));
    const pitch = (degree,octave) => M.scaleName(M.midi(root+octave) + iv[((degree%7)+7)%7] + Math.floor(degree/7)*12,root,scale);
    const rest = () => time === '3/4' ? [{r:1,d:'h.'}] : time === '12/8' ? [{r:1,d:'h.'},{r:1,d:'h.'}] : time === '5/8' ? [{r:1,d:'h'},{r:1,d:'e'}] : time === '7/8' ? [{r:1,d:'h.'},{r:1,d:'e'}] : [{r:1,d:'w'}];
    const held = p => rest().map(n => ({p,d:n.d}));
    function rhythm() {
      const levels = rhythms[time], available = levels.slice(0,Math.min(grade+1,levels.length)).flat();
      return choose(available).split(' ');
    }
    function tuplets(notes) {
      for (let i=0;i<notes.length;i++) if (notes[i].d.endsWith('t') && (i===0 || !notes[i-1].d.endsWith('t') || notes[i-1].tupletEnd)) {
        notes[i].tuplet=3; notes[i+2].tupletEnd=true; i+=2;
      }
      return notes;
    }
    const limit = grade === 0 ? 4 : 7;
    const motif = Array.from({length:4},(_,bar) => {
      const durs = rhythm(); let degree = bar === 0 ? 0 : choose([0,2,4]);
      return durs.map((d,i) => {
        if (i) degree = Math.max(0,Math.min(limit,degree+choose(grade===0 ? [-1,0,1] : [-2,-1,1,2])));
        return {degree,d};
      });
    });
    const harmony = grade===0 ? {A:[0,0,0,0],B:[0,0,0,0],C:[0,0,0,0]} : major ? {
      A:choose([[0,4,1,4],[0,5,1,4]]),B:choose([[1,5,4,4],[5,1,0,4]]),C:choose([[5,1,4,0],[1,5,4,0]])
    } : scale==='phrygian' ? {
      A:grade===2 ? [0,6,5,1] : choose([[0,0,1,0],[0,6,3,1]]),B:choose([[1,3,6,1],[3,0,6,1]]),C:choose([[6,3,1,0],[3,5,1,0]])
    } : scale==='harmonicMinor' ? {
      A:choose([[0,0,5,4],[0,5,3,4]]),B:choose([[3,5,0,4],[5,3,0,4]]),C:choose([[5,3,4,0],[3,5,4,0]])
    } : {
      A:grade===2 ? [0,6,5,4] : choose([[0,0,5,4],[0,5,3,4],[0,6,5,4]]),
      B:choose([[3,5,6,4],[5,3,6,4],[3,0,5,4]]),C:choose([[5,3,4,0],[3,5,4,0],[6,3,4,0]])
    };
    function chord(degree,octave,wrapped=false) {
      return [0,2,4].map(offset=>pitch(wrapped ? (degree+offset)%7 : degree+offset,octave)).sort((a,b)=>M.midi(a)-M.midi(b));
    }
    function chordName(degree) {
      const ps=chord(degree,2), third=M.midi(ps[1])-M.midi(ps[0]), fifth=M.midi(ps[2])-M.midi(ps[0]);
      return ps[0].replace(/-?\d+$/,'') + (fifth===6 ? '°' : third===3 ? 'm' : '');
    }
    function guitarPosition(p) {
      const position=M.position(M.midi(p),{maxFret:profile.maxFret});
      if (!position) throw Error('Unplayable generated pitch');
      return position.s;
    }
    function guitarChord(degree,quartal=false) {
      const offsets=quartal ? [0,5,10] : [0,7];
      const base=M.midi(pitch(degree,2));
      for (const octave of [0,12]) for (let s=0;s<=6-offsets.length;s++) {
        const ps=offsets.map(offset=>base+octave+offset), frets=ps.map((m,i)=>m-M.midi(M.TUNING[s+i]));
        if (frets.every(f=>f>=0&&f<=profile.maxFret) && Math.max(...frets)-Math.min(...frets)<=4) return {p:ps.map(m=>M.name(m,M.usesFlats(key))),s:ps.map((_,i)=>s+i)};
      }
      throw Error('Unplayable generated chord');
    }
    function melody(name,bar,degree,octave) {
      let cell=clone(motif[bar]);
      if (name==='B') cell=cell.map(n=>({...n,degree:Math.min(limit,n.degree+1)}));
      if (name==='C') cell=cell.map(n=>({...n,degree:Math.max(0,n.degree-1)}));
      if (grade>=3 && name==='B' && bar<3) cell=rhythm().map((d,i)=>({d,degree:Math.min(limit,(degree+[0,2,4,2][i%4])%8)}));
      if (grade>0) cell[0].degree=degree%7;
      if (name==='C' && bar===3) {
        const closing=time==='3/4'?'q h':time==='12/8'?'e e e q. h.':time==='5/8'?'e e q.':time==='7/8'?'e e q q.':['q q h','e e q h','q. e h','et et et q h','qt qt qt h','s s e q h'][grade];
        cell=closing.split(' ').map((d,i)=>({d,degree:i===0?2:i===1?1:0}));
        cell[cell.length-1].degree=0;
      }
      const notes=cell.map((n,i)=>({p:pitch(n.degree,octave),d:n.d,...(i===0&&grade>=2?{accent:1}:{})}));
      // Leave a breath at phrase ends, but always sound the final tonic.
      if (bar===3 && name!=='C' && notes.length>2 && !notes.at(-1).d.endsWith('t')) notes[notes.length-1]={r:1,d:notes.at(-1).d};
      return tuplets(notes);
    }
    function leftHand(degree,name,bar) {
      if (grade===0) return held(pitch(0,2));
      if (grade===1 || time==='3/4') return held(pitch(degree,2));
      if (time==='12/8') return Array.from({length:4},(_,i)=>({p:grade>=3 ? chord(degree,2) : pitch(degree+(i%2?4:0),2),d:'q.'}));
      if (time==='5/8' || time==='7/8') return Array.from({length:meter.n},(_,i)=>({p:pitch(degree+(i%2?4:0),2),d:'e',...(i===0?{accent:1}:{})}));
      if (grade>=3 && name==='B') return [{p:chord(degree,2),d:'q'},{r:1,d:'e'},{p:chord(degree,2),d:'e'},{p:chord(degree,2),d:'q'},{p:chord(degree,2),d:'q'}];
      return [0,4,0,bar===3?0:4].map(offset=>({p:pitch(degree+offset,2),d:'q'}));
    }
    function makePart(name) {
      return Array.from({length:4},(_,bar) => {
        const degree=harmony[name][bar], notes=melody(name,bar,degree,3);
        let right=melody(name,bar,degree,4),left=leftHand(degree,name,bar);
        let guitar=notes.map(n=>n.r ? n : {...n,s:guitarPosition(n.p)}), symbol=chordName(degree);
        if (grade>0 && name==='B') {
          const quartal=grade>=4&&[0,3,4,6].includes(degree)&&scale==='aeolian', voicing=guitarChord(degree,quartal);
          const durs=grade===1 ? rest().map(n=>n.d) : rhythm();
          guitar=tuplets(durs.map((d,i)=>({...clone(voicing),d,...(i===0?{accent:1}:{})})));
          if (quartal) {
            symbol=voicing.p.map(p=>p.replace(/-?\d+$/,'')).join('–');
            const low=M.midi(pitch(degree,2)),ps=[0,5,10].map(offset=>M.name(low+offset,M.usesFlats(key)));
            left=left.map(n=>n.r?n:{...n,p:clone(ps)});
          }
          if(grade===1&&rng()<.5)right=held(chord(degree,4,true));
        }
        const drumPattern=AM.backing.build({time,bars:1,type:'drums',drums:grade===0?'half':meter.compound?'compound':meter.d===8?'grouped':'straight'});
        const drums=drumPattern.events.map(n=>({t:n.t,midi:{kick:36,snare:38,hat:42}[n.type],dur:Math.min(.12,len-n.t),velocity:Math.round(n.vel*100)}));
        const dynamics={guitar:70+[0,5,9,2][bar],keys:64+[0,5,9,2][bar],bass:66};
        return {time,key,chord:symbol,guitar:{notes:guitar,bass:rest()},keys:{notes:right,bass:left},bass:held(pitch(degree,2)),drums,dynamics};
      });
    }
    // Compose twelve bars once. The second A is an exact copy of the first.
    const parts={A:makePart('A'),B:makePart('B'),C:makePart('C')};
    let startBeat=0,number=0;
    const sections=['A','B','A','C'].map(name=>{
      const section={name,startBar:number+1,startBeat,time,groups:meter.groups,bars:clone(parts[name]).map(b=>({...b,number:++number}))};
      startBeat+=4*len;return section;
    });
    const piece={id:'practice-'+grade+'-'+seed,grade,seed,root,scale,key,time,tempo,maxFret:profile.maxFret,bars:16,uniqueBars:12,form:'ABAC',programs:{guitar:grade===0?27:29,keys:0,bass:33,drums:0},prerequisites:profile.phases.flatMap(p=>['p'+p,'k'+p]),sections};
    return {piece,score:piece,bytes:encode(piece)};
  }
  function encode(piece) {
    const events=[{tick:0,data:MIDI.text(3,'a-minor · ABAC · Grade '+piece.grade),order:-10}];
    for (const [role,ch] of Object.entries(MIDI.channels)) events.push(
      {tick:0,data:[176|ch,121,0],order:-9},{tick:0,data:[176|ch,0,0],order:-8},{tick:0,data:[176|ch,32,0],order:-8},
      {tick:0,data:[192|ch,piece.programs[role]],order:-7},{tick:0,data:[176|ch,7,{guitar:100,keys:82,bass:88,drums:80}[role]],order:-6}
    );
    let beat=0;
    const note=(n,ch,velocity) => {
      const on=Math.round((beat+n.t)*480),off=Math.round((beat+n.t+n.dur)*480);
      events.push({tick:on,data:[144|ch,n.midi,velocity],order:2},{tick:off,data:[128|ch,n.midi,0],order:-1});
    };
    for (const section of piece.sections) {
      const m=M.meter(section.time,section.groups), sf=M.KEYS[piece.key]??0;
      events.push({tick:Math.round(beat*480),data:MIDI.text(6,section.name),order:-10},
        {tick:Math.round(beat*480),data:MIDI.tempo(piece.tempo*m.q),order:-10},
        {tick:Math.round(beat*480),data:MIDI.meta(88,[m.n,Math.log2(m.d),m.compound?36:24,8]),order:-10},
        {tick:Math.round(beat*480),data:MIDI.meta(89,[(sf+256)%256,piece.key.endsWith('m')?1:0]),order:-10});
      for (const bar of section.bars) {
        for (const role of ['guitar','keys']) for (const n of N.events({...bar[role],time:bar.time})) note(n,MIDI.channels[role],bar.dynamics[role]+(n.accent?10:0)-(n.voice===1?12:0));
        for (const n of N.events({notes:bar.bass,time:bar.time})) note(n,MIDI.channels.bass,bar.dynamics.bass);
        for (const n of bar.drums) note(n,MIDI.channels.drums,n.velocity);
        beat+=m.len;
      }
    }
    return MIDI.encode(events,Math.round(beat*480));
  }
  return {generate,profiles};
})();
