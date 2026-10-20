const {test}=require('node:test'),assert=require('node:assert/strict'),setup=require('./practice-fixture.cjs'),{plain}=setup;
const A=setup(),{practiceComposer:C,music:M,notation:N,practiceGenerator:G,midi:MIDI}=A;
const blues=[];for(let grade=1;grade<6;grade++)for(let seed=0;seed<16;seed++)blues.push(C.generate(grade,seed,'blues'));

test('styles unlock cumulatively and both composition and selection reject unavailable combinations',()=>{
 const expected=[['rock','doom'],['rock','doom','blues'],['rock','doom','blues','gothic','baroque'],['rock','doom','blues','gothic','baroque','lounge'],C.styles,C.styles];
 for(let grade=0;grade<6;grade++){
  assert.deepEqual(plain(C.availableStyles(grade)),plain(expected[grade]));
  for(const style of C.styles)if(!expected[grade].includes(style)){
   assert.throws(()=>C.generate(grade,11,style));assert.throws(()=>A.practice.nextSeed('keys',grade,style));
   assert.equal(C.styleForGrade(grade,style),'rock');
  }else assert.equal(C.styleForGrade(grade,style),style);
 }
});

test('blues choruses have exactly twelve bars with I–IV–V harmony and a prepared final tonic',()=>{
 for(const {piece:p} of blues){
  assert.equal(p.harmonyScale,'major');assert.equal(p.chorusBars,12);assert.equal(p.bars,p.choruses*12);
  assert.equal(p.uniqueBars,p.sections.some(s=>s.name==='B′')?20:16);assert(p.sections.every(s=>s.bars.length===4));
  const bars=p.sections.flatMap(s=>s.bars);
  for(let start=0;start<bars.length;start+=12){
   const last=start+12===bars.length,degrees=bars.slice(start,start+12).map(b=>b.harmony.degree);
   assert.deepEqual(plain(degrees.slice(4)),[3,3,0,0,4,3,last?4:0,last?0:4],p.id);
   assert.equal(degrees[0],0);assert(degrees.slice(0,4).every(d=>d===0||d===3));
  }
  for(const b of bars){assert(!b.harmony.changes);assert.deepEqual(plain(b.harmony.pcs.slice(0,3)),[0,4,7].map(d=>M.pc(b.harmony.rootPc+d)));
   assert.equal(b.harmony.pcs.length,p.grade>=3?4:3);if(p.grade>=3)assert.equal(M.pc(b.harmony.pcs[3]-b.harmony.rootPc),10);
  }
 }
});

test('blues begins with pentatonic straight playing, adds short resolving blue notes, then major blues and ternary grooves',()=>{
 const counts=new Map();
 for(const {piece:p} of blues){
  assert(C.profiles[p.grade].scales.includes(p.scale));assert(Math.abs(M.KEYS[p.key])<=C.profiles[p.grade].maxSignature);
  if(p.grade===1)assert.equal(p.scale,'minorPentatonic');
  if(p.grade===2||p.grade===3)assert.equal(p.scale,'minorBlues');
  if(p.grade<5){assert.equal(p.swing,false);assert.equal(p.time,'4/4');}
  const allowed=counts.get(p.grade)??new Set();allowed.add(p.scale);allowed.add(p.time);if(p.swing)allowed.add('swing');counts.set(p.grade,allowed);
  if(p.grade>=2){
   const blue=M.pc(M.rootPc(p.root)+(p.scale==='majorBlues'?3:6));
   const resolves=p.sections.some(s=>s.bars.some(b=>['guitar','keys'].some(role=>{
    const notes=b[role].notes;return notes.some((n,i)=>!n.r&&typeof n.p==='string'&&n.d==='e'&&M.pc(M.midi(n.p))===blue&&notes[i+1]?.d==='e'&&!notes[i+1].r&&typeof notes[i+1].p==='string'&&M.midi(notes[i+1].p)-M.midi(n.p)===1);
   })));
   assert(resolves,p.id+': a blue note audibly resolves by semitone');
  }
 }
 assert(counts.get(4).has('minorBlues')&&counts.get(4).has('majorBlues'));
 assert(counts.get(5).has('swing')&&counts.get(5).has('12/8'));
});

test('new blues scales spell and label blue notes correctly in sharp and flat roots',()=>{
 assert.deepEqual(plain(M.SCALES.minorBlues.iv),[0,3,5,6,7,10]);assert.deepEqual(plain(M.SCALES.majorBlues.iv),[0,2,3,4,7,9]);
 assert.equal(M.scaleName(63,'A','minorBlues'),'Eb4');assert.equal(M.degreeOf(63,'A','minorBlues'),'b5');
 assert.equal(M.scaleName(60,'F#','minorBlues'),'C4');assert.equal(M.scaleName(61,'Bb','majorBlues'),'Db4');
 for(const scale of ['minorBlues','majorBlues','majorPentatonic'])for(const root of ['A','F#','Bb','Db'])for(const pc of M.scalePcs(root,scale))assert.equal(M.pc(M.midi(M.scaleName(60+pc,root,scale))),pc);
});

test('blues MIDI plays the actual four written parts in straight, swung and compound time',()=>{
 const selected=blues.filter(({piece:p})=>p.grade===1||p.grade===5);
 for(const {piece:p,bytes} of selected){
  const seq=MIDI.decode(bytes),len=M.meter(p.time).len;assert.equal(seq.endTick,p.bars*len*480);
  const attacks=seq.events.filter(e=>e.data[0]>>4===9&&e.data[2]>0),expected=[];
  for(const [role,ch] of Object.entries(MIDI.channels)){
   const bars=p.sections.flatMap(s=>s.bars),inner=bars.some(b=>G.part(b,role).inner),voices={};
   for(const voice of ['notes','bass','inner'])voices[voice]=bars.flatMap(b=>G.part(b,role)[voice]||(voice==='inner'&&inner?A.practiceRhythm.held('C4',p.time,true):[]));
   for(const n of N.events({...voices,time:p.time,swing:p.swing}))expected.push([ch,n.midi,Math.round(n.t*480)]);
  }
  const sort=xs=>xs.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
  assert.deepEqual(sort(plain(attacks.map(e=>[e.data[0]&15,e.data[1],e.tick]))),sort(plain(expected)),p.id);
 }
});

test('new blues and archived version-three scores retain their complete notes through bookmark export and import',()=>{
 const saved=setup(),restored=setup();
 const legacy=C.generate(0,91,'rock').piece;legacy.generatorVersion=3;legacy.style=legacy.requestedStyle='gothic';legacy.id='practice-0-gothic-91';delete legacy.harmonyScale;legacy.title='Archived Gothic';
 for(const p of [legacy,...blues.filter(({piece:p})=>p.seed===11).map(x=>x.piece)]){
  p.title=p.title??'Blues';saved.bookmarks.toggle(p,'keys',saved.practice.link('keys',p.grade,p.seed,p.style));
 }
 assert.equal(restored.bookmarks.importJSON(saved.bookmarks.exportJSON()),6);
 assert.deepEqual(plain(restored.bookmarks.all()),plain(saved.bookmarks.all()));
 assert.deepEqual(plain(restored.bookmarks.fromURL(restored.practice.link('keys',0,91,'gothic')).piece),plain(legacy));
});
