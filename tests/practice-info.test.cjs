const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=vm.createContext({console,TextEncoder,TextDecoder,Uint8Array});c.window=c;for(const name of ['music','glyphs','notation','midi','audio','practice-generator','practice-composer','practice-info'])vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),c);
const {practiceComposer:C,practiceInfo:I,music:M}=c.AM,plain=v=>JSON.parse(JSON.stringify(v));
test('short bilingual descriptions report the actual harmony, intervals and rhythm without solution lists or exercises',()=>{
 for(const language of ['de','en']){const locale=JSON.parse(fs.readFileSync('locales/'+language+'.json'));c.AM.i18n={t:k=>locale.ui[k]};
  for(let grade=0;grade<6;grade++)for(const style of C.styles)for(const instrument of ['guitar','keys']){
   const p=C.generate(grade,11,style).piece,before=JSON.stringify(p),d=I.describe(p,instrument),html=I.html(p,instrument);
   assert.equal(JSON.stringify(p),before);assert(!/undefined|NaN|\{\w+\}|<table|<ol|<details/.test(html)&&!/improvis/i.test(html));assert.equal((html.match(/<p/g)||[]).length,1);
   assert(html.includes(locale.ui['style_'+style]));assert(html.includes(p.time));assert(html.includes(d.sections[0].bars[0].chord.replace(/#/g,'♯').replace(/b/g,'♭')));
   const used=new Set(p.sections.flatMap(s=>s.bars.flatMap(b=>[...b[instrument].notes,...(instrument==='keys'?b.keys.bass:[])])).filter(n=>!n.r).flatMap(n=>[].concat(n.p).map(p=>M.pc(M.midi(p)))));
   assert.deepEqual([...used].sort((a,b)=>a-b),plain(d.usedNotes.map(n=>M.pc(M.midi(n+'3'))).sort((a,b)=>a-b)));assert.equal(d.sections.flatMap(s=>s.bars).length,p.uniqueBars);
   if(grade===0)assert(!html.includes('(i)'));if(grade>=2)assert(/\((?:i|I)(?:maj)?7?\)/.test(html));
  }
 }
});
test('interval analysis includes actual leaps and chord intervals rather than only the permitted generator steps',()=>{
 c.AM.i18n={t:k=>JSON.parse(fs.readFileSync('locales/de.json')).ui[k]};const p=C.generate(2,43,'rock').piece;
 const d=I.describe(p,'guitar');assert(d.harmonicIntervals.includes(7));assert(d.melodicIntervals.length);assert(d.melodicIntervals.every(x=>Number.isInteger(x.semitones)&&x.count>0));
 const played=p.sections.flatMap(s=>s.bars.flatMap(b=>b.guitar.notes));assert(played.some(n=>n.d==='e'||n.d==='s'||n.d==='q.'));
});
test('tied continuations do not count as new melodic attacks',()=>{
 const p=C.generate(3,17,'cinematic').piece;assert.equal(p.time,'12/8');
 for(const s of p.sections)for(const b of s.bars)b.guitar.notes=[{p:'E3',d:'h.',tie:1},{p:'E3',d:'h.'}];
 const d=I.describe(p,'guitar');assert.equal(d.melodicIntervals.find(x=>x.semitones===0).count,d.sections.reduce((n,s)=>n+s.length-1,0));
});
