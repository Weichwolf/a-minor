const {test}=require('node:test'),assert=require('node:assert/strict'),setup=require('./practice-fixture.cjs'),{plain}=setup;
const A=setup(),{practiceComposer:C,practiceGenerator:G,practiceRhythm:R,music:M,notation:N,midi:MIDI}=A;
test('rhythm grammar expresses arbitrary complete combinations of the grade values and rests',()=>{
 const profiles=C.profiles;assert(R.supports(['w'],profiles[0].rhythms.guitar));assert(R.supports(['q','h','q'],profiles[0].rhythms.keys));assert(!R.supports(['e','e','h','q'],profiles[0].rhythms.guitar));
 assert(R.supports(Array(16).fill('s'),profiles[1].rhythms.drums));assert(!R.supports(Array(16).fill('s'),profiles[1].rhythms.keys));assert(!R.supports(Array(16).fill('s'),profiles[3].rhythms.guitar));assert(R.supports(Array(16).fill('s'),profiles[4].rhythms.guitar));
 assert(R.supports(['q.','e','e.','s','q'],profiles[4].rhythms.keys));assert(R.supports(['et','et','et','q','h'],profiles[5].rhythms.keys));assert(!R.supports(['et','q','et','et','h'],profiles[5].rhythms.keys));
 for(let grade=0;grade<6;grade++)for(const role of C.instruments)for(let seed=0;seed<20;seed++){let state=seed+1;const rng=()=>((state=Math.imul(state,1664525)+1013904223>>>0)/4294967296),pattern=R.generate(profiles[grade].rhythms[role],{rng,restChance:.3,required:'s'});assert(R.supports(pattern,profiles[grade].rhythms[role]),`${grade}/${role}`);}
});
test('Rock generates the instrument-specific source skills, original tempo range, major/minor keys and full forms',()=>{
 const seen=Array.from({length:6},()=>({durs:Object.fromEntries(C.instruments.map(r=>[r,new Set()])),skills:Object.fromEntries(C.instruments.map(r=>[r,new Set()])),tempos:new Set(),keys:new Set(),times:new Set(),features:new Set()}));
 for(let grade=0;grade<6;grade++)for(let seed=0;seed<(grade===5?192:80);seed++){
  const {piece:p}=C.generate(grade,seed,'rock'),a=seen[grade];a.tempos.add(p.quarterTempo);a.keys.add(p.key);a.times.add(p.time);if(p.navigation)a.features.add('navigation');if(p.sections.some(s=>s.name==='S'))a.features.add('soloReturn');
  for(const role of C.instruments)a.skills[role].add(p.roleFocus[role]);
  for(const s of p.sections.filter((s,i,ss)=>ss.findIndex(x=>x.name===s.name)===i))for(const b of s.bars){for(const role of C.instruments){const part=G.part(b,role);for(const voice of ['notes','bass','inner'])for(const n of part[voice]||[]){a.durs[role].add(n.d);if(n.palmMute)a.features.add('palmMute');if(n.tie)a.features.add('ties');if(n.tuplet)a.features.add('triplets');}if(part.percentRepeat)a.features.add('rhythmChart');if(part.inner)a.features.add('inner');}
   if(grade===0){assert(b.keys.bass.every(n=>n.r));assert(b.guitar.notes.filter(n=>!n.r).every(n=>[].concat(n.p).length<=2));}
  }
 }
 for(let grade=0;grade<6;grade++){const a=seen[grade],range=C.profiles[grade].quarterTempo;assert(Math.min(...a.tempos)<=range[0]+3);assert(Math.max(...a.tempos)>=range[1]-3,`Grade ${grade}: uncomplicated material reaches the upper tempo range`);assert([...a.tempos].every(t=>t>=range[0]&&t<=range[1]));assert(a.keys.size>=10);for(const role of C.instruments)for(const skill of C.profiles[grade].skills[role])assert(a.skills[role].has(skill),`${grade}/${role}/${skill}`);}
 assert(seen[0].durs.drums.has('e'));assert(seen[1].durs.drums.has('s'));assert(!seen[3].durs.guitar.has('s'));assert(seen[4].durs.guitar.has('s'));assert(seen[4].durs.keys.has('s'));
 for(const feature of ['navigation','soloReturn','triplets','inner','rhythmChart'])assert(seen[5].features.has(feature),feature);assert(seen[5].times.has('12/8'));assert(seen[4].features.has('ties'));assert(seen[1].features.has('palmMute'));
});
test('encoded MIDI is exactly the four written parts, including swing, articulations, ties, velocities and section markers',()=>{
 for(let grade=0;grade<6;grade++)for(let seed=0;seed<10;seed++){
  const {piece:p,bytes}=C.generate(grade,seed,'rock'),seq=MIDI.decode(bytes),actual=[],held=new Map(),expected=[],bars=p.sections.flatMap(s=>s.bars),meter=M.meter(p.time);
  assert.equal(seq.endTick,p.bars*meter.len*480);assert(Math.abs(seq.duration-p.bars*meter.len*60/p.quarterTempo)<.002);assert.equal(seq.markers.map(m=>m.label).join(''),p.form);
  for(const e of seq.events){const [status,pitch,v]=e.data,ch=status&15,key=ch+':'+pitch;if(status>>4===9&&v){assert(!held.has(key),`${p.id}: retriggered sounding note ${key}`);held.set(key,e);}if(status>>4===8){const on=held.get(key);assert(on,`${p.id}: missing note-on ${key}`);actual.push([ch,pitch,on.tick,e.tick,on.data[2]]);held.delete(key);}}assert.equal(held.size,0);
  for(const [role,ch] of Object.entries(MIDI.channels)){
   const hasInner=bars.some(b=>G.part(b,role).inner),voices={};for(const voice of ['notes','bass','inner'])voices[voice]=bars.flatMap(b=>G.part(b,role)[voice]||(voice==='inner'&&hasInner?R.held('C4',p.time,true):[]));
   for(const n of N.events({...voices,time:p.time,swing:p.swing})){const b=bars[Math.min(bars.length-1,Math.floor((n.t+1e-8)/meter.len))],velocity=n.velocity??b.dynamics[role]+(n.accent?10:0)-(role==='keys'&&n.voice===1?12:0)-(n.mute?12:0)-(n.ghost?30:0);expected.push([ch,n.midi,Math.round(n.t*480),Math.round((n.t+n.dur)*480),Math.max(1,Math.min(127,velocity))]);}
  }const sort=xs=>xs.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);assert.deepEqual(sort(actual),sort(plain(expected)));assert.deepEqual([...new Set(actual.map(e=>e[0]))].sort((a,b)=>a-b),[3,5,6,9]);
 }
});
test('muting the written drums retains count-in clicks on the same percussion channel',()=>{
 const {bytes}=C.generate(0,3),seq=MIDI.decode(bytes),excerpt=MIDI.decode(MIDI.excerpt(seq,{countIn:4,pulse:.5,muteChannels:[9]})),hits=excerpt.events.filter(e=>e.data[0]===153&&e.data[2]);assert.equal(hits.length,4);assert(hits.every(e=>e.data[1]===37&&e.t<2));assert(excerpt.events.some(e=>e.data[0]===149));assert.throws(()=>MIDI.excerpt(seq,{muteChannels:[99]}));
});

test('explicit triplets keep equal spacing inside a swinging score',()=>{const ev=N.events({swing:true,notes:[{p:'C4',d:'et'},{p:'D4',d:'et'},{p:'E4',d:'et'},{p:'F4',d:'e'},{p:'G4',d:'e'}]});assert(Math.abs(ev[1].t-1/3)<1e-9);assert(Math.abs(ev[2].t-2/3)<1e-9);assert(Math.abs(ev[4].t-5/3)<1e-9);});

test('a tie across separately rendered four-bar rows has both continuation arcs and one MIDI attack',()=>{
 const notes=[{p:'C4',d:'w',tie:1}],first={clientWidth:180},second={clientWidth:180};
 N.render(first,{instrument:'keys',time:'4/4',key:'C',notes,singleLine:true,outgoing:true});
 N.render(second,{instrument:'keys',time:'4/4',key:'C',notes:[{p:'C4',d:'w'}],singleLine:true,incoming:[[60]]});
 assert.match(first.innerHTML,/class="tie"/);assert.match(second.innerHTML,/class="tie"/);
 const ev=N.events({notes:[...notes,{p:'C4',d:'w'}]});assert.equal(ev.length,1);assert.equal(ev[0].dur,8);
});
