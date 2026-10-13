const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),setup=require('./practice-fixture.cjs'),{plain}=setup;
const A=setup(),{practiceComposer:C,practiceGenerator:G,practiceInfo:I,music:M}=A;
test('bilingual descriptions give actual theory and role-specific rhythm without task or solution lists',()=>{
 for(const language of ['de','en']){const locale=JSON.parse(fs.readFileSync('locales/'+language+'.json'));A.i18n={t:k=>locale.ui[k]};for(let grade=0;grade<6;grade++)for(const style of C.styles){const p=C.generate(grade,11,style).piece;
  for(const instrument of C.instruments){const before=JSON.stringify(p),d=I.describe(p,instrument),html=I.html(p,instrument);assert.equal(JSON.stringify(p),before);assert(!/undefined|NaN|\{\w+\}|<table|<ol|<details|improvis/i.test(html));assert.equal((html.match(/<p/g)||[]).length,1);assert(html.includes(locale.ui['style_'+style]));assert(html.includes(p.time));for(const section of d.sections.filter(s=>s.name!=='O'))assert(html.includes(locale.ui['sectionCharacter_'+section.character]));assert.equal(d.sections.flatMap(s=>s.bars).length,p.uniqueBars);
   if(instrument==='drums'){assert.equal(d.usedNotes.length,0);assert.equal(d.melodicIntervals.length,0);assert(d.kit.includes(36)&&d.kit.includes(38));}
   else{assert(html.includes(d.sections[0].bars[0].chord.replace(/#/g,'♯').replace(/b/g,'♭')));const used=new Set(p.sections.flatMap(s=>s.bars.flatMap(b=>Object.values(G.part(b,instrument)).filter(Array.isArray).flat())).filter(n=>n?.p&&!n.r).flatMap(n=>[].concat(n.p).map(p=>M.pc(M.midi(p)))));assert.deepEqual([...used].sort((a,b)=>a-b),plain(d.usedNotes.map(n=>M.pc(M.midi(n+'3'))).sort((a,b)=>a-b)));}
  }
 }}
});
test('roman alterations are not doubled and form text compresses long literal returns',()=>{
 A.i18n={t:k=>JSON.parse(fs.readFileSync('locales/de.json')).ui[k]};const p=C.generate(0,42,'doom').piece;assert(!/♭♭/.test(I.text(p,'guitar')));const long=C.generate(4,0).piece;assert(I.form(long).includes('×'));assert(I.form(long).length<long.sections.map(s=>s.name).join('–').length);assert(I.text(p,'guitar').includes('Abschnitte:'));assert(I.describe(p,'guitar').sections.every(s=>s.character));
});
