import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {groups,baseVolume} from './repertoire-mix.mjs';
const scope=vm.createContext({console,TextEncoder,TextDecoder,Uint8Array,DataView});scope.window=scope;
for(const f of ['music','notation','midi'])vm.runInContext(fs.readFileSync(`js/${f}.js`,'utf8'),scope);
const {music:M,notation:N,midi:MIDI}=scope.AM;
const unmixed=process.argv.includes('--unmixed');
const mix=unmixed?null:JSON.parse(fs.readFileSync('scripts/repertoire-mix.json'));
if(mix&&mix.bankSha256!==createHash('sha256').update(fs.readFileSync('assets/soundfont/FluidR3-a-minor.sf2')).digest('hex'))throw Error('Recalibrate repertoire mix after a SoundFont change');
const themes=JSON.parse(fs.readFileSync('scripts/repertoire-themes.json'));
const gradeNames=['00 Debut Grade','01 Grade One','02 Grade Two','03 Grade Three','04 Grade Four','05 Grade Five'];
const barLength=notes=>notes.reduce((n,v)=>n+N.dur(v.d),0);
const rest=len=>len===3?[{r:1,d:'h.'}]:len===3.5?[{r:1,d:'h.'},{r:1,d:'e'}]:len===6?[{r:1,d:'h.'},{r:1,d:'h.'}]:[{r:1,d:'w'}];
function read(text) {return text.trim().split(/\s+/).map(token=>{const [p,raw]=token.split(':'),d=raw.replace(/[~!*]/g,'');N.dur(d);return {...(p==='-'?{r:1}:{p:p.includes('+')?p.split('+'):p}),d,...(raw.includes('~')?{tie:1}:{}),...(raw.includes('!')?{accent:1}:{}),...(raw.includes('*')?{staccato:1}:{})};});}
function assignStrings(voices,maxFret,label) {
  const items=[];voices.forEach((notes,voice)=>{let t=0;notes.forEach((n,ni)=>{const end=t+N.ticks(n.d);if(!n.r)[].concat(n.p).forEach((p,pi)=>items.push({n,pi,midi:M.midi(p),t,end,voice,ni}));t=end;});});
  items.sort((a,b)=>a.t-b.t||a.midi-b.midi);
  let attempts=0;
  function solve(i,active) {
    if(i===items.length)return true;if(++attempts>200000)throw Error('Position search exhausted '+label);
    const e=items[i],other=active.filter(x=>x.end>e.t),previous=items.slice(0,i).reverse().find(x=>x.voice===e.voice&&x.pi===e.pi&&x.ni===e.ni-1);
    const positions=M.TUNING.map((p,s)=>({s,f:e.midi-M.midi(p)})).filter(p=>p.f>=0&&p.f<=maxFret&&!other.some(x=>x.s===p.s)&&(!previous?.n.tie||previous.s===p.s)).sort((a,b)=>a.f-b.f);
    for(const pos of positions){if(other.some(x=>x.n===e.n&&Math.abs(x.s-pos.s)!==1))continue;const frets=[...other.map(x=>x.f),pos.f].filter(f=>f>0);if(Math.max(...frets)-Math.min(...frets)>4)continue;e.s=pos.s;e.f=pos.f;if(solve(i+1,[...other,{...e,...pos}]))return true;}
    return false;
  }
  if(!solve(0,[]))throw Error('Unplayable guitar '+label+' '+JSON.stringify(voices));
  for(const e of items)if(Array.isArray(e.n.p)){e.n.s||=[];e.n.s[e.pi]=e.s;}else e.n.s=e.s;
}
function build(song) {
  const sections=[],maxFret=[5,5,7,9,12,12][song.grade];let startBeat=0,barNumber=1;
  const names={V:'A′',I:'Intro',C:'Coda',S:'Solo',G:'Guitar solo',K:'Keyboard solo'};
  for(const token of song.form.split(' ')){
    const name=token[0],count=Number(token.slice(1)),part=song.parts[name];
    if(!part||!Number.isInteger(count)||count<1)throw Error('Invalid section '+song.id+' '+token);
    const time=part.time,len=M.meter(time).len,section={name:names[name]||name,startBar:barNumber,time,...(time==='7/8'?{groups:[2,2,3]}:{}),bars:[],startBeat};
    for(let i=0;i<count;i++,barNumber++){
      for(const field of ['harmony','guitar','keys','left','bass','drums','guitarVelocity','keysVelocity','bassVelocity'])if(part[field]?.length<count)throw Error('Incomplete written part '+song.id+' '+token+' '+field);
      const guitar=read(part.guitar[i]),right=read(part.keys[i]),left=read(part.left[i]),bass=read(part.bass[i]),guitarBass=rest(len);
      if(song.style==='legato'&&!['B','K'].includes(name))for(let n=0;n<guitar.length-1;n++)if(!guitar[n].r&&guitar[n].d==='e'&&!guitar[n+1].r&&Math.abs(M.midi(guitar[n].p)-M.midi(guitar[n+1].p))<=2){guitar[n].slur=1;guitar[++n].slurEnd=1;}
      if(song.id==='r5-2'&&name==='S'&&i===0)guitar[0].bend=2;
      for(const voice of [guitar,right,left,bass])if(Math.abs(barLength(voice)-len)>1e-8)throw Error('Incomplete bar '+song.id+' '+token+' '+i);
      assignStrings([guitar,guitarBass],maxFret,song.title+' '+token+' '+i);
      const dynamics={guitar:part.guitarVelocity[i],keys:part.keysVelocity[i],bass:part.bassVelocity[i]};
      if(Object.values(dynamics).some(v=>!Number.isInteger(v)||v<1||v>110))throw Error('Invalid dynamics '+song.id);
      const drums=part.drums[i].map(hit=>{if(hit.t<0||hit.t>=len||!Number.isInteger(hit.midi)||hit.midi<0||hit.midi>127||!Number.isInteger(hit.velocity)||hit.velocity<1||hit.velocity>127||hit.dur<=0)throw Error('Invalid drum event '+song.id);return {...hit,dur:Math.min(hit.dur,len-hit.t)};});
      const bar={number:barNumber,time,key:song.style==='lydian'&&name==='B'?'G':song.key,chord:part.harmony[i],dynamics,...(part.keysLead?{keysLead:part.keysLead}:{}),guitar:{notes:guitar,bass:guitarBass},keys:{notes:right,bass:left},bass,drums};
      if(song.style==='shuffle')bar.swing=true;
      section.bars.push(bar);startBeat+=len;
    }
    sections.push(section);
  }
  const prerequisites=[['p0','k0'],['p1','p2','k1','k2'],['p3','k3'],['p4','p5','k4','k5'],['p6','p7','k6','k7'],['p8','k8']][song.grade];
  return {id:song.id,title:song.title,grade:song.grade,key:song.key,tempo:song.tempo,time:song.time,style:song.style,maxFret,programs:song.programs,prerequisites,description:song.description,sections,bars:barNumber-1};
}
function midi(piece) {
  const events=[{tick:0,data:MIDI.text(3,piece.title),order:-10}],channel=MIDI.channels,partGroups=groups(piece),balance=mix?.pieces[piece.id];let beat=0;
  if(mix&&balance?.scoreSha256!==createHash('sha256').update(JSON.stringify(piece,null,2)+'\n').digest('hex'))throw Error('Recalibrate changed arrangement: '+piece.id);
  for(const [role,ch]of Object.entries(channel)){events.push({tick:0,data:[176|ch,121,0],order:-9},{tick:0,data:[176|ch,0,0],order:-8},{tick:0,data:[176|ch,32,0],order:-8},{tick:0,data:[192|ch,piece.programs[role]],order:-7},{tick:0,data:[176|ch,7,baseVolume[role]],order:-6},{tick:0,data:[176|ch,10,role==='guitar'?48:role==='keys'?80:64],order:-6},{tick:0,data:[176|ch,91,role==='bass'?8:22],order:-6},{tick:0,data:[176|ch,93,0],order:-6});}
  function note(n,start,ch){const on=Math.round((start+n.t)*480),off=Math.round((start+n.t+n.dur)*480);events.push({tick:on,data:[144|ch,n.midi,n.velocity],order:2},{tick:off,data:[128|ch,n.midi,0],order:-1});if(n.bend){events.push({tick:on,data:[176|ch,101,0],order:-3},{tick:on,data:[176|ch,100,0],order:-3},{tick:on,data:[176|ch,6,2],order:-3});for(let i=0;i<=16;i++){const bend=Math.round(8192+8191*i/16);events.push({tick:on+Math.round((off-on)*.55*i/16),data:[224|ch,bend&127,bend>>7],order:1});}events.push({tick:off,data:[224|ch,0,64],order:0});}}
  for(const section of piece.sections){const m=M.meter(section.time,section.groups);events.push({tick:Math.round(beat*480),data:MIDI.text(6,section.name),order:-10},{tick:Math.round(beat*480),data:MIDI.tempo(piece.tempo*m.q),order:-10},{tick:Math.round(beat*480),data:MIDI.meta(88,[m.n,Math.log2(m.d),m.compound?36:24,8]),order:-10});
    for(const b of section.bars){if(balance)for(const [role,ch]of Object.entries(channel)){const volume=balance.volumes[partGroups[b.number-1].groups[role]];if(!Number.isInteger(volume)||volume<1||volume>127)throw Error('Missing mix '+piece.id+' '+role);events.push({tick:Math.round(beat*480),data:[176|ch,7,volume],order:-4});}if(piece.style==='power')events.push({tick:Math.round(beat*480),data:[192|channel.guitar,(b.number-1)%2?30:28],order:-5});const sf=M.KEYS[b.key]??0;events.push({tick:Math.round(beat*480),data:MIDI.meta(89,[(sf+256)%256,b.key.endsWith('m')?1:0]),order:-10});
      for(const role of ['guitar','keys']){const sc={...b[role],time:b.time,swing:b.swing};for(const n of N.events(sc)){note({...n,velocity:Math.min(110,((role==='keys'&&b.keysLead==='left'?n.voice!==1:n.voice===1)?Math.round(b.dynamics[role]*.7):b.dynamics[role])+(n.accent?12:0))},beat,channel[role]);}}
      for(const n of N.events({notes:b.bass,time:b.time,swing:b.swing}))note({...n,velocity:Math.min(110,b.dynamics.bass+(n.accent?8:0))},beat,channel.bass);
      for(const n of b.drums)note(n,beat,channel.drums);
      beat+=m.len;
    }
  }
  return MIDI.encode(events,Math.round(beat*480));
}
const manifest=[];
const built=themes.map(theme=>{const piece=build(theme);return {piece,bytes:midi(piece)};});
for(const {piece,bytes} of built){
  const dir=path.join('repertoire',gradeNames[piece.grade],piece.title);fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,piece.title+'.mid'),bytes);
  fs.writeFileSync(path.join(dir,'score.json'),JSON.stringify(piece,null,2)+'\n');
  const {sections,...entry}=piece;const decoded=MIDI.decode(bytes);
  manifest.push({...entry,dir,midi:dir+'/'+piece.title+'.mid',score:dir+'/score.json',sha256:createHash('sha256').update(bytes).digest('hex'),duration:decoded.duration,sections:sections.map(s=>({name:s.name,startBar:s.startBar,bars:s.bars.length,time:s.time,startBeat:s.startBeat}))});
}
fs.writeFileSync('data/repertoire.json',JSON.stringify({channels:MIDI.channels,grades:gradeNames,pieces:manifest},null,2)+'\n');
console.log('Built',manifest.length,'shared quartet MIDI files');
