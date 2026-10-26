// One MIDI arrangement, encoded from the same four written parts used by the score.
AM.practiceGenerator = (() => {
  const N=AM.notation,M=AM.music,MIDI=AM.midi;
  const part=(bar,role)=>role==='bass'?{notes:bar.bass}:role==='drums'?bar.drumPart:bar[role];
  function encode(piece){
    const events=[{tick:0,data:MIDI.text(3,'a-minor · '+piece.form+' · Level '+piece.grade),order:-10}],meter=M.meter(piece.time),bars=piece.sections.flatMap(s=>s.bars),endTick=Math.round(bars.length*meter.len*480);
    // Clean playback also applies to saved scores with older guitar programs.
    const programFor=(role,bar)=>role==='guitar'?27:bar?.program??piece.programs[role];
    const volumes={guitar:84,keys:82,bass:88,drums:80};
    for(const [role,ch]of Object.entries(MIDI.channels))events.push({tick:0,data:[176|ch,121,0],order:-9},{tick:0,data:[176|ch,0,0],order:-8},{tick:0,data:[176|ch,32,0],order:-8},{tick:0,data:[192|ch,programFor(role)],order:-7},{tick:0,data:[176|ch,7,volumes[role]],order:-6});
    // A restrained guitar send into the existing room; drum ambience is unchanged.
    events.push({tick:0,data:[176|MIDI.channels.guitar,91,24],order:-6});
    for(const section of piece.sections){const at=Math.round(section.startBeat*480),m=M.meter(section.time,section.groups),sf=M.KEYS[piece.key]??0;events.push({tick:at,data:MIDI.text(6,section.name),order:-10},{tick:at,data:MIDI.tempo(piece.quarterTempo??piece.tempo*m.q),order:-10},{tick:at,data:MIDI.meta(88,[m.n,Math.log2(m.d),m.compound?36:24,8]),order:-10},{tick:at,data:MIDI.meta(89,[(sf+256)%256,piece.key.endsWith('m')?1:0]),order:-10});}
    for(const [role,ch]of Object.entries(MIDI.channels)){
      let program=programFor(role);bars.forEach((bar,i)=>{const value=programFor(role,part(bar,role));if(value!==program){events.push({tick:Math.round(i*meter.len*480),data:[192|ch,value],order:-7});program=value;}});
      const voices={notes:[],bass:[],inner:[]},hasInner=bars.some(b=>part(b,role).inner);for(const b of bars){const p=part(b,role);for(const v of Object.keys(voices))voices[v].push(...(p[v]||(v==='inner'&&hasInner?AM.practiceRhythm.held('C4',piece.time,true):[])));}
      for(const n of N.events({...voices,time:piece.time,swing:piece.swing})){
        const bar=bars[Math.min(bars.length-1,Math.floor((n.t+1e-8)/meter.len))],velocity=n.velocity??bar.dynamics[role]+(n.accent?10:0)-(role==='keys'&&n.voice===1?12:0)-(n.mute?12:0)-(n.ghost?30:0);
        events.push({tick:Math.round(n.t*480),data:[144|ch,n.midi,Math.max(1,Math.min(127,velocity))],order:2},{tick:Math.round((n.t+n.dur)*480),data:[128|ch,n.midi,0],order:-1});
      }
    }
    return MIDI.encode(events,endTick);
  }
  return{encode,part};
})();
