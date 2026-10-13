const {test}=require('node:test'),assert=require('node:assert/strict'),setup=require('./practice-fixture.cjs');
const A=setup(),{music:M,practicePhrasing:P}=A;
const notes=ps=>ps.map(p=>({p,d:'e',s:M.position(M.midi(p),{maxFret:9}).s}));
function cost(ns){
 const positions=ns.map(n=>P.positions(n,M.TUNING,9).find(p=>p.strings[0]===n.s));
 return positions.reduce((sum,p,i)=>sum+p.position*.04+(i?P.movement(positions[i-1],p,.5):0),0);
}
test('phrase placement considers following notes and improves the independently chosen route',()=>{
 const phrase=notes(['E4','F4','G4','F4','E4']),before=cost(phrase),music=phrase.map(({s,...n})=>n);
 P.place(phrase,{maxFret:9});assert(cost(phrase)<before);
 assert.deepEqual(phrase.map(({s,...n})=>n),music);
 // Exhaustive independent enumeration verifies the result on this short phrase.
 let optimum=Infinity;
 function visit(i,route){if(i===phrase.length){optimum=Math.min(optimum,cost(route));return;}
  for(const p of P.positions(phrase[i],M.TUNING,9))visit(i+1,[...route,{...phrase[i],s:p.strings[0]}]);
 }
 visit(0,[]);assert(Math.abs(cost(phrase)-optimum)<1e-9);
});
test('ties retain their string, rests break ties, and a varied return preserves its locked opening',()=>{
 const phrase=notes(['E4','E4','F4','G4']);phrase[0].tie=1;phrase[0].s=3;
 P.place(phrase,{maxFret:9,locked:1});assert.equal(phrase[0].s,3);assert.equal(phrase[1].s,3);
 const rest=[{p:'E2',d:'q',s:0,tie:1},{r:1,d:'q'},{p:'F4',d:'q',s:5}];
 P.place(rest,{maxFret:0});assert.equal(rest[2].s,5);
 // A tie flag cannot bind two different pitches, including at a bar boundary.
 const different=[{p:'E2',d:'q',s:0,tie:1},{p:'F4',d:'q',s:5}];
 P.place(different,{maxFret:0});assert.equal(different[1].s,5);
});
test('power chords stay on neighbouring strings; bass uses its own tuning',()=>{
 const chords=[{p:['A2','E3'],d:'q',s:[1,2]},{p:['B2','F#3'],d:'q',s:[1,2]}];
 P.place(chords,{maxFret:9});for(const n of chords)assert.equal(n.s[1]-n.s[0],1);
 const bass=[{p:'E1',d:'e',s:0},{p:'F1',d:'e',s:0},{p:'G1',d:'e',s:0}];
 P.place(bass,{tuning:M.BASS_TUNING,maxFret:5});for(const n of bass)assert(M.midi(n.p)-M.midi(M.BASS_TUNING[n.s])<=5);
});
test('combined demands reduce tempo while uncomplicated phrases retain their target tempo',()=>{
 const score=(key,notes)=>({grade:0,key,time:'4/4',quarterTempo:128,tempo:128,sections:[{name:'A',bars:Array.from({length:4},()=>({
  time:'4/4',guitar:{notes,bass:[{r:1,d:'w'}]},keys:{notes:[{r:1,d:'w'}],bass:[{r:1,d:'w'}]},
  bass:[{p:'E1',d:'w'}],drumPart:{notes:[{p:'F#2',d:'w'}],bass:[{r:1,d:'w'}]}
 }))}]});
 const easy=score('C',[{p:'E3',d:'w'}]);P.fitTempo(easy,[85,128]);assert.equal(easy.quarterTempo,128);
 const difficult=score('A',Array.from({length:4},()=>({p:'E3',d:'q'}))),report=P.fitTempo(difficult,[85,128]);
 assert.equal(report.roles.guitar.density,1);assert.equal(report.tonality,1);
 assert(difficult.quarterTempo<128&&difficult.quarterTempo>=85);assert.equal(difficult.tempo,difficult.quarterTempo);
 const compound=score('C',[{p:'E3',d:'w'}]);compound.time='12/8';P.fitTempo(compound,[85,128]);assert.equal(compound.tempo,85.33);
});
