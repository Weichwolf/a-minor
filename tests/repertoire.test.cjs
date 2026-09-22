const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{createHash}=require('node:crypto');
const scope=vm.createContext({console,TextEncoder,TextDecoder,Uint8Array,DataView});scope.window=scope;
for(const name of ['music','notation','midi'])vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),scope);
const {music:M,notation:N,midi:MIDI}=scope.AM,catalog=JSON.parse(fs.readFileSync('data/repertoire.json'));
const plain=x=>JSON.parse(JSON.stringify(x));
function notes(voice,start=0){const result=[];let t=start,held=new Map();for(const n of voice){const d=N.dur(n.d),next=new Map();if(!n.r)for(const [i,p]of [].concat(n.p).entries()){const midi=M.midi(p),previous=held.get(midi),item=previous||{midi,t,end:t+d,s:[].concat(n.s)[i]};item.end=t+d;if(!previous)result.push(item);if(n.tie)next.set(midi,item);}held=next;t+=d;}return result;}

test('30 distinct compositions: five per grade, stable English titles and complete bilingual parts',()=>{
 assert.equal(catalog.pieces.length,6*5);assert.equal(new Set(catalog.pieces.map(p=>p.title)).size,30);
 const themes=JSON.parse(fs.readFileSync('scripts/repertoire-themes.json'));assert.equal(new Set(themes.map(p=>JSON.stringify(p.A))).size,30);
 for(let g=0;g<6;g++)assert.equal(catalog.pieces.filter(p=>p.grade===g).length,5);
 for(const p of catalog.pieces){assert.match(p.title,/^[A-Za-z ]+$/);for(const lang of ['de','en'])for(const role of ['guitar','keys'])assert(p.description[lang][role].length>20);assert(p.bars>=8);assert(fs.existsSync(p.score));assert.equal(createHash('sha256').update(fs.readFileSync(p.midi)).digest('hex'),p.sha256);}
});

test('every part fills its bars; P4 strings, held-note collisions, fret spans and keyboard hands are playable',()=>{
 for(const piece of catalog.pieces){const sc=JSON.parse(fs.readFileSync(piece.score));let count=0;
  for(const section of sc.sections)for(const b of section.bars){count++;const len=M.meter(b.time).len;
   for(const v of [b.guitar.notes,b.guitar.bass,b.keys.notes,b.keys.bass,b.bass])assert(Math.abs(v.reduce((t,n)=>t+N.dur(n.d),0)-len)<1e-8,piece.title+' complete bars');
   const guitar=[...notes(b.guitar.notes),...notes(b.guitar.bass)];
   for(const n of guitar){assert(Number.isInteger(n.s)&&n.s>=0&&n.s<6);const fret=n.midi-M.midi(M.TUNING[n.s]);assert(fret>=0&&fret<=sc.maxFret,`${piece.title} ${b.number} P4 range`);}
   for(const t of new Set(guitar.map(n=>n.t))){const held=guitar.filter(n=>n.t<=t&&n.end>t);assert.equal(new Set(held.map(n=>n.s)).size,held.length,`${piece.title} ${b.number} string collision`);const frets=held.map(n=>n.midi-M.midi(M.TUNING[n.s])).filter(f=>f>0);assert(!frets.length||Math.max(...frets)-Math.min(...frets)<=4,piece.title+' fret span');}
   const hands=[notes(b.keys.notes),notes(b.keys.bass)];for(const hand of hands)for(const n of hand){assert(n.midi>=36&&n.midi<=84,piece.title+' C2–C6');const held=hand.filter(x=>x.t<=n.t&&x.end>n.t);assert(held.length<=5);assert(Math.max(...held.map(x=>x.midi))-Math.min(...held.map(x=>x.midi))<=12,piece.title+' hand span');}
   const keyboard=hands.flat();for(const n of keyboard){const held=keyboard.filter(x=>x.t<=n.t&&x.end>n.t);assert.equal(new Set(held.map(n=>n.midi)).size,held.length,piece.title+' shared key');}
  }assert.equal(count,piece.bars);
 }
});

test('actual shared MIDI files match scores, Gigajam channels, programs, markers, tempo and note lifetimes',async()=>{
 const {BasicMIDI,SpessaLog}=await import('spessasynth_core');SpessaLog.setLogLevel(false,false,false);
 for(const p of catalog.pieces){const bytes=fs.readFileSync(p.midi),seq=MIDI.decode(bytes),independent=BasicMIDI.fromArrayBuffer(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length));
  assert.equal(seq.format,0);assert.equal(seq.ppq,480);assert.equal(seq.markers.length,p.sections.length);assert.equal(seq.duration,p.duration);assert.deepEqual([...new Set(seq.events.filter(e=>e.data[0]>>4===9).map(e=>e.data[0]&15))].sort((a,b)=>a-b),[3,5,6,9]);
  assert(Math.abs(independent.duration-seq.duration)<.003,p.title+' independent parser duration');
  const held=new Map(),actual=[];
  for(const e of seq.events){const [status,n,v]=e.data,ch=status&15,key=ch+':'+n;if(status>>4===9&&v){assert(!held.has(key),p.title+' overlapping same pitch');held.set(key,e);}if(status>>4===8||status>>4===9&&!v){const on=held.get(key);assert(on,p.title+' unmatched note-off');actual.push([ch,n,on.tick,e.tick]);held.delete(key);}}
  assert.equal(held.size,0,p.title+' hanging notes');
  const sc=JSON.parse(fs.readFileSync(p.score)),expected=[];let beat=0;
  for(const s of sc.sections){assert.equal(seq.markers.find(m=>m.tick===Math.round(beat*480)).label,s.name);for(const b of s.bars){for(const role of ['guitar','keys','bass']){const v=role==='bass'?{notes:b.bass}:b[role];for(const n of N.events({...v,time:b.time,swing:b.swing}))expected.push([MIDI.channels[role],n.midi,Math.round((beat+n.t)*480),Math.round((beat+n.t+n.dur)*480)]);}for(const n of b.drums)expected.push([9,n.midi,Math.round((beat+n.t)*480),Math.round((beat+n.t+n.dur)*480)]);beat+=M.meter(b.time).len;}}
  const sort=a=>a.sort((x,y)=>x[0]-y[0]||x[1]-y[1]||x[2]-y[2]||x[3]-y[3]);assert.deepEqual(sort(actual),sort(plain(expected)),p.title+' score/MIDI');assert.equal(seq.endTick,beat*480);
  for(const [role,ch]of Object.entries(MIDI.channels))assert(seq.events.some(e=>e.data[0]===(192|ch)&&e.data[1]===p.programs[role]),p.title+' preset '+role);
 }
});

test('MIDI excerpts chase held voices and presets, add one-bar count-in, and terminate every channel',()=>{
 const source=MIDI.decode(MIDI.encode([{tick:0,data:MIDI.tempo(60)},{tick:0,data:[198,27]},{tick:0,data:[150,60,90]},{tick:1440,data:[134,60,0]},{tick:1680,data:[150,64,70]},{tick:1920,data:[134,64,0]}],2400));
 const cut=MIDI.decode(MIDI.excerpt(source,{from:1,to:4,countIn:4,pulse:.5}));assert.equal(cut.duration,5);
 assert.deepEqual(plain(cut.events.filter(e=>e.data[0]===153).map(e=>e.t)),[0,.5,1,1.5]);
 assert(cut.events.some(e=>e.t===2&&e.data[0]===198&&e.data[1]===27));assert(cut.events.some(e=>e.t===2&&e.data[0]===150&&e.data[1]===60));assert(cut.events.some(e=>e.t===5&&e.data[0]===182&&e.data[1]===123));
 assert.throws(()=>MIDI.excerpt(source,{from:5,to:2}));
});

test('MIDI parsing rejects truncation, invalid divisions, running status and corrupt track lengths',()=>{
 const valid=MIDI.encode([{tick:0,data:[147,60,80]},{tick:480,data:[131,60,0]}],960);
 for(let i=0;i<valid.length;i++)assert.throws(()=>MIDI.decode(valid.slice(0,i)));
 for(const [offset,value]of [[0,0],[12,128],[21,255],[23,60]]){const bad=valid.slice();bad[offset]=value;assert.throws(()=>MIDI.decode(bad));}
 assert.throws(()=>MIDI.encode([{tick:-1,data:[147,60,80]}],960));
});

test('all 60 downloadable parts are real PDF files',()=>{
 for(const piece of catalog.pieces)for(const part of ['Guitar','Keyboard']){const file=piece.dir+'/'+piece.title+' '+part+'.pdf',data=fs.readFileSync(file);assert.equal(data.subarray(0,5).toString(),'%PDF-');assert(data.length>5000,file);}
});

test('learning features are present in both relevant parts, with varied phrase dynamics',()=>{
 const find=id=>JSON.parse(fs.readFileSync(catalog.pieces.find(p=>p.id===id).score));
 const poly=find('r4-3').sections.find(s=>s.name==='B');for(const role of ['guitar','keys']){assert(poly.bars[0][role].notes.some(n=>n.d==='qt'));assert.deepEqual((role==='guitar'?poly.bars[0].bass:poly.bars[0].keys.bass).map(n=>n.d),['q','q','q','q']);}
 const ballad=find('r5-2').sections.find(s=>s.name==='Solo');assert(ballad.bars[0].guitar.notes.some(n=>n.bend===2));assert(ballad.bars.every(b=>b.guitar.bass.every(n=>n.r)),'channel-wide bend has no held guitar bass to detune');
 const duet=find('r5-4');for(const name of ['Guitar solo','Keyboard solo']){const section=duet.sections.find(s=>s.name===name);assert(section.bars.every(b=>b.bass.some(n=>!n.r)&&b.guitar.notes.some(n=>!n.r)&&b.keys.notes.some(n=>!n.r)),'both solos retain the band');}
 const dynamic=find('r0-5').sections[0].bars.map(b=>b.dynamics.guitar);assert(new Set(dynamic).size>=3,'phrase has a dynamic arc');
});

test('band guitar uses single lines or adjacent-string fifths; the bass carries the lament',()=>{
 for(const piece of catalog.pieces){
  const score=JSON.parse(fs.readFileSync(piece.score));
  for(const section of score.sections)for(const b of section.bars){
   assert(b.guitar.bass.every(n=>n.r),piece.title+' no independent guitar pedal');
   for(const n of b.guitar.notes)if(Array.isArray(n.p)){
    assert.equal(n.p.length,2);assert.equal(M.midi(n.p[1])-M.midi(n.p[0]),7,piece.title+' power fifth');
    assert.equal(Math.abs(n.s[0]-n.s[1]),1,piece.title+' adjacent strings');
    assert(piece.grade>0,'beginner pieces use single notes');
   }
  }
 }
 const descent=JSON.parse(fs.readFileSync(catalog.pieces.find(p=>p.id==='r2-1').score));
 assert.deepEqual(descent.sections[0].bars.slice(0,4).map(b=>b.bass[0].p),['E2','D2','C2','B1']);
 const broken=JSON.parse(fs.readFileSync(catalog.pieces.find(p=>p.id==='r4-5').score));
 assert(broken.sections[0].bars.every(b=>b.guitar.notes.some(n=>Array.isArray(n.p))));
 for(const b of broken.sections.find(s=>s.name==='Solo').bars)for(const n of b.guitar.notes)if(!n.r)assert(['A','C','D','E','G'].includes(n.p.replace(/-?\d+$/,'')));
});
