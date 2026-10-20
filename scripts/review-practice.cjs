// Reproducible score evidence, not a substitute for an instrumental or listening review.
const fs=require('node:fs'),path=require('node:path'),setup=require('../tests/practice-fixture.cjs');
const A=setup(),{practiceComposer:C,practiceGenerator:G,notation:N,music:M}=A;
const locale=JSON.parse(fs.readFileSync('locales/de.json'));A.i18n={t:k=>locale.ui[k]};
const results=[];
for(let grade=0;grade<=5;grade++)for(const [si,style] of C.availableStyles(grade).entries()){
 const seed=20261013+grade*101+si,p=C.generate(grade,seed,style).piece,roles={};
 for(const role of C.instruments){
  let offset=0,previous={},maxLeap=0,maxFastLeap=0,maxFretShift=0,maxBoundaryLeap=0;const values=new Set(),pitches=[],samples=[];
  for(const [sectionIndex,s] of p.sections.entries()){
   let firstInSection=true;
   for(const b of s.bars){
    const part=G.part(b,role),events=N.events({...part,time:p.time,swing:p.swing}),attacks=new Map();
    for(const [voice,notes] of [part.notes,part.bass||[],part.inner||[]].entries())for(const n of notes){
     if(n.r)continue;values.add(n.d);const ns=[].concat(n.p).map(M.midi);pitches.push(...ns);
    }
    for(const e of events){const key=e.voice+':'+e.t;if(!attacks.has(key))attacks.set(key,{voice:e.voice,at:e.t+offset,pitches:[]});attacks.get(key).pitches.push(e.midi);}
    for(const e of [...attacks.values()].sort((a,b)=>a.at-b.at)){
     const center=e.pitches.reduce((a,b)=>a+b)/e.pitches.length,prior=previous[e.voice];
     if(prior&&role!=='drums'){
      const leap=Math.abs(center-prior.center);maxLeap=Math.max(maxLeap,leap);
      if(e.at-prior.at<=.5+1e-8)maxFastLeap=Math.max(maxFastLeap,leap);
      if(prior.sectionIndex!==sectionIndex)maxBoundaryLeap=Math.max(maxBoundaryLeap,leap);
     }
     previous[e.voice]={at:e.at,center,sectionIndex};
    }
    const written=ns=>ns.map(n=>(n.r?'rest':[].concat(n.p).join('+'))+':'+n.d+(n.tie?'~':'')+(n.accent?'>':'')).join(' ');
    if(firstInSection){samples.push({section:s.name,character:s.character[role],firstBar:written(part.notes),bars:[]});firstInSection=false;}
    samples.at(-1).bars.push(Object.fromEntries(['notes','bass','inner'].filter(v=>part[v]).map(v=>[v,written(part[v])])));
    offset+=M.meter(p.time).len;
   }
  }
  if(['guitar','bass'].includes(role)){
   let previous=null;const tuning=role==='guitar'?M.TUNING:M.BASS_TUNING;
   for(const s of p.sections)for(const b of s.bars)for(const n of G.part(b,role).notes){
    if(n.r)continue;const frets=[].concat(n.p).map((pitch,i)=>M.midi(pitch)-M.midi(tuning[Array.isArray(n.s)?n.s[i]:n.s]));
    const center=frets.reduce((a,b)=>a+b)/frets.length;if(previous!==null)maxFretShift=Math.max(maxFretShift,Math.abs(center-previous));previous=center;
   }
  }
  roles[role]={focus:p.roleFocus[role],range:role==='drums'?null:[M.name(Math.min(...pitches)),M.name(Math.max(...pitches))],values:[...values],maxLeap,maxFastLeap,maxBoundaryLeap,maxFretShift,samples:[...new Map(samples.map(s=>[s.section,s])).values()],description:A.practiceInfo.text(p,role)};
 }
 results.push({id:p.id,seed,grade,style,motifFamily:p.motifFamily,musicalAccent:p.musicalAccent,key:p.key,scale:p.scale,time:p.time,quarterTempo:p.quarterTempo,durationSeconds:p.durationSeconds,targetDurationSeconds:p.targetDurationSeconds,rhythmicFigure:p.rhythmicFigure,form:p.form,bars:p.bars,uniqueBars:p.uniqueBars,sections:[...new Map(p.sections.map(s=>[s.name,{name:s.name,bars:s.bars.length,chords:s.bars.map(b=>b.chord)}])).values()],demands:A.practicePhrasing.demands(p),roles});
}
const output=process.argv[2]||'test-results/practice-review.json';fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({method:'Deterministic score inspection; pitch leaps use attack centres, fret shifts ignore rests and open-string hand positions. These are flags for review, not validated difficulty limits.',cases:results},null,2)+'\n');
for(const p of results)console.log(`${p.grade} ${p.style.padEnd(11)} ${String(p.seed)} ${p.key.padEnd(3)} ${p.time} q=${p.quarterTempo} ${p.form.padEnd(16)} `+Object.entries(p.roles).map(([role,r])=>`${role}:${r.focus} leap=${r.maxLeap.toFixed(1)} fast=${r.maxFastLeap.toFixed(1)} boundary=${r.maxBoundaryLeap.toFixed(1)} fret=${r.maxFretShift.toFixed(1)}`).join(' | '));
