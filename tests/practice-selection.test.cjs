const {test}=require('node:test'),assert=require('node:assert/strict'),setup=require('./practice-fixture.cjs');
test('new-piece selection covers every focus evenly within each grade, style and instrument',()=>{
 const A=setup(),C=A.practiceComposer;
 C.generate=()=>{throw Error('Selection must not compose trial pieces');};
 for(let grade=0;grade<6;grade++)for(const style of C.availableStyles(grade))for(const role of C.instruments){
  const skills=C.profiles[grade].skills[role],counts=Object.fromEntries(skills.map(s=>[s,0]));let previous;
  for(let i=0;i<skills.length*3;i++){
   const seed=A.practice.nextSeed(role,grade,style,previous);assert.notEqual(seed,previous);previous=seed;
   counts[C.focusFor(grade,seed,style)[role]]++;
  }
  for(const [focus,count] of Object.entries(counts))assert.equal(count,3,`${style}/${grade}/${role}/${focus}`);
 }
});
test('coverage survives reload without changing an existing seed or counting it as learning progress',()=>{
 const A=setup(),seed=A.practice.nextSeed('keys',1,'rock'),focus=A.practiceComposer.focusFor(1,seed,'rock').keys;
 const stored=A.storage.get('a-minor-practice-selection');assert(stored);assert.equal(JSON.parse(stored)['keys:1:rock'][focus],1);
 const first=A.practiceComposer.generate(1,seed,'rock');assert.equal(A.storage.get('a-minor-practice-selection'),stored);
 const B=setup(A.storage),again=B.practiceComposer.generate(1,seed,'rock');assert.deepEqual([...first.bytes],[...again.bytes]);
 const next=B.practice.nextSeed('keys',1,'rock',seed);assert.notEqual(B.practiceComposer.focusFor(1,next,'rock').keys,focus);
 assert.equal(B.practice.link('keys',1,seed,'rock'),A.practice.link('keys',1,seed,'rock'));
});
test('invalid selection storage is ignored and request validation remains strict',()=>{
 for(const value of ['broken','null','[]','{"guitar:0:rock":{"heldPower":-4,"rests":"bad"}}']){
  const A=setup([['a-minor-practice-selection',value]]);assert(Number.isInteger(A.practice.nextSeed('guitar',0,'rock')));
 }
 const A=setup();assert.throws(()=>A.practice.nextSeed('violin',0,'rock'));assert.throws(()=>A.practice.nextSeed('keys',6,'rock'));assert.throws(()=>A.practice.nextSeed('keys',0,'mixed'));
});


test('musical diversity balances keys, motif families and rhythmic figures without composing candidates',()=>{
 const A=setup(),C=A.practiceComposer,selected=[];C.generate=()=>{throw Error('No trial composition');};let previous;
 for(let n=0;n<30;n++){const seed=A.practice.nextSeed('keys',3,'rock',previous),meta=C.selectionFor(3,seed,'rock');selected.push(meta);previous=seed;}
 for(const field of ['key','family','rhythm']){
  assert(new Set(selected.map(s=>s[field])).size>=(field==='key'?6:field==='family'?5:3),field);
  assert(selected.filter((s,i)=>i&&s[field]===selected[i-1][field]).length<=3,field+': few immediate repetitions');
 }
 const before=A.storage.get('a-minor-practice-diversity'),B=setup(A.storage);assert.equal(B.storage.get('a-minor-practice-diversity'),before);
 assert.deepEqual(JSON.parse(JSON.stringify(C.selectionFor(3,previous,'rock'))),JSON.parse(JSON.stringify(B.practiceComposer.selectionFor(3,previous,'rock'))));
});
