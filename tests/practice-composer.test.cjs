const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),setup=require('./practice-fixture.cjs'),{plain}=setup;
const A=setup(),{practiceComposer:C,practiceGenerator:G,music:M,notation:N}=A;
const pool=[];for(let grade=0;grade<6;grade++)for(const style of C.styles)for(let seed=0;seed<12;seed++)pool.push(C.generate(grade,seed,style));
test('current generator is deterministic; curriculum matches all four source roles and six styles',()=>{
 assert.deepEqual(plain(C.styles),['rock','doom','gothic','progressive','baroque','lounge']);assert.deepEqual(plain(C.instruments),['guitar','keys','bass','drums']);
 assert.deepEqual(plain(C.profiles),JSON.parse(fs.readFileSync('data/practice-curriculum.json')).profiles);
 for(const {piece,bytes} of pool.filter((_,i)=>i%12===0)){const b=C.generate(piece.grade,piece.seed,piece.style);assert.deepEqual(plain(b.piece),plain(piece));assert.deepEqual(b.bytes,bytes);}
 for(const args of [[-1,1],[6,1],[1.5,1],[0,-1],[0,2**32],[0,NaN],[0,1,'mixed'],[0,1,'cinematic']])assert.throws(()=>C.generate(...args));
});
test('every section has four or eight bars; longer forms retain literal returns and close on the tonic',()=>{
 const lengths=new Set(),keys=new Set(),eightGrades=new Set();for(const {piece:p} of pool){keys.add(p.key);assert(p.uniqueBars<=24);assert(p.bars>=C.profiles[p.grade].playedBars[0]&&p.bars<=C.profiles[p.grade].playedBars[1],`${p.grade}/${p.seed}: ${p.bars}`);
  const names=new Map();let beat=0,count=0;for(const s of p.sections){assert([4,8].includes(s.bars.length));if(p.grade<3)assert.equal(s.bars.length,4);lengths.add(s.bars.length);if(s.bars.length===8)eightGrades.add(p.grade);assert.equal(s.startBar,count+1);assert.equal(s.startBeat,beat);
   const body=JSON.stringify(s.bars.map(({number,...bar})=>bar));if(names.has(s.name))assert.equal(body,names.get(s.name));names.set(s.name,body);count+=s.bars.length;beat+=s.bars.length*M.meter(p.time).len;
  }assert.equal(count,p.bars);assert.equal(p.sections.map(s=>s.name).join(''),p.form);assert.equal(p.sections.at(-1).bars.at(-1).harmony.rootPc,M.rootPc(p.root));
 }
 assert(lengths.has(8));for(const grade of [3,4,5])assert(eightGrades.has(grade),`Grade ${grade} has eight-bar sections`);assert(keys.size>=18);assert([...keys].some(k=>!k.endsWith('m')));assert([...keys].some(k=>k.endsWith('m')&&!['Am','Dm','Em'].includes(k)));
});
test('all four written parts fill their measures and remain playable on the configured instruments',()=>{
 for(const {piece:p} of pool){const len=M.meter(p.time).len;for(const section of p.sections.filter((s,i,ss)=>ss.findIndex(x=>x.name===s.name)===i))for(const b of section.bars){
  for(const role of C.instruments){const part=G.part(b,role);for(const voice of ['notes','bass','inner'])if(part[voice]){
   assert(Math.abs(part[voice].reduce((sum,n)=>sum+N.dur(n.d),0)-len)<1e-9,`${p.id}/${role}/${voice}`);
   for(const n of part[voice].filter(n=>!n.r)){const ps=[].concat(n.p).map(M.midi);assert.equal(new Set(ps).size,ps.length);
    if(role==='keys'){assert(ps.length<=5);assert(Math.max(...ps)-Math.min(...ps)<=12);assert(ps.every(m=>m>=36&&m<=84));}
    if(role==='guitar'||role==='bass'){const ss=[].concat(n.s),tuning=role==='guitar'?M.TUNING:M.BASS_TUNING;assert.equal(ss.length,ps.length);assert.equal(new Set(ss).size,ss.length);const frets=ps.map((m,i)=>m-M.midi(tuning[ss[i]]));assert(frets.every(f=>f>=0&&f<=p.maxFret));const fs=frets.filter(f=>f>0);assert(!fs.length||Math.max(...fs)-Math.min(...fs)<=4);if(role==='guitar'){const fretboard=Array(6).fill(null);ss.forEach((s,i)=>fretboard[s]=frets[i]);assert(M.fingerCount(fretboard)<=4,`${p.id}: four fretting fingers`);}}
    if(role==='drums')assert(ps.every(m=>m>=35&&m<=59));
   }
  }}
  const keys=N.events({...b.keys,time:b.time,swing:b.swing});for(const n of keys){const active=keys.filter(x=>x.t<=n.t+1e-9&&x.t+x.dur>n.t+1e-9);if(p.grade===1)assert(active.length<=4,`${p.id}: Grade 1 triad with single melody`);const right=active.filter(x=>x.voice!==1),left=active.filter(x=>x.voice===1);for(const hand of [right,left]){assert(hand.length<=5,`${p.id}: hand polyphony`);assert(!hand.length||Math.max(...hand.map(n=>n.midi))-Math.min(...hand.map(n=>n.midi))<=12,`${p.id}: hand span`);}assert.equal(new Set(active.map(x=>x.midi)).size,active.length,`${p.id}: hand overlap`);}
  const drums=N.events({...b.drumPart,time:b.time,swing:b.swing});for(const n of drums){const simultaneous=drums.filter(x=>Math.abs(x.t-n.t)<1e-9);assert(simultaneous.length<=(p.grade<4?2:3));assert(simultaneous.filter(x=>![35,36,44].includes(x.midi)).length<=2);}
 }}
});
test('notation renders four-bar rows for guitar, grand staff, octave bass and percussion',()=>{
 for(const {piece:p} of pool.filter((_,i)=>i%12===0))for(const s of p.sections.filter((s,i,ss)=>ss.findIndex(x=>x.name===s.name)===i))for(const role of C.instruments)for(let row=0;row<s.bars.length;row+=4){const bs=s.bars.slice(row,row+4),parts=bs.map(b=>G.part(b,role)),el={clientWidth:340};
  N.render(el,{instrument:role,time:p.time,key:p.key,maxFret:p.maxFret,singleLine:true,hideReferences:true,notes:parts.flatMap(p=>p.notes),bass:role==='bass'?undefined:parts.flatMap(p=>p.bass||[]),inner:parts.some(p=>p.inner)?parts.flatMap(part=>part.inner||A.practiceRhythm.held('C4',p.time,true)):undefined});
  assert.equal((el.innerHTML.match(/<svg/g)||[]).length,1);assert.equal((el.innerHTML.match(/class="measure"/g)||[]).length,4);assert(!/undefined|NaN/.test(el.innerHTML));if(role==='drums')assert(el.innerHTML.includes('percussion-clef'));if(role==='bass')assert(el.innerHTML.includes('clef-octave'));
 }
});
test('new bookmarks persist complete scores for all four instruments and round-trip JSON/CSV',()=>{
 const a=setup(),b=setup();for(const role of C.instruments){const p=C.generate(5,5,'rock').piece;p.title='Piece';a.bookmarks.toggle(p,role,a.practice.link(role,p.grade,p.seed,p.style));a.bookmarks.update(p.id+':'+role,'=Favourite','@warm bass');}
 const json=a.bookmarks.exportJSON();assert.equal(b.bookmarks.importJSON(json),4);assert.equal(b.bookmarks.importJSON(json),0);assert.deepEqual(plain(b.bookmarks.all()),plain(a.bookmarks.all()));assert(a.bookmarks.exportCSV().includes("'@warm bass"));
 const before=b.bookmarks.exportJSON();for(const mutate of [d=>d.version=1,d=>d.bookmarks[0].piece.seed=-1,d=>d.bookmarks[0].piece.programs.keys=999,d=>d.bookmarks[0].url='#/evil',d=>d.bookmarks[0].piece.sections[0].bars[0].drumPart.notes[0].d='w.']){const invalid=JSON.parse(json);mutate(invalid);assert.throws(()=>b.bookmarks.importJSON(JSON.stringify(invalid)));assert.equal(b.bookmarks.exportJSON(),before);}
 const c=setup();c.storage.set('a-minor-bookmarks',JSON.stringify({schema:'a-minor-bookmarks',version:1,bookmarks:[{}]}));assert.equal(c.bookmarks.all().length,0);const p=C.generate(0,0).piece;p.title='New';c.bookmarks.toggle(p,'drums',c.practice.link('drums',0,0,'rock'));assert.equal(c.bookmarks.all().length,1);
 const d=setup();d.storage.set('a-minor-bookmarks','corrupt');assert.equal(d.bookmarks.all().length,0);assert.throws(()=>d.bookmarks.toggle(p,'drums',c.practice.link('drums',0,0,'rock')));assert.equal(d.storage.get('a-minor-bookmarks'),'corrupt');
});

test('barres can cover higher frets but cannot cover sounding lower or open strings',()=>{assert.equal(M.fingerCount([1,3,2,3,3,1]),4);assert.equal(M.fingerCount([1,1,1,1,1,1]),1);assert.equal(M.fingerCount([1,0,1,null,null,null]),2);assert.equal(M.fingerCount([1,2,3,4,5,null]),5);});
