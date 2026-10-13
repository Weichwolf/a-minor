const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context=vm.createContext({console,Uint8Array,TextEncoder,TextDecoder});context.window=context;
for(const name of ['music','glyphs','notation','midi'])vm.runInContext(fs.readFileSync(`js/${name}.js`,'utf8'),context);
const {notation:N,midi:M}=context.AM;
const book=JSON.parse(fs.readFileSync('data/book.json','utf8'));
const examples=book.parts.flatMap(p=>p.chapters.flatMap(c=>c.examples));
test('theory percussion examples render one percussion staff and play their written drum hits',()=>{
 const drums=examples.filter(e=>e.instrument==='drums');assert.equal(drums.length,5);
 for(const example of drums){
  const score={...example.score,instrument:'drums'},el={};N.render(el,score);
  assert(el.innerHTML.includes('percussion-clef'),example.id);
  assert(!el.innerHTML.includes('class="acc"'),example.id);
  const performance=N.performance(score,example.tempo),events=performance.events.map(e=>({...e,velocity:80}));
  const sequence=M.decode(M.notes(events,performance.duration,{instrument:'drums'}));
  const attacks=sequence.events.filter(e=>(e.data[0]>>4)===9&&e.data[2]);
  assert.equal(attacks.length,events.length,example.id);
  assert(attacks.every(e=>e.data[0]===0x99&&[36,38,42,45,49].includes(e.data[1])),example.id);
  const expected=events.map(e=>`${Math.round(e.t*480)}:${e.midi}`).sort();
  assert.deepEqual(Array.from(attacks,e=>`${Math.round(e.t*480)}:${e.data[1]}`).sort(),Array.from(expected),example.id);
 }
});
test('bass preview preserves sounding octave and uses the bass MIDI channel and program',()=>{
 const sequence=M.decode(M.notes([{t:0,dur:1,midi:28,velocity:75}],1,{instrument:'bass'}));
 assert(sequence.events.some(e=>e.data[0]===0x95&&e.data[1]===28));
 assert(sequence.events.some(e=>e.data[0]===0xc5&&e.data[1]===33));
});
