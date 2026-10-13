const {test}=require('node:test'),assert=require('node:assert/strict'),setup=require('./practice-fixture.cjs');
const A=setup(),{practiceComposer:C,practiceGenerator:G,notation:N,music:M}=A;
const cases=[];
for(const style of C.styles)for(const grade of [4,5])for(let seed=0;seed<80;seed++){
 const focus=C.focusFor(grade,seed,style);
 if(Object.values(focus).some(f=>/syncop|seventhArpeggio|ties|rhythmChart|tripletPickup/.test(f)))cases.push(C.generate(grade,seed,style).piece);
}
test('every selected syncopation focus has a written attack sustained across a stronger metrical point',()=>{
 const covered=new Set();
 for(const p of cases)for(const role of ['guitar','keys','bass'])if(/syncop/i.test(p.roleFocus[role])){
  const meter=M.meter(p.time),strong=[];let t=0;for(const group of meter.groups){strong.push(t);t+=group*4/meter.d;}
  const isStrong=t=>strong.some(s=>Math.abs(t-s)<1e-8);
  const has=p.sections.some(s=>s.bars.some(b=>N.events(G.part(b,role)).some(e=>!isStrong(e.t)&&strong.some(t=>t>e.t+1e-8&&t<e.t+e.dur-1e-8))));
  assert(has,`${p.id}/${role}: syncope is present in the music`);covered.add(role+'/'+p.style);
 }
 assert.equal(covered.size,18,'all three pitched instruments in all six styles');
});
test('a seventh-arpeggio focus actually plays a seventh as a single note within the chord figure',()=>{
 const covered=new Set();
 for(const p of cases)if(p.roleFocus.guitar==='seventhArpeggio'){
  const has=p.sections.some(s=>s.bars.some(b=>{
   let at=0;const heard=new Set();
   for(const n of b.guitar.notes){const h=b.harmony.changes?.findLast(c=>c.t<=at+1e-8)?.h??b.harmony;at+=N.dur(n.d);
    if(n.r||Array.isArray(n.p)||h.pcs.length!==4)continue;
    const degree=h.pcs.indexOf(M.pc(M.midi(n.p)));if(degree>=0)heard.add(degree);
   }
   return heard.has(0)&&heard.has(1)&&heard.has(3);
  }));
  assert(has,`${p.id}: root, third and seventh are heard in a broken chord`);covered.add(p.style);
 }
 assert.equal(covered.size,6);
});

test('shuffle focuses sound unequal eighth pairs and drum stops contain a shared pause before the ending',()=>{
 const coverage=new Set();
 for(const style of C.styles)for(const grade of [0,5])for(let seed=0;seed<100;seed++){
  const focuses=C.focusFor(grade,seed,style),roles=C.instruments.filter(role=>/shuffleRiff|shuffleBass|swingComping|stops/.test(focuses[role]));if(!roles.length)continue;
  const p=C.generate(grade,seed,style).piece,bars=p.sections.flatMap(s=>s.bars);
  for(const role of roles){
   const focus=focuses[role];coverage.add(style+'/'+focus);
   if(focus==='stops'){
    assert(bars.slice(0,-1).some(b=>{const e=N.events(b.drumPart);return e.length&&!e.some(n=>n.t>=3||n.t+n.dur>3+1e-8);}),p.id+': a full drum pause before the final bar');
   }else{
    assert.equal(p.swing,true,p.id+': selected shuffle is performed with swing');
    assert.equal(p.time,'4/4');
    assert(bars.some(b=>{
     const part=G.part(b,role);return ['notes','bass','inner'].some(voice=>{
      const ns=part[voice]||[];let at=0;
      return ns.some((n,i)=>{const start=at;at+=N.dur(n.d);return !n.r&&n.d==='e'&&ns[i+1]?.d==='e'&&!ns[i+1].r&&Math.abs(start-Math.round(start))<1e-8;});
     });
    }),p.id+': a written eighth pair makes the ternary subdivision audible');
   }
  }
 }
 for(const style of C.styles)for(const focus of ['stops','shuffleRiff','shuffleBass','swingComping'])assert(coverage.has(style+'/'+focus),style+'/'+focus);
});

test('chromatic colour resolves a real non-scale neighbour, and kick variation includes an offbeat bass drum',()=>{
 let colours=0,kicks=0;
 for(const style of C.styles)for(const grade of [2,3])for(let seed=0;seed<60;seed++){
  const focus=C.focusFor(grade,seed,style);if(focus.keys!=='chromaticColour'&&focus.drums!=='kickVariation')continue;
  const p=C.generate(grade,seed,style).piece,bars=p.sections.flatMap(s=>s.bars);
  if(focus.keys==='chromaticColour'){
   colours++;const scale=M.scalePcs(p.root,p.scale);
   assert(bars.some(b=>{
    const notes=b.keys.notes.filter(n=>!n.r&&!Array.isArray(n.p));
    return notes.some((n,i)=>notes[i+1]&&!scale.includes(M.pc(M.midi(n.p)))&&scale.includes(M.pc(M.midi(notes[i+1].p)))&&Math.abs(M.midi(n.p)-M.midi(notes[i+1].p))===1);
   }),p.id+': chromatic approach has an audible semitone resolution');
  }
  if(focus.drums==='kickVariation'){
   kicks++;assert(bars.some(b=>N.events(b.drumPart).some(e=>e.midi===36&&Math.abs(e.t-Math.round(e.t))>.01)),p.id+': an actual offbeat kick');
  }
 }
 assert(colours>50&&kicks>50);
});

test('selected tie, rhythm-chart and triplet-pickup focuses survive style and metre choices',()=>{
 const coverage=new Set();
 for(const p of cases)for(const role of ['guitar','keys']){
  const focus=p.roleFocus[role],parts=p.sections.flatMap(s=>s.bars.map(b=>G.part(b,role)));
  if(focus==='ties'){
   const notes=parts.flatMap(p=>p.notes);assert(notes.some((n,i)=>n.tie&&!n.r&&JSON.stringify(n.p)===JSON.stringify(notes[i+1]?.p)),p.id+'/'+role+': an actual tied pair');coverage.add(p.style+'/'+role+'/ties');
  }
  if(focus==='rhythmChart'){
   assert(parts.some(p=>p.rhythmSlash),p.id+': rhythm slash notation');assert(parts.some(p=>p.percentRepeat),p.id+': a written bar repeat');coverage.add(p.style+'/chart');
  }
  if(focus==='tripletPickup'){
   assert(parts.some(part=>part.notes.some((n,i,ns)=>!n.r&&n.d===(p.time==='12/8'?'e':'et')&&ns.slice(i,i+3).length===3&&ns.slice(i,i+3).every(x=>!x.r&&x.d===n.d))),p.id+': a complete three-note pickup');coverage.add(p.style+'/pickup');
  }
 }
 for(const style of C.styles)for(const suffix of ['guitar/ties','keys/ties','chart','pickup'])assert(coverage.has(style+'/'+suffix),style+'/'+suffix);
});
