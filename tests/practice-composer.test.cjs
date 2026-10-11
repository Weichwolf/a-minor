const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){const storage=new Map(),c=vm.createContext({console,TextEncoder,TextDecoder,Uint8Array,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},location:{href:'https://example.test/a-minor/'}});c.window=c;
 for(const name of ['music','glyphs','notation','midi','audio','practice-generator','practice-composer','practice-info'])vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),c);
 const locales=Object.fromEntries(['de','en'].map(l=>[l,JSON.parse(fs.readFileSync('locales/'+l+'.json'))]));let lang='de';c.AM.i18n={t:k=>locales[lang].ui[k]};
 for(const name of ['bookmarks','practice'])vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),c);
 return{...c.AM,storage,lang:l=>lang=l};}
const plain=v=>JSON.parse(JSON.stringify(v));
function timeline(notes,N,M){let t=0;return notes.flatMap(n=>{const at=t;t+=N.dur(n.d);return n.r?[]:[].concat(n.p).map(p=>({p:M.midi(p),at,end:t}));});}

test('seven styles at all six grades produce deterministic, complete and playable scores with clear endings',()=>{
 const {practiceComposer:C,bookmarks:B,notation:N,music:M}=setup();let count=0;
 for(let grade=0;grade<6;grade++)for(const style of C.styles)for(let seed=0;seed<18;seed++){
  const {piece:p,bytes}=C.generate(grade,seed,style);p.title='test';assert.equal(p.style,style);assert.equal(p.generatorVersion,2);B.validatePiece(p);
  if(seed<2){const repeated=C.generate(grade,seed,style);assert.deepEqual(repeated.bytes,bytes);assert.deepEqual(plain({...p,title:undefined}),plain(repeated.piece));}
  const last=p.sections.at(-1).bars.at(-1);assert.equal(M.pc(M.midi(last.keys.notes.at(-1).p)),M.rootPc(p.root));assert.equal(last.harmony.degree,0);
  for(const s of p.sections)for(const b of s.bars){
   for(const voice of [b.guitar.notes,b.keys.notes,b.keys.bass,b.bass])for(const e of timeline(voice,N,M))assert(M.scalePcs(p.root,p.scale).includes(M.pc(e.p)),`${grade} ${style} ${seed}: outside scale`);
   const voices=[timeline(b.keys.notes,N,M),timeline(b.keys.bass,N,M)],all=voices.flat();
   for(const e of all){const active=all.filter(n=>n.at<=e.at&&n.end>e.at);assert.equal(new Set(active.map(n=>n.p)).size,active.length,'hands do not duplicate sounding keys');}
   for(const e of b.guitar.notes.filter(n=>!n.r&&Array.isArray(n.p))){const fs=e.p.map((p,i)=>M.midi(p)-M.midi(M.TUNING[e.s[i]]));assert(Math.max(...fs)-Math.min(...fs)<=4);}
  }
  if(grade===0){const rh=p.sections.flatMap(s=>s.bars.flatMap(b=>b.keys.notes));assert(rh.every(n=>['q','h'].includes(n.d)));const pcs=new Set(rh.filter(n=>!n.r).map(n=>M.pc(M.midi(n.p))));assert(pcs.size>=3&&pcs.size<=5);}
  count++;
 }
 assert.equal(count,756);assert.throws(()=>C.generate(0,0,'unknown'));assert.throws(()=>C.generate(6,0,'rock'));
});

test('forms, section lengths and focused rhythms vary with grade while A returns remain literal',()=>{
 const {practiceComposer:C}=setup(),seen=Array.from({length:6},()=>({forms:new Set(),lengths:new Set(),times:new Set(),durs:new Set()}));
 for(let grade=0;grade<6;grade++)for(let seed=0;seed<80;seed++){
  const p=C.generate(grade,seed,'mixed').piece,s=seen[grade];s.forms.add(p.form);s.times.add(p.time);p.sections.forEach(x=>s.lengths.add(x.bars.length));
  p.sections.flatMap(x=>x.bars.flatMap(b=>b.keys.notes)).forEach(n=>s.durs.add(n.d));
  const As=p.sections.filter(x=>x.name==='A');for(const a of As.slice(1))assert.deepEqual(plain(a.bars.map(({number,...b})=>b)),plain(As[0].bars.map(({number,...b})=>b)));
 }
 assert(seen.every(s=>s.forms.size>=2));assert(seen[0].lengths.has(2));assert(seen[0].lengths.has(4));assert(seen[1].times.has('3/4'));assert(seen[2].durs.has('s'));assert(seen[3].durs.has('et'));assert(seen[3].times.has('12/8'));assert(seen[4].times.has('5/8'));assert(seen[4].times.has('7/8'));assert(seen[5].lengths.has(8));
});

test('style choices already change beginner notation instead of only its label or playback sound',()=>{
 const {practiceComposer:C}=setup(),scores=['rock','doom','gothic','baroque','cinematic'].map(style=>C.generate(0,42,style).piece);
 const signatures=scores.map(p=>JSON.stringify(p.sections.map(s=>s.bars.map(b=>b.keys.notes))));assert(new Set(signatures).size>=4);
});

test('MIDI agrees with the score, including swing, accents, staccato, routed parts and section markers',()=>{
 const {practiceComposer:C,notation:N,music:M,midi:MIDI}=setup();
 for(let grade=0;grade<6;grade++)for(const style of C.styles){
  const {piece:p,bytes}=C.generate(grade,43,style),seq=MIDI.decode(bytes),held=new Map(),actual=[],expected=[];let beat=0;
  assert.deepEqual(plain(seq.markers.map(m=>m.label)),plain(p.sections.map(s=>s.name)));assert.equal(seq.endTick,p.bars*M.meter(p.time).len*480);
  for(const e of seq.events){const [st,pitch,v]=e.data,k=(st&15)+':'+pitch;if(st>>4===9&&v){assert(!held.has(k),`duplicate MIDI ${grade}/${style}/${k}`);held.set(k,e);}else if(st>>4===8){const on=held.get(k);assert(on);actual.push([st&15,pitch,on.tick,e.tick,on.data[2]]);held.delete(k);}}
  assert.equal(held.size,0);
  for(const s of p.sections)for(const b of s.bars){
   for(const role of ['guitar','keys'])for(const n of N.events({...b[role],swing:b.swing}))expected.push([MIDI.channels[role],n.midi,Math.round((beat+n.t)*480),Math.round((beat+n.t+n.dur)*480),b.dynamics[role]+(n.accent?10:0)-(n.voice===1?12:0)]);
   for(const n of N.events({notes:b.bass}))expected.push([5,n.midi,Math.round((beat+n.t)*480),Math.round((beat+n.t+n.dur)*480),b.dynamics.bass]);for(const n of b.drums)expected.push([9,n.midi,Math.round((beat+n.t)*480),Math.round((beat+n.t+n.dur)*480),n.velocity]);beat+=M.meter(p.time).len;
  }
  const sort=xs=>xs.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);assert.deepEqual(plain(sort(actual)),plain(sort(expected)));
 }
});

test('bookmark JSON restores full scores and taste notes, merges safely and preserves state on malformed imports or storage errors',()=>{
 const a=setup(),p=a.practiceComposer.generate(3,17,'cinematic').piece;p.title='Piece · 0x00000011';const url=a.practice.link('keys',3,17,'cinematic');
 a.bookmarks.toggle(p,'keys',url);a.bookmarks.update(p.id+':keys','Favourite','<img src=x> warm bass\n=SUM(1,2)');
 const json=a.bookmarks.exportJSON(),csv=a.bookmarks.exportCSV(),b=setup();assert.equal(b.bookmarks.importJSON(json),1);assert.equal(b.bookmarks.importJSON(json),0);assert.deepEqual(plain(b.bookmarks.all()),plain(a.bookmarks.all()));
 assert.deepEqual(b.practiceGenerator.encode(b.bookmarks.fromURL(url).piece),a.practiceGenerator.encode(p));assert(csv.includes('sectionLengths'));assert(csv.includes('melodicIntervalsSemitones'));
 a.bookmarks.update(p.id+':keys','=SUM(1,2)','@formula');assert(a.bookmarks.exportCSV().includes("'@formula"));assert(a.bookmarks.exportCSV().includes("'=SUM(1,2)"));
 const before=b.bookmarks.exportJSON();for(const mutate of [d=>d.version=99,d=>d.bookmarks[0].piece.sections[0].bars[0].keys.notes[0].d='w',d=>d.bookmarks[0].piece.seed=-1,d=>d.bookmarks[0].url='#/evil',d=>d.bookmarks[0].piece.programs.keys=999]){const bad=JSON.parse(json);mutate(bad);assert.throws(()=>b.bookmarks.importJSON(JSON.stringify(bad)));assert.equal(b.bookmarks.exportJSON(),before);}
 const savedBefore=b.bookmarks.exportJSON();const oldSet=b.storage.set;b.storage.set=()=>{throw Error('Storage full');};assert.throws(()=>b.bookmarks.remove(p.id+':keys'));assert.equal(b.bookmarks.exportJSON(),savedBefore);b.storage.set=oldSet;
 const legacy=b.practiceGenerator.generate(0,12).piece;legacy.title='Legacy';b.bookmarks.toggle(legacy,'guitar',b.practice.link('guitar',0,12));assert.equal(JSON.parse(b.bookmarks.exportJSON()).bookmarks.length,2);
});

test('unreadable browser data is preserved and a valid backup recovers it; snapshots remain valid with a later composer version',()=>{
 const a=setup(),p=a.practiceComposer.generate(0,27,'rock').piece;p.title='saved';a.bookmarks.toggle(p,'keys',a.practice.link('keys',0,27,'rock'));const backup=a.bookmarks.exportJSON();
 const b=setup();b.storage.set('a-minor-bookmarks','corrupt');assert.equal(b.bookmarks.all().length,0);assert.throws(()=>b.bookmarks.toggle(p,'keys',a.practice.link('keys',0,27,'rock')));assert.equal(b.storage.get('a-minor-bookmarks'),'corrupt');
 b.practiceComposer.version=3;assert.equal(b.bookmarks.importJSON(backup),1);assert.deepEqual(plain(b.bookmarks.all()),plain(a.bookmarks.all()));
 const bad=JSON.parse(backup);bad.bookmarks[0].piece.scale='__proto__';assert.throws(()=>b.bookmarks.importJSON(JSON.stringify(bad)));
});
