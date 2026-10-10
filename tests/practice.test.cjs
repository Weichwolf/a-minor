const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const scope=vm.createContext({console,TextEncoder,TextDecoder,Uint8Array});scope.window=scope;
for(const name of ['music','glyphs','notation','midi','audio','practice-generator'])vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),scope);
const {practiceGenerator:G,music:M,notation:N,midi:MIDI}=scope.AM,plain=x=>JSON.parse(JSON.stringify(x));
const course=JSON.parse(fs.readFileSync('data/course.json'));
function voiced(notes){let t=0;return notes.flatMap(n=>{const start=t,d=N.dur(n.d);t+=d;return n.r?[]:[].concat(n.p).map((p,i)=>({midi:M.midi(p),t:start,end:t,s:[].concat(n.s)[i]}));});}

test('all grades compose 12 bars and play ABAC as 16, with stable seeds and literal A returns',()=>{
 for(let grade=0;grade<6;grade++)for(let seed=0;seed<48;seed++){
  const a=G.generate(grade,seed),b=G.generate(grade,seed);
  assert.deepEqual(plain(a.score),plain(b.score));assert.deepEqual(a.bytes,b.bytes);
  assert.equal(a.score.uniqueBars,12);assert.equal(a.score.bars,16);assert.equal(a.score.sections.length,4);
  assert.equal(a.score.sections.map(s=>s.name).join(''),'ABAC');assert(a.score.sections.every(s=>s.bars.length===4));
  const clean=s=>s.bars.map(({number,...bar})=>bar);assert.deepEqual(plain(clean(a.score.sections[0])),plain(clean(a.score.sections[2])));
  for(const id of a.piece.prerequisites)assert(Object.values(course).some(track=>track.phases.some(p=>p.id===id)));
  for(const role of ['guitar','keys'])assert.equal(M.pc(M.midi(a.score.sections[3].bars[3][role].notes.at(-1).p)),M.rootPc(a.piece.root),'final tonic');
 }
 for(let grade=0;grade<6;grade++)assert.notDeepEqual(plain(G.generate(grade,42).score),plain(G.generate(grade,43).score));
 for(const [grade,seed]of [[-1,1],[6,1],[1.5,1],[0,-1],[0,2**32],[0,NaN]])assert.throws(()=>G.generate(grade,seed));
});

test('generated voices fill every bar and remain playable on P4 guitar and C2–C6 keyboard',()=>{
 for(let grade=0;grade<6;grade++)for(let seed=0;seed<100;seed++){
  const {score}=G.generate(grade,seed);
  for(const section of score.sections)for(const bar of section.bars){
   const len=M.meter(bar.time).len;
   for(const voice of [bar.guitar.notes,bar.guitar.bass,bar.keys.notes,bar.keys.bass,bar.bass]){
    assert(Math.abs(voice.reduce((n,v)=>n+N.dur(v.d),0)-len)<1e-8);
    for(const n of voiced(voice))assert(M.scalePcs(score.root,score.scale).includes(M.pc(n.midi)),`Grade ${grade}, seed ${seed}: chord and melody share the chosen scale`);
   }
   const guitar=voiced(bar.guitar.notes);
   for(const note of guitar){assert(Number.isInteger(note.s)&&note.s>=0&&note.s<6);const fret=note.midi-M.midi(M.TUNING[note.s]);assert(fret>=0&&fret<=score.maxFret);const active=guitar.filter(n=>n.t<=note.t&&n.end>note.t);assert.equal(new Set(active.map(n=>n.s)).size,active.length);const frets=active.map(n=>n.midi-M.midi(M.TUNING[n.s])).filter(f=>f>0);assert(!frets.length||Math.max(...frets)-Math.min(...frets)<=4);}
   const hands=[voiced(bar.keys.notes),voiced(bar.keys.bass)],keyboard=hands.flat();
   for(const hand of hands)for(const note of hand){assert(note.midi>=36&&note.midi<=84);const active=hand.filter(n=>n.t<=note.t&&n.end>note.t);assert(active.length<=5);assert(Math.max(...active.map(n=>n.midi))-Math.min(...active.map(n=>n.midi))<=12);}
   for(const note of keyboard){const active=keyboard.filter(n=>n.t<=note.t&&n.end>note.t);assert.equal(new Set(active.map(n=>n.midi)).size,active.length);}
   if(grade===0){assert(bar.guitar.notes.every(n=>n.r||!Array.isArray(n.p)));assert(bar.guitar.notes.every(n=>['q','h'].includes(n.d)));}
  }
 }
});

test('generated MIDI matches written notes, four routed channels, markers, pulse and note lifetimes',()=>{
 for(let grade=0;grade<6;grade++)for(let seed=0;seed<24;seed++){
  const {piece,bytes}=G.generate(grade,seed),seq=MIDI.decode(bytes),actual=[],held=new Map(),expected=[];let beat=0;
  assert.equal(seq.markers.map(m=>m.label).join(''),'ABAC');assert.equal(seq.endTick,16*M.meter(piece.time).len*480);
  assert(Math.abs(seq.duration-16*M.meter(piece.time).len/M.meter(piece.time).q*60/piece.tempo)<.001);
  for(const e of seq.events){const [status,p,v]=e.data,ch=status&15,key=ch+':'+p;if(status>>4===9&&v){assert(!held.has(key));held.set(key,e);}if(status>>4===8){const on=held.get(key);assert(on);actual.push([ch,p,on.tick,e.tick,on.data[2]]);held.delete(key);}}
  assert.equal(held.size,0);assert.deepEqual([...new Set(actual.map(e=>e[0]))].sort((a,b)=>a-b),[3,5,6,9]);
  for(const section of piece.sections){assert(seq.markers.some(m=>m.tick===beat*480&&m.label===section.name));for(const b of section.bars){
   for(const role of ['guitar','keys'])for(const n of N.events({...b[role],time:b.time}))expected.push([MIDI.channels[role],n.midi,Math.round((beat+n.t)*480),Math.round((beat+n.t+n.dur)*480),b.dynamics[role]+(n.accent?10:0)-(n.voice===1?12:0)]);
   for(const n of N.events({notes:b.bass,time:b.time}))expected.push([5,n.midi,Math.round((beat+n.t)*480),Math.round((beat+n.t+n.dur)*480),b.dynamics.bass]);
   for(const n of b.drums)expected.push([9,n.midi,Math.round((beat+n.t)*480),Math.round((beat+n.t+n.dur)*480),n.velocity]);
   beat+=M.meter(b.time).len;
  }}
  const sort=xs=>xs.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);assert.deepEqual(sort(actual),sort(plain(expected)));
 }
});

test('higher grades introduce the course rhythms and every generated section renders in both parts',()=>{
 const seen=Array.from({length:6},()=>({times:new Set(),durs:new Set(),scales:new Set()}));
 for(let grade=0;grade<6;grade++)for(let seed=0;seed<80;seed++){
  const {score}=G.generate(grade,seed);seen[grade].times.add(score.time);seen[grade].scales.add(score.scale);
  for(const section of score.sections)for(const role of ['guitar','keys']){
   section.bars.flatMap(b=>b[role].notes).forEach(n=>seen[grade].durs.add(n.d));
   if(seed<4){const el={clientWidth:340};N.render(el,{instrument:role,time:section.time,key:score.key,maxFret:score.maxFret,notes:section.bars.flatMap(b=>b[role].notes),bass:role==='keys'?section.bars.flatMap(b=>b.keys.bass):undefined});assert.match(el.innerHTML,/svg/);assert(!/undefined|NaN/.test(el.innerHTML));}
  }
 }
 assert(seen[1].durs.has('e'));assert(seen[2].durs.has('s'));assert(seen[3].durs.has('et'));assert(seen[3].times.has('12/8'));assert(seen[3].scales.has('harmonicMinor'));assert(seen[4].times.has('5/8')&&seen[4].times.has('7/8'));assert(seen[4].scales.has('lydian'));
});
