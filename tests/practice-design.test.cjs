const {test}=require('node:test'),assert=require('node:assert/strict'),setup=require('./practice-fixture.cjs');
const A=setup(),{practiceComposer:C,practiceDesign:D,practicePhrasing:P,notation:N,music:M}=A;

test('duration follows the MIDI clock, grows by grade and stays comparable across styles and metres',()=>{
 const meters=new Set(),durations=Array.from({length:6},()=>[]);
 for(let grade=0;grade<6;grade++)for(const style of C.availableStyles(grade))for(let seed=0;seed<5;seed++){
  const {piece:p,bytes}=C.generate(grade,seed,style),actual=A.midi.decode(bytes).duration,target=C.profiles[grade].durationSeconds;
  assert(Math.abs(actual-p.durationSeconds)<.002,p.id+': actual playback duration');
  assert(Math.abs(actual/target-1)<=.1,p.id+': '+actual+' seconds');
  assert.equal(p.durationSeconds,D.seconds(p));durations[grade].push(actual);meters.add(p.time);
  p.title='Duration';assert.doesNotThrow(()=>A.bookmarks.validatePiece(p));
 }
 for(let grade=1;grade<6;grade++)assert(Math.min(...durations[grade])>Math.max(...durations[grade-1]));
 assert(meters.has('4/4'));assert(meters.has('12/8'));assert(meters.has('5/8')||meters.has('7/8'));
});

test('style tempos and Grade 5 groove probabilities are distinct without moving grade gates',()=>{
 for(let grade=0;grade<6;grade++)assert(D.tempoRange(grade,'doom')[1]<D.tempoRange(grade,'rock')[1]);
 for(let grade=0;grade<5;grade++)for(const style of C.availableStyles(grade))assert.equal(D.groove(grade,style,.99),'straight');
 const counts={};for(const style of C.styles){counts[style]={straight:0,swing:0,compound:0};for(let n=0;n<1000;n++)counts[style][D.groove(5,style,n/1000)]++;}
 assert(counts.blues.swing>counts.rock.swing*2);assert(counts.lounge.swing>counts.baroque.swing*2);assert(counts.doom.compound>counts.blues.compound);
});

test('Grade 0 avoids borrowed accidentals and difficulty measures actual spellings and short bursts',()=>{
 for(const style of C.availableStyles(0))for(let seed=0;seed<8;seed++){
  const p=C.generate(0,seed,style).piece;
  for(const d of Object.values(P.demands(p).roles))assert.equal(d.accidentalCount,0,p.id);
 }
 const p=C.generate(1,7,'rock').piece;p.key='C';p.quarterTempo=100;
 for(const s of p.sections)for(const b of s.bars)b.guitar.notes=[{p:'F#3',d:'s'},{p:'G3',d:'s'},{p:'F3',d:'e'},{r:1,d:'h'},{r:1,d:'q'}];
 const measured=P.fitTempo(p,[60,120]);
 assert(measured.roles.guitar.accidentalCount>0);assert(measured.roles.guitar.peakDensity>=4);assert(p.quarterTempo<=57,'a short burst limits tempo even when most of the bar is silent');
 for(const s of p.sections)for(const b of s.bars)b.guitar.rhythmSlash=true;
 assert.equal(P.demands(p).roles.guitar.accidentalCount,0,'slash charts do not display the underlying pitch accidentals');
});

test('fills preserve a groove opening, stay short and do not occupy every section ending',()=>{
 for(const [grade,style] of [[0,'doom'],[1,'doom'],[2,'rock'],[3,'lounge'],[4,'baroque'],[5,'blues']])for(let seed=0;seed<4;seed++){
  const p=C.generate(grade,seed,style).piece,unique=p.sections.filter((s,i,ss)=>ss.findIndex(x=>x.name===s.name)===i),fills=unique.flatMap(s=>s.bars.map((b,i)=>({part:b.drumPart,i,len:s.bars.length}))).filter(b=>b.part.fillBeats);
  assert(fills.length<unique.length,p.id+': not every section ends with a fill');
  for(const {part} of fills){assert(part.fillBeats<M.meter(p.time).len);assert(part.fillBeats<=(p.time==='12/8'?1.5:['doom','lounge','baroque'].includes(style)||grade<3?1:2));assert.equal(part.notes[0].p,'F#2');}
 }
});

test('mixed guitar rows render slashes per bar and retain pitch notation and aids elsewhere',()=>{
 const sc={instrument:'guitar',time:'4/4',key:'C',singleLine:true,maxFret:12,rhythmSlashBars:[2],notes:[{p:'C3',d:'w',s:1},{p:['C3','G3'],d:'w',s:[1,2]},{p:'D3',d:'w',s:1},{p:'E3',d:'w',s:2}]},target={clientWidth:1000};
 N.render(target,sc,{names:true});
 assert.equal((target.innerHTML.match(/class="head rhythm-slash/g)||[]).length,1);
 assert.equal((target.innerHTML.match(/<ellipse /g)||[]).length,3);
 assert(target.innerHTML.includes('class="aid">C</text>'));assert(!target.innerHTML.includes('class="aid">B</text>'));
});

test('phrase plans build to a later climax and lead roles reach the actual arrangement',()=>{
 const T=A.practiceMotifs,original=T.phrase;let audibleChanges=0;
 for(const style of C.availableStyles(3)){
  const p=C.generate(3,4,style).piece;let baseline;
  try{T.phrase=(...args)=>({...original(...args),lift:0});baseline=C.generate(3,4,style).piece;}finally{T.phrase=original;}
  const melody=piece=>JSON.stringify([...new Map(piece.sections.map(s=>[s.name,s])).values()].map(s=>s.bars.map(b=>[b.guitar.notes,b.keys.notes])));
  if(melody(p)!==melody(baseline))audibleChanges++;
  for(const s of p.sections){assert(C.instruments.includes(s.character.lead));for(const b of s.bars)if(['guitar','keys'].includes(s.character.lead)){
   const other=s.character.lead==='guitar'?'keys':'guitar';assert(b.dynamics[s.character.lead]>b.dynamics[other]);
  }}
 }
 assert(audibleChanges>=3,'phrase development changes actual pitches across styles');
});
