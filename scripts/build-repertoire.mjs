import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const scope=vm.createContext({console,TextEncoder,TextDecoder,Uint8Array,DataView});scope.window=scope;
for(const f of ['music','notation','midi'])vm.runInContext(fs.readFileSync(`js/${f}.js`,'utf8'),scope);
const {music:M,notation:N,midi:MIDI}=scope.AM;
const themes=JSON.parse(fs.readFileSync('scripts/repertoire-themes.json'));
const gradeNames=['00 Debut Grade','01 Grade One','02 Grade Two','03 Grade Three','04 Grade Four','05 Grade Five'];
const harmony={Em:['E','G','B'],Am:['A','C','E'],Dm:['D','F','A'],Bm:['B','D','F#'],C:['C','E','G'],D:['D','F#','A'],G:['G','B','D'],F:['F','A','C'],Bb:['Bb','D','F'],B7:['B','D#','F#','A'],E7:['E','G#','B','D'],A7:['A','C#','E','G'],Bdim:['B','D','F'],'G#dim7':['G#','B','D','F'],E5:['E','B'],A5:['A','E'],G5:['G','D'],C5:['C','G'],D5:['D','A']};
const degrees={Em:['E','F#','G','A','B','C','D'],Am:['A','B','C','D','E','F','G'],Dm:['D','E','F','G','A','Bb','C']};
const clone=x=>JSON.parse(JSON.stringify(x));
const barLength=notes=>notes.reduce((n,v)=>n+N.dur(v.d),0);
const pitch=(p,shift,key)=>{const m=M.midi(p)+shift;return shift%12===0?p.replace(/-?\d+$/,String(M.parse(p).octave+shift/12)):M.name(m,key==='Dm');};
const rootOf=ch=>harmony[ch][0];
const low=(pc,min=40)=>{let n=M.midi(pc+'1');while(n<min)n+=12;return M.name(n,/b/.test(pc));};
const chord=(name,octave=3)=>{const tones=harmony[name];let previous=-1;return tones.map(p=>{let n=M.midi(p+octave);while(n<=previous)n+=12;previous=n;return M.name(n,/b/.test(p));});};
const durs=len=>{const result=[];for(const d of ['w','h.','h','q.','q','e','s'])while(len>=N.dur(d)-1e-8){result.push(d);len-=N.dur(d);}if(Math.abs(len)>1e-8)throw Error('Unrepresentable duration');return result;};
const held=(p,len)=>durs(len).map((d,i,a)=>p?{p,d,...(i<a.length-1?{tie:1}:{})}:{r:1,d});
function read(text) {return text.trim().split(/\s+/).map(token=>{const [p,raw]=token.split(':'),d=raw.replace(/[~!*]/g,'');N.dur(d);return {...(p==='-'?{r:1}:{p}),d,...(raw.includes('~')?{tie:1}:{}),...(raw.includes('!')?{accent:1}:{}),...(raw.includes('*')?{staccato:1}:{})};});}
function assignStrings(voices,maxFret,label) {
  const items=[];voices.forEach((notes,voice)=>{let t=0;notes.forEach((n,ni)=>{const end=t+N.ticks(n.d);if(!n.r)[].concat(n.p).forEach((p,pi)=>items.push({n,pi,midi:M.midi(p),t,end,voice,ni}));t=end;});});
  items.sort((a,b)=>a.t-b.t||a.midi-b.midi);
  let attempts=0;
  function solve(i,active) {
    if(i===items.length)return true;if(++attempts>200000)throw Error('Position search exhausted '+label);
    const e=items[i],other=active.filter(x=>x.end>e.t),previous=items.slice(0,i).reverse().find(x=>x.voice===e.voice&&x.pi===e.pi&&x.ni===e.ni-1);
    const positions=M.TUNING.map((p,s)=>({s,f:e.midi-M.midi(p)})).filter(p=>p.f>=0&&p.f<=maxFret&&!other.some(x=>x.s===p.s)&&(!previous?.n.tie||previous.s===p.s)).sort((a,b)=>a.f-b.f);
    for(const pos of positions){const frets=[...other.map(x=>x.f),pos.f].filter(f=>f>0);if(Math.max(...frets)-Math.min(...frets)>4)continue;e.s=pos.s;e.f=pos.f;if(solve(i+1,[...other,{...e,...pos}]))return true;}
    return false;
  }
  if(!solve(0,[]))throw Error('Unplayable guitar '+label+' '+JSON.stringify(voices));
  for(const e of items)if(Array.isArray(e.n.p)){e.n.s||=[];e.n.s[e.pi]=e.s;}else e.n.s=e.s;
}
function counter(ch,len,octave,style,index,grade) {
  const tones=chord(ch,octave),top=tones[tones.length===2?0:Math.min(1,tones.length-1)],fifth=tones[Math.min(2,tones.length-1)];
  if(grade===0) {
    if(index<2)return [...held(null,len/2),...held(index?fifth:top,len/2)];
    return [...held(top,len/2),...held(fifth,len/2)];
  }
  if(style==='power'||style==='syncopation'||style==='332') {
    const out=[];let t=0;while(t<len){out.push({r:1,d:'e'});t+=.5;if(t<len){out.push({p:[top,fifth],d:'e',staccato:1});t+=.5;}}return out;
  }
  if(style==='compound'||style==='ballad')return [0,1,2,3].map((_,i)=>({p:i%2?fifth:top,d:'q.'}));
  if(style==='odd')return [{p:top,d:'q'},{p:fifth,d:'q'},{p:top,d:'q.'}];
  return [...held(top,len/2),...held(fifth,len/2)];
}
function drums(song,ch,bar,index,section,finalBar) {
  const len=M.meter(bar.time).len,compound=bar.time==='12/8',odd=bar.time==='7/8',out=[];
  const hit=(t,n,v,d=.12)=>{if(t>=0&&t<len)out.push({t,midi:n,velocity:v,dur:Math.min(d,len-t)});};
  if(finalBar){hit(0,36,91);hit(0,49,68,.25);return out;}
  const sparse=section==='I'||song.grade===0,sub=sparse?1:compound||odd?.5:.5;
  for(let t=0;t<len;t+=sub){let at=song.style==='shuffle'&&t%1===.5?t+1/6:t;hit(at,42,(t%1===0?53:38)+(index%2?3:0));}
  if(odd){hit(0,36,87);hit(1,36,65);hit(2,38,79);}
  else if(compound){hit(0,36,87);hit(1.5,38,76);hit(3,36,74);hit(4.5,38,83);}
  else if(len===3){hit(0,36,82);hit(2,sparse?37:38,67);}
  else if(sparse||['breath','phrygian','cadence'].includes(song.style)){hit(0,36,80);hit(2,sparse?37:38,67);}
  else{hit(0,36,85);hit(1,38,76);hit(2,36,78);hit(3,38,84);if(song.grade>=2&&index%2)hit(2.5,36,61);}
  if(song.grade>=2&&index%4===3){hit(len-.75,45,58);hit(len-.5,47,66);hit(len-.25,41,75);}
  if(song.grade>=1&&index===0&&section!=='I')hit(0,49,58,.3);
  return out;
}
function build(song) {
  const sections=[],flat=[];let startBeat=0,barNumber=1;
  const maxFret=[5,5,7,9,12,12][song.grade],tonic=rootOf(song.key),tonicChord=song.key;
  const form=song.form.split(' ').map(token=>({name:token[0],bars:Number(token.slice(1))}));
  for(const [si,part] of form.entries()) {
    const isB=['B','S','K'].includes(part.name),src=isB?song.B:song.A,progression=isB?song.harmonyB:song.harmonyA;
    const time=song.style==='finale'&&['I','B'].includes(part.name)?'3/4':song.time,len=M.meter(time).len;
    const section={name:part.name==='V'?'A′':part.name==='I'?'Intro':part.name==='C'?'Coda':part.name==='S'?'Solo':part.name==='G'?'Guitar solo':part.name==='K'?'Keyboard solo':part.name,startBar:barNumber,time,...(time==='7/8'?{groups:[2,2,3]}:{}),bars:[],startBeat};
    for(let bi=0;bi<part.bars;bi++,barNumber++) {
      const finalBar=si===form.length-1&&bi===part.bars-1,idx=bi%4,cycle=Math.floor(bi/4);
      let ch=progression[idx],lead=read(src[idx]),key=song.key;
      if(song.style==='lydian'&&isB)key='G';
      if(finalBar){ch=tonicChord;lead=held(low(tonic,52),len);}
      else if(song.style==='finale'&&time==='3/4') {
        const melody=part.name==='I'?['E4:h B3:q','G4:h E4:q','A4:q G4:q F#4:q','D#4:h B3:q']:['G4:q B4:q A4:q','G4:h E4:q','A4:q C5:q B4:q','G4:q F#4:q E4:q'];
        lead=read(melody[idx]);
      }
      if(Math.abs(barLength(lead)-len)>1e-8)throw Error(song.title+' bar '+bi+' length '+barLength(lead)+' != '+len);
      if(cycle%2&&!finalBar) {
        const last=lead.findLast(n=>!n.r&&!n.tie);if(last&&N.dur(last.d)>=1)last.accent=1;
        if(part.name==='V'&&song.grade>=4){const first=lead.find(n=>!n.r);if(first&&M.midi(first.p)+12<=76)first.p=pitch(first.p,12,song.key);}
      }
      if(part.name==='S'&&song.style==='332')for(const n of lead)if(!n.r){const pool=['A3','C4','D4','E4','G4','A4'];n.p=pool.reduce((best,p)=>Math.abs(M.midi(p)-M.midi(n.p))<Math.abs(M.midi(best)-M.midi(n.p))?p:best,pool[0]);}
      const keyboardLead=(isB&&part.name!=='S')||part.name==='K', guitarSilent=part.name==='K', keysSilent=part.name==='G';
      let guitar=keyboardLead&&song.style!=='polyrhythm'?counter(ch,len,3,song.style,idx,song.grade):clone(lead);
      if(song.style==='power')guitar=clone(lead).map(n=>n.r?n:{...n,p:[n.p,pitch(n.p,7,song.key)],staccato:idx%2?undefined:1});
      if(song.style==='legato'&&!keyboardLead){for(let i=0;i<guitar.length-1;i++)if(!guitar[i].r&&guitar[i].d==='e'&&!guitar[i+1].r&&Math.abs(M.midi(guitar[i].p)-M.midi(guitar[i+1].p))<=2){guitar[i].slur=1;guitar[i+1].slurEnd=1;i++;}}
      if(song.style==='ballad'&&part.name==='S'&&bi===0){guitar=read('G4:q. E4:q. D4:q. C4:q.');guitar[0].bend=2;}
      if(song.style==='lydian'&&isB)guitar=[...held(['E3','A3','D4'],len/2),...held(['G3','C4','F#4'],len/2)];
      if(part.name==='V'&&song.grade<4&&!finalBar){const first=guitar.find(n=>!n.r);if(first)first.accent=1;const last=guitar.at(-1);if(!last.r&&!last.tie&&N.dur(last.d)>=2){const duration=N.dur(last.d);guitar.splice(-1,1,...held(last.p,duration-1),{r:1,d:'q'});}}
      if(part.name==='C'&&!finalBar){const end=guitar.at(-1);if(!end.r&&!end.tie&&N.dur(end.d)>=2){const d=N.dur(end.d);guitar.splice(-1,1,...held(end.p,d-1),...held(low(tonic,52),1));}}
      if(part.name==='I')guitar=held(chord(ch,3)[1],len);
      let guitarBass=held(null,len);
      const ownBass=song.grade===0?song.style==='pedal':!['power','shuffle','332'].includes(song.style);
      if(ownBass&&!guitarSilent&&!(part.name==='S'&&song.style==='ballad')) {
        let bassPitch=low(rootOf(ch),song.style==='ritornello'&&rootOf(ch)==='F'?48:40);
        if(song.style==='pedal')bassPitch=low(tonic);
        if(song.style==='lamento')bassPitch=['E3','D3','C3','B2'][idx];
        if(guitar.some(n=>!n.r&&[].concat(n.p).some(p=>M.midi(p)===M.midi(bassPitch)))){const fifth=harmony[ch][Math.min(2,harmony[ch].length-1)];bassPitch=low(fifth,40);}
        guitarBass=song.style==='polyrhythm'&&isB?Array.from({length:4},()=>({p:bassPitch,d:'q'})):held(bassPitch,len);
      }
      if(guitarSilent){guitar=held(null,len);guitarBass=held(null,len);}
      const lowLead=Math.min(...lead.filter(n=>!n.r).flatMap(n=>[].concat(n.p).map(M.midi))),shift=Math.max(0,Math.ceil((60-lowLead)/12)*12);
      let right=keyboardLead?clone(lead).map(n=>n.r?n:{...n,p:pitch(n.p,shift,song.key)}):counter(ch,len,4,song.style,idx,song.grade);
      let left=held(null,len);
      if(song.grade===0){if(song.style==='pedal')left=held(low(tonic,48),len);else if(song.id==='r0-2'&&bi%2===0)left=held(low(tonic,48),len);else if(song.id==='r0-3'&&bi%2===0){left=right.map(n=>n.r?n:{...n,p:pitch(n.p,-12,song.key)});right=held(null,len);}}
      else {
        let tones=chord(ch,3);if(Math.max(...tones.map(M.midi))>=60)tones=tones.map(p=>pitch(p,-12,song.key));const root=tones[0];
        if(song.style==='lamento')left=held(['E3','D3','C3','B2'][idx],len);
        else if(song.style==='polyrhythm'&&isB)left=Array.from({length:4},(_,i)=>({p:i%2?tones[1]:root,d:'q'}));
        else if(['arpeggio','compound','ballad','ritornello'].includes(song.style)) {
          const step=time==='12/8'?.5:1,d=step===.5?'e':'q';left=Array.from({length:len/step},(_,i)=>({p:tones[[0,2,1,2][i%4]],d}));
        } else if(song.grade>=1&&!['pedal','phrygian','sixteenths','register'].includes(song.style))left=held(tones.slice(0,2),len);
        else left=held(root,len);
      }
      if(song.style==='ballad'&&part.name==='B'){left=clone(lead).map(n=>n.r?n:{...n,p:pitch(n.p,-12,song.key)});right=counter(ch,len,4,'quiet',idx,song.grade);}
      if(keysSilent){right=held(null,len);left=held(null,len);}
      if(finalBar){guitar=held(low(tonic,52),len);guitarBass=ownBass?held(low(tonic),len):held(null,len);right=held(low(tonic,64),len);left=song.grade?held(chord(tonicChord,3),len):song.style==='pedal'?held(low(tonic,48),len):held(null,len);}
      const voices=[guitar,guitarBass];assignStrings(voices,maxFret,song.title+' '+part.name+' '+bi);
      const bassRoot=low(rootOf(ch),28),bassSilent=['G','K'].includes(part.name);
      let bandBass=bassSilent?held(null,len):song.grade===0||part.name==='I'||finalBar?held(bassRoot,len):time==='12/8'?[{p:bassRoot,d:'q.'},{p:bassRoot,d:'q.'},{p:pitch(bassRoot,7,song.key),d:'q.'},{p:bassRoot,d:'q.'}]:time==='7/8'?[{p:bassRoot,d:'q'},{p:bassRoot,d:'q'},{p:pitch(bassRoot,7,song.key),d:'q.'}]:[...held(bassRoot,len/2),...held(song.grade>=2?pitch(bassRoot,7,song.key):bassRoot,len/2)];
      const phrase=[.92,1,.96,.86][idx]*(part.name==='I'?.82:finalBar?.86:1),dynamics={guitar:Math.round((keyboardLead?62:80)*phrase),keys:Math.round((keyboardLead?82:64)*phrase)};
      const bar={number:barNumber,time,key,chord:ch,dynamics,guitar:{notes:guitar,bass:guitarBass},keys:{notes:right,bass:left},bass:bandBass};
      bar.drums=drums(song,ch,bar,bi,part.name,finalBar);
      if(song.style==='shuffle')bar.swing=true;
      for(const voice of [guitar,guitarBass,right,left,bandBass])if(Math.abs(barLength(voice)-len)>1e-8)throw Error('Unaligned bar '+song.title);
      section.bars.push(bar);flat.push(bar);startBeat+=len;
    }
    sections.push(section);
  }
  const guitarProgram=['power','332'].includes(song.style)?30:['cadence','diminished','suite','finale'].includes(song.style)?29:27;
  const programs={keys:['breath','register','lydian'].includes(song.style)?4:0,bass:33,guitar:guitarProgram,drums:song.grade>=2?16:0};
  const phases=[['p0','k0'],['p1','p2','k1','k2'],['p3','k3'],['p4','p5','k4','k5'],['p6','p7','k6','k7'],['p8','k8']][song.grade];
  const description=song.description;
  return {id:song.id,title:song.title,grade:song.grade,key:song.key,tempo:song.tempo,time:song.time,style:song.style,maxFret,programs,prerequisites:phases,description,sections,bars:flat.length};
}
function midi(piece) {
  const events=[{tick:0,data:MIDI.text(3,piece.title),order:-10}],channel=MIDI.channels;let beat=0;
  for(const [role,ch]of Object.entries(channel)){events.push({tick:0,data:[176|ch,121,0],order:-9},{tick:0,data:[176|ch,0,0],order:-8},{tick:0,data:[176|ch,32,0],order:-8},{tick:0,data:[192|ch,piece.programs[role]],order:-7},{tick:0,data:[176|ch,7,role==='drums'?92:role==='bass'?88:100],order:-6},{tick:0,data:[176|ch,10,role==='guitar'?48:role==='keys'?80:64],order:-6},{tick:0,data:[176|ch,91,role==='bass'?8:22],order:-6},{tick:0,data:[176|ch,93,0],order:-6});}
  function note(n,start,ch){const on=Math.round((start+n.t)*480),off=Math.round((start+n.t+n.dur)*480);events.push({tick:on,data:[144|ch,n.midi,n.velocity],order:2},{tick:off,data:[128|ch,n.midi,0],order:-1});if(n.bend){events.push({tick:on,data:[176|ch,101,0],order:-3},{tick:on,data:[176|ch,100,0],order:-3},{tick:on,data:[176|ch,6,2],order:-3});for(let i=0;i<=16;i++){const bend=Math.round(8192+8191*i/16);events.push({tick:on+Math.round((off-on)*.55*i/16),data:[224|ch,bend&127,bend>>7],order:1});}events.push({tick:off,data:[224|ch,0,64],order:0});}}
  for(const section of piece.sections){const m=M.meter(section.time,section.groups);events.push({tick:Math.round(beat*480),data:MIDI.text(6,section.name),order:-10},{tick:Math.round(beat*480),data:MIDI.tempo(piece.tempo*m.q),order:-10},{tick:Math.round(beat*480),data:MIDI.meta(88,[m.n,Math.log2(m.d),m.compound?36:24,8]),order:-10});
    for(const b of section.bars){if(piece.style==='power')events.push({tick:Math.round(beat*480),data:[192|channel.guitar,(b.number-1)%2?30:28],order:-5});const sf=M.KEYS[b.key]??0;events.push({tick:Math.round(beat*480),data:MIDI.meta(89,[(sf+256)%256,b.key.endsWith('m')?1:0]),order:-10});
      for(const role of ['guitar','keys']){const sc={...b[role],time:b.time,swing:b.swing};for(const n of N.events(sc)){note({...n,velocity:Math.min(110,(n.voice===1?Math.round(b.dynamics[role]*.7):b.dynamics[role])+(n.accent?12:0))},beat,channel[role]);}}
      for(const n of N.events({notes:b.bass,time:b.time,swing:b.swing}))note({...n,velocity:76},beat,channel.bass);
      for(const n of b.drums)note(n,beat,channel.drums);
      beat+=m.len;
    }
  }
  return MIDI.encode(events,Math.round(beat*480));
}
const manifest=[];
for(const theme of themes){
  const piece=build(theme),dir=path.join('repertoire',gradeNames[piece.grade],piece.title);fs.mkdirSync(dir,{recursive:true});
  const bytes=midi(piece);fs.writeFileSync(path.join(dir,piece.title+'.mid'),bytes);
  fs.writeFileSync(path.join(dir,'score.json'),JSON.stringify(piece,null,2)+'\n');
  const {sections,...entry}=piece;const decoded=MIDI.decode(bytes);
  manifest.push({...entry,dir,midi:dir+'/'+piece.title+'.mid',score:dir+'/score.json',sha256:createHash('sha256').update(bytes).digest('hex'),duration:decoded.duration,sections:sections.map(s=>({name:s.name,startBar:s.startBar,bars:s.bars.length,time:s.time,startBeat:s.startBeat}))});
}
fs.writeFileSync('data/repertoire.json',JSON.stringify({channels:MIDI.channels,grades:gradeNames,pieces:manifest},null,2)+'\n');
console.log('Built',manifest.length,'shared quartet MIDI files');
