const {test}=require('node:test'),assert=require('node:assert/strict'),setup=require('./practice-fixture.cjs'),{plain}=setup;
const A=setup(),{practiceComposer:C,practiceMotifs:T,music:M,notation:N,practiceRhythm:R,practiceGenerator:G}=A;
function compose(grade,seed,style,change){
 const original=T.plan;
 try{T.plan=(...args)=>({...original(...args),...change});return C.generate(grade,seed,style);}
 finally{T.plan=original;}
}
const accents=C.styles.map(style=>{
 const grade=Math.max(3,C.styleGrade(style)),seed=Array.from({length:512},(_,s)=>s).find(seed=>T.plan(grade,seed,style).accent);
 return C.generate(grade,seed,style);
});

test('each style has five distinct motif families and subtle accents occur in about a quarter of selections',()=>{
 for(const style of C.styles){
  assert.equal(T.families[style].length,5);const selected=new Set(),themes=new Set();let count=0;
  for(let seed=0;seed<1024;seed++){
   const p=T.plan(C.styleGrade(style),seed,style);selected.add(p.family);themes.add(p.degrees.join(','));if(p.accent)count++;
   assert.deepEqual(plain(p),plain(T.plan(C.styleGrade(style),seed,style)));
   assert(p.degrees.every(d=>Number.isInteger(d)&&d>=0&&d<=(C.styleGrade(style)===0?2:6)));
  }
  assert.equal(selected.size,5);assert(themes.size>=4);assert(count/1024>.20&&count/1024<.30,style+': subtle accents stay occasional');
 }
});

test('selecting another motif changes written melodies while retaining the key, metre, form and technical focuses',()=>{
 for(const style of C.styles){
  const seed=11,grade=4,versions=T.families[style].map(f=>compose(grade,seed,style,{family:f.id,degrees:f.degrees,accent:null}).piece),melodies=new Set();
  for(const p of versions){
   const first=versions[0];assert.equal(p.key,first.key);assert.equal(p.time,first.time);assert.equal(p.form,first.form);assert.deepEqual(plain(p.roleFocus),plain(first.roleFocus));
   melodies.add(JSON.stringify(p.sections.flatMap(s=>s.bars.map(b=>[b.guitar.notes,b.keys.notes]))));
  }
  assert(melodies.size>=4,style+': families are audible in the composed notes');
 }
});

test('each style accent changes actual sounding phrases without changing the selected learning content',()=>{
 for(const {piece:p} of accents){
  const baseline=compose(p.grade,p.seed,p.style,{accent:null}).piece;
  assert.equal(p.key,baseline.key);assert.equal(p.scale,baseline.scale);assert.equal(p.time,baseline.time);assert.deepEqual(plain(p.roleFocus),plain(baseline.roleFocus));
  const sound=piece=>piece.sections.flatMap(s=>s.bars.flatMap(b=>['guitar','keys'].flatMap(role=>N.events({...b[role],time:piece.time,swing:piece.swing}).map(n=>[n.midi,n.t,n.dur,n.velocity??b.dynamics[role]]))));
  assert.notDeepEqual(plain(sound(p)),plain(sound(baseline)),p.style+': the accent affects the music');
  for(const s of p.sections)for(const b of s.bars)for(const role of C.instruments){
   const part=G.part(b,role),len=M.meter(p.time).len;
   for(const voice of ['notes','bass','inner'])if(part[voice]){
    assert(Math.abs(part[voice].reduce((sum,n)=>sum+N.dur(n.d),0)-len)<1e-9);
    if(p.time==='4/4')assert(R.supports(part[voice],C.profiles[p.grade].rhythms[role],len),p.id+'/'+role+': grade rhythm limits');
    for(const n of part[voice])if(!n.r&&role==='keys'){const ps=[].concat(n.p).map(M.midi);assert(ps.every(m=>m>=36&&m<=84));assert(Math.max(...ps)-Math.min(...ps)<=12);}
   }
  }
 }
});

test('accented blues varies only the final answer while keeping complete choruses and literal return prefixes',()=>{
 const seed=Array.from({length:256},(_,s)=>s).find(s=>T.plan(3,s,'blues').accent),p=C.generate(3,seed,'blues').piece;
 const source=p.sections.find(s=>s.name==='B'),answer=p.sections.find(s=>s.name==='B′');assert(answer);assert.equal(answer.variationOf,'B');
 const body=s=>s.bars.map(({number,...b})=>b);
 assert.deepEqual(plain(body(answer).slice(0,2)),plain(body(source).slice(0,2)));
 assert.notDeepEqual(plain(answer.bars.slice(2).map(b=>b.keys.notes)),plain(source.bars.slice(2).map(b=>b.keys.notes)));
 assert.equal(p.bars%12,0);assert.equal(p.uniqueBars,20);assert.equal(p.sections.at(-1).bars.at(-1).harmony.degree,0);
});

test('doom answers have longer bass values, and lounge connects roots near their previous register',()=>{
 for(const {piece:p} of accents.filter(({piece:p})=>['doom','lounge'].includes(p.style))){
  const b=p.sections.find(s=>s.name==='B');assert(b.bars.slice(0,-1).every(b=>b.bass.filter(n=>!n.r).length<=2));
  assert(b.bars.every(b=>b.bass.filter(n=>!n.r).every(n=>M.pc(M.midi(n.p))===b.harmony.rootPc)));
 }
});

test('a rock riff is actually shared by guitar and bass when the selected bass focus permits it',()=>{
 const seed=Array.from({length:1024},(_,s)=>s).find(s=>{const f=C.focusFor(2,s,'rock');return T.plan(2,s,'rock').accent&&f.guitar==='melodicRiff'&&f.bass==='movingBass';});
 assert.notEqual(seed,undefined);const p=C.generate(2,seed,'rock').piece,b=p.sections.find(s=>s.name==='A').bars[1];
 const figure=notes=>notes.map(n=>[n.r?null:M.pc(M.midi(n.p)),n.d]);
 assert.deepEqual(plain(figure(b.bass)),plain(figure(b.guitar.notes)));
 assert(new Set(b.bass.filter(n=>!n.r).map(n=>M.pc(M.midi(n.p)))).size>1,'the shared figure contains actual melodic movement');
});

test('baroque accompaniment has audible contrary motion beneath its upper line',()=>{
 const p=accents.find(({piece:p})=>p.style==='baroque').piece;
 const direction=notes=>{const ns=notes.filter(n=>!n.r&&typeof n.p==='string');return ns.length>1?Math.sign(M.midi(ns.at(-1).p)-M.midi(ns[0].p)):0;};
 assert(p.sections.some(s=>s.bars.some(b=>direction(b.keys.notes)*direction(b.keys.bass)===-1)));
});

test('advanced progressive accents keep a repeated, grouped figure in odd metres',()=>{
 const seed=Array.from({length:512},(_,s)=>s).find(s=>T.plan(4,s,'progressive').accent&&['5/8','7/8'].includes(C.generate(4,s,'progressive').piece.time));
 assert.notEqual(seed,undefined);const p=C.generate(4,seed,'progressive').piece;
 assert(p.sections.some(s=>s.bars.some(b=>['guitar','keys'].some(role=>b[role].notes.some(n=>!n.r&&n.accent)))));
 const names=new Map();for(const s of p.sections){const body=JSON.stringify(s.bars.map(({number,...b})=>b));if(names.has(s.name))assert.equal(body,names.get(s.name));names.set(s.name,body);}
});

test('new motif metadata round-trips with the complete score and prior generator versions remain readable',()=>{
 const saved=setup(),restored=setup();
 for(const {piece:p} of accents){p.title='Motif';saved.bookmarks.toggle(p,'keys',saved.practice.link('keys',p.grade,p.seed,p.style));}
 const json=saved.bookmarks.exportJSON();assert.equal(restored.bookmarks.importJSON(json),7);assert.deepEqual(plain(saved.bookmarks.all()),plain(restored.bookmarks.all()));
 for(const field of ['motifFamily','musicalAccent']){const invalid=JSON.parse(json);invalid.bookmarks[0].piece[field]='unknown';assert.throws(()=>restored.bookmarks.importJSON(JSON.stringify(invalid)));}
 for(const version of [3,4]){const legacy=plain(accents[0].piece);legacy.generatorVersion=version;delete legacy.motifFamily;delete legacy.musicalAccent;assert.doesNotThrow(()=>restored.bookmarks.validatePiece(legacy));}
});
