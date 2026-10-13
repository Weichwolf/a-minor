const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),setup=require('./practice-fixture.cjs'),{plain}=setup;
const A=setup(),{practiceComposer:C,practiceGenerator:G,music:M,notation:N}=A;
const pool=[];for(let grade=0;grade<6;grade++)for(const style of C.styles)for(let seed=0;seed<12;seed++)pool.push(C.generate(grade,seed,style));
test('current generator is deterministic; curriculum matches all four source roles and six styles',()=>{
 assert.deepEqual(plain(C.styles),['rock','doom','gothic','progressive','baroque','lounge']);assert.deepEqual(plain(C.instruments),['guitar','keys','bass','drums']);
 assert.deepEqual(plain(C.profiles),JSON.parse(fs.readFileSync('data/practice-curriculum.json')).profiles);
 for(const {piece,bytes} of pool.filter((_,i)=>i%12===0)){const b=C.generate(piece.grade,piece.seed,piece.style);assert.deepEqual(plain(b.piece),plain(piece));assert.deepEqual(b.bytes,bytes);}
 for(const args of [[-1,1],[6,1],[1.5,1],[0,-1],[0,2**32],[0,NaN],[0,1,'mixed'],[0,1,'cinematic']])assert.throws(()=>C.generate(...args));
});
test('most pieces contrast related guitar and keyboard sections within every grade and style',()=>{
 for(let grade=0;grade<6;grade++)for(const style of C.styles){
  const pieces=pool.map(x=>x.piece).filter(p=>p.grade===grade&&p.style===style),mixed=pieces.filter(p=>p.contrasting);
  assert(mixed.length>=7,`${grade}/${style}: contrasting sections are the norm`);
  assert(pieces.some(p=>p.sections.some(s=>s.bars.some(b=>b.guitar.notes.some(n=>!n.r&&Array.isArray(n.p))))));
  for(const p of pieces)for(const section of p.sections){
   for(const role of ['guitar','keys']){
    const texture=section.character[role],notes=section.bars.flatMap(b=>b[role].notes).filter(n=>!n.r);
    if(['riff','melody','arpeggio'].includes(texture))assert(notes.every(n=>typeof n.p==='string'),`${p.id}/${role}/${section.name}: single-note texture including ending`);
    if(texture==='arpeggio'&&p.roleFocus[role]!=='ties'&&p.roleFocus[role]!=='chromaticColour')for(const b of section.bars){let at=0;for(const n of b[role].notes){const h=b.harmony.changes?.findLast(c=>c.t<=at+1e-9)?.h??b.harmony;if(!n.r)assert(h.pcs.includes(M.pc(M.midi(n.p))),`${p.id}: arpeggio follows harmony`);at+=N.dur(n.d);}}
   }
   if(grade===0)for(const b of section.bars){const ns=b.guitar.notes.filter(n=>!n.r);if(ns.every(n=>typeof n.p==='string')){const pitches=ns.map(n=>M.midi(n.p));assert(Math.max(...pitches)-Math.min(...pitches)<=7);}}
  }
  for(const p of mixed){const a=p.sections.find(s=>s.name==='A'),b=p.sections.find(s=>s.name==='B');
   for(const role of ['guitar','keys']){assert.notEqual(a.character[role],b.character[role]);assert.notDeepEqual(plain(a.bars.map(b=>b[role].notes)),plain(b.bars.map(b=>b[role].notes)));}
   assert(b.bars.every(b=>b.dynamics.bass<a.bars[0].dynamics.bass));
   assert(b.bars.every(b=>b.dynamics.drums<a.bars[0].dynamics.drums));
  }
 }
});
test('varied returns preserve the opening phrase and develop the ending; style forms differ',()=>{
 let variations=0;const forms=new Map(C.styles.map(s=>[s,new Set()]));
 for(const {piece:p} of pool){forms.get(p.style).add(p.sections.filter((s,i,ss)=>ss.findIndex(x=>x.name===s.name)===i).map(s=>s.name).join(''));
  for(const section of p.sections)if(section.variationOf){variations++;const source=p.sections.find(s=>s.name===section.variationOf),body=s=>s.bars.map(({number,...b})=>b);
   assert.equal(section.bars.length,source.bars.length);assert.deepEqual(plain(body(section).slice(0,-2)),plain(body(source).slice(0,-2)));assert.notDeepEqual(plain(body(section).slice(-2)),plain(body(source).slice(-2)));for(const role of ['guitar','keys'])assert.notDeepEqual(plain(section.bars.slice(-2).map(b=>b[role])),plain(source.bars.slice(-2).map(b=>b[role])),`${p.id}/${role}: audible varied return`);
  }
 }
 assert(variations>20);assert.notDeepEqual([...forms.get('rock')].sort(),[...forms.get('baroque')].sort());
});
test('Grade 0 melodies keep one small register across the whole section, including harmonic changes',()=>{
 let checked=0;
 for(const {piece:p} of pool.filter(({piece})=>piece.grade===0))for(const section of p.sections)for(const role of ['guitar','keys']){
  if(section.character[role]!=='melody')continue;
  const pitches=section.bars.flatMap(b=>b[role].notes).filter(n=>!n.r).map(n=>M.midi(n.p));
  assert(Math.max(...pitches)-Math.min(...pitches)<=7,`${p.id}/${role}/${section.name}: phrase fits a fifth`);checked++;
 }
 assert(checked>100);
});
test('bass root-reading stays on roots; quarter focus has a quarter pulse and arpeggios include thirds',()=>{
 let roots=0,arpeggios=0;
 for(const {piece:p} of pool){
  if(['rootQuarters','rootEighths','rootChanges','eighthBass'].includes(p.roleFocus.bass)){
   roots++;
   for(const section of p.sections)for(const b of section.bars){let at=0;
    for(const n of b.bass){const h=b.harmony.changes?.findLast(c=>c.t<=at+1e-9)?.h??b.harmony;
     if(!n.r)assert.equal(M.pc(M.midi(n.p)),h.rootPc,`${p.id}: a root-reading part uses the harmonic root`);
     if(p.roleFocus.bass==='rootQuarters')assert(['q','w'].includes(n.d),'quarter pulse, with a sustained ending');
     at+=N.dur(n.d);
    }
   }
  }
  if(p.roleFocus.bass==='arpeggioBass'){
   arpeggios++;assert(p.sections.some(s=>s.bars.some(b=>b.bass.some(n=>!n.r&&M.pc(M.midi(n.p))===b.harmony.pcs[1]))),`${p.id}: arpeggio includes the chord third`);
  }
 }
 assert(roots>50);assert(arpeggios>5);
});
test('drum focus is visible in the actual attacks and notation, not only in its label',()=>{
 let checked=0;
 for(const {piece:p} of pool){const focus=p.roleFocus.drums,parts=p.sections.flatMap(s=>s.bars.map(b=>b.drumPart));
  if(focus==='eighthKick'){
   checked++;assert(parts.some(part=>part.bass.some(n=>!n.r&&n.d==='e'&&[].concat(n.p).some(p=>M.midi(p)===36))),`${p.id}: eighth bass drum attacks`);
  }
  if(focus==='accentFill'){
   checked++;assert(parts.some(part=>part.notes.some(n=>!n.r&&n.accent)),`${p.id}: written fill accents`);
  }
  if(focus==='dottedGroove'){
   checked++;assert(parts.some(part=>part.bass.some(n=>!n.r&&n.d.endsWith('.'))),`${p.id}: dotted groove, not only a dotted fill`);
  }
  if(focus==='syncopatedKick'){
   checked++;assert(parts.some(part=>N.events({...part,time:p.time}).some(e=>e.midi===36&&e.t%1>.01)),`${p.id}: offbeat kick`);
  }
 }
 assert(checked>30);
});
test('every section has four or eight bars; longer forms retain literal returns and close on the tonic',()=>{
 const lengths=new Set(),keys=new Set(),eightGrades=new Set();for(const {piece:p} of pool){keys.add(p.key);assert(p.uniqueBars<=24);assert(p.bars<=64,'reading miniatures do not manufacture length through excessive repetition');if(p.repeat)assert(p.repeat.times<=3);assert(p.bars>=C.profiles[p.grade].playedBars[0]&&p.bars<=C.profiles[p.grade].playedBars[1],`${p.grade}/${p.seed}: ${p.bars}`);
  const names=new Map();let beat=0,count=0;for(const s of p.sections){assert([4,8].includes(s.bars.length));if(p.grade<3)assert.equal(s.bars.length,4);lengths.add(s.bars.length);if(s.bars.length===8)eightGrades.add(p.grade);assert.equal(s.startBar,count+1);assert.equal(s.startBeat,beat);
   const body=JSON.stringify(s.bars.map(({number,...bar})=>bar));if(names.has(s.name))assert.equal(body,names.get(s.name));names.set(s.name,body);count+=s.bars.length;beat+=s.bars.length*M.meter(p.time).len;
  }assert.equal(count,p.bars);assert.equal(p.sections.map(s=>s.name).join(''),p.form);assert.equal(p.sections.at(-1).bars.at(-1).harmony.rootPc,M.rootPc(p.root));
 }
 assert(lengths.has(8));for(const grade of [3,4,5])assert(eightGrades.has(grade),`Grade ${grade} has eight-bar sections`);assert(keys.size>=18);assert([...keys].some(k=>!k.endsWith('m')));assert([...keys].some(k=>k.endsWith('m')&&!['Am','Dm','Em'].includes(k)));
});
test('long phrases answer an open midpoint and every final tonic has a harmonic preparation',()=>{
 let long=0;const progressions=new Map(C.styles.map(style=>[style,new Set()]));
 for(const {piece:p} of pool){
  const ending=p.sections.at(-1).bars,preparation=ending.at(-2).harmony,tonic=ending.at(-1).harmony;
  assert.notEqual(preparation.rootPc,tonic.rootPc,`${p.id}: the ending is prepared before its tonic`);
  assert(!preparation.changes,'no incidental chord change erases the prepared ending');
  for(const role of ['guitar','keys'])for(const n of ending.at(-1)[role].notes)if(!n.r)for(const pitch of [].concat(n.p))assert(tonic.pcs.includes(M.pc(M.midi(pitch))),`${p.id}: the sounding resolution agrees with its harmony, including ties`);
  progressions.get(p.style).add(p.sections[0].bars.map(b=>b.harmony.roman).join(' '));
  for(const section of p.sections)if(section.bars.length===8){
   long++;assert.notEqual(section.bars[3].harmony.degree,0,`${p.id}: open midpoint`);
   assert.equal(section.bars[7].harmony.degree,0,`${p.id}: closing answer`);
   assert.notDeepEqual(section.bars.slice(0,4).map(b=>b.chord),section.bars.slice(4).map(b=>b.chord));
  }
 }
 assert(long>20);for(const [style,plans] of progressions)assert(plans.size>=3,`${style}: different harmonic plans`);
});
test('a selected solo-return focus survives navigation and features an instrument with that focus',()=>{
 let both=0;
 for(const {piece:p} of pool)if(Object.values(p.roleFocus).includes('soloReturn')){
  assert(p.sections.some(s=>s.name==='S'),`${p.id}: written contrast section exists`);
  assert.equal(p.roleFocus[p.featured],'soloReturn');
  if(p.navigation)both++;
 }
 assert(both>5,'navigation and written contrast can coexist');
});
test('Grade 3 Rock melodies retain sustained chord support instead of doubling every fast attack',()=>{
 let checked=0;
 for(const {piece:p} of pool.filter(({piece})=>piece.grade===3&&piece.style==='rock'))for(const s of p.sections)if(s.character.keys!=='chords'){
  for(const b of s.bars)for(const n of b.keys.bass)if(!n.r){assert(N.dur(n.d)>=2,`${p.id}: sustained left-hand support`);checked++;}
 }
 assert(checked>20);
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
test('electric guitar has only root–fifth chord attacks; arpeggios remain monophonic and keyboard keeps full chords',()=>{
 let broken=0,powers=0,fallbacks=0,keyboardChords=0;
 for(const {piece:p} of pool){assert.equal(p.programs.guitar,29);
  for(const section of p.sections)for(const b of section.bars){
   assert(b.guitar.bass.every(n=>n.r));
   for(const n of b.guitar.notes.filter(n=>!n.r)){
    if(Array.isArray(n.p)){powers++;assert.equal(n.p.length,2);assert.equal(M.midi(n.p[1])-M.midi(n.p[0]),7,`${p.id}: only power chords, including endings`);}
    if(b.guitar.texture==='arpeggio'){broken++;assert.equal(typeof n.p,'string');}
   }
   if(section.character.guitar==='power'&&b.guitar.texture==='arpeggio')fallbacks++;
   if(b.keys.notes.some(n=>Array.isArray(n.p)&&n.p.length>=3))keyboardChords++;
   const events=N.events({...b.guitar,time:b.time,swing:b.swing});
   for(const event of events){const sounding=events.filter(n=>n.t<=event.t+1e-9&&n.t+n.dur>event.t+1e-9).map(n=>n.midi).sort((a,b)=>a-b);assert(sounding.length<=2);if(sounding.length===2)assert.equal(sounding[1]-sounding[0],7);}
  }
 }
 assert(broken>100);assert(powers>100);assert(fallbacks>0,'non-perfect fifth harmonies are played as arpeggios');assert(keyboardChords>100);
 for(const profile of C.profiles)assert(!profile.skills.guitar.some(f=>/Strum$|^fifthSixth$/.test(f)));
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

test('bookmarks retain section characters and varied returns and reject invalid section metadata',()=>{
 const a=setup(),b=setup(),p=plain(pool.find(({piece})=>piece.sections.some(s=>s.variationOf)).piece);p.title='Varied return';
 a.bookmarks.toggle(p,'guitar',a.practice.link('guitar',p.grade,p.seed,p.style));const json=a.bookmarks.exportJSON();assert.equal(b.bookmarks.importJSON(json),1);
 assert.deepEqual(plain(b.bookmarks.all()[0].piece),p);
 for(const change of [p=>p.theme[0]=99,p=>p.sections[0].character.guitar='unknown',p=>p.sections.find(s=>s.variationOf).variationOf='C']){
  const data=JSON.parse(json);change(data.bookmarks[0].piece);assert.throws(()=>b.bookmarks.importJSON(JSON.stringify(data)));
 }
});

test('barres can cover higher frets but cannot cover sounding lower or open strings',()=>{assert.equal(M.fingerCount([1,3,2,3,3,1]),4);assert.equal(M.fingerCount([1,1,1,1,1,1]),1);assert.equal(M.fingerCount([1,0,1,null,null,null]),2);assert.equal(M.fingerCount([1,2,3,4,5,null]),5);});
