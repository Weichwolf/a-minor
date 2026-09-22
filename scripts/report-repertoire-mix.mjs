import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {roles,baseVolume,measure} from './repertoire-mix.mjs';
const [beforeFile,afterFile]=process.argv.slice(2);if(!beforeFile||!afterFile)throw Error('Pass before and after analyses');
const before=JSON.parse(fs.readFileSync(beforeFile)),after=JSON.parse(fs.readFileSync(afterFile)),mix=JSON.parse(fs.readFileSync('scripts/repertoire-mix.json')),catalog=JSON.parse(fs.readFileSync('data/repertoire.json'));
if(before.bankSha256!==after.bankSha256||after.bankSha256!==mix.bankSha256)throw Error('SoundFont mismatch');
const scope=vm.createContext({AM:{},TextEncoder,TextDecoder,Uint8Array});vm.runInContext(fs.readFileSync('js/midi.js','utf8'),scope);const MIDI=scope.AM.midi;
const hash=b=>createHash('sha256').update(b).digest('hex'),db=power=>10*Math.log10(Math.max(1e-16,power)),average=windows=>roles.map((_,r)=>db(windows.reduce((n,w)=>n+10**(w.db[r]/10),0)/windows.length));
const pieces=after.pieces.map(p=>{
 const original=before.pieces.find(o=>o.id===p.id),entry=catalog.pieces.find(e=>e.id===p.id),score=JSON.parse(fs.readFileSync(entry.score)),bytes=fs.readFileSync(entry.midi),seq=MIDI.decode(bytes),balance=mix.pieces[p.id];
 if(hash(bytes)!==p.midiSha256)throw Error('Stale verification '+p.id);
 const levels=measure(score,p,seq,MIDI.channels),groups=Object.fromEntries(Object.entries(levels).map(([key,m])=>{
  const reference=balance.measurement[key],volume=balance.volumes[key],expected=reference.levelDb+40*Math.log10(volume/baseVolume[key.split('/')[0]]);
  return [key,{beforeDb:reference.levelDb,afterDb:m.levelDb,targetDb:reference.targetDb+balance.offsetDb,expectedDb:expected,errorDb:m.levelDb-expected,volume,windows:m.windows}];
 }));
 const sections=p.sections.map((s,i)=>({name:s.name,start:s.start,end:s.end,beforeDb:average(original.windows.filter(w=>w.section===i&&w.t<s.end)),afterDb:average(p.windows.filter(w=>w.section===i&&w.t<s.end))}));
 return {id:p.id,title:p.title,midiSha256:p.midiSha256,duration:p.duration,renderedSeconds:p.windows.length*after.windowSeconds,peakBeforeDb:original.peakDb,peakAfterDb:p.peakDb,groups,sections};
});
const report={bankSha256:after.bankSha256,profile:after.profile,rate:after.rate,method:after.method,roles,pieces};
fs.writeFileSync('docs/audio/repertoire-mix.json',JSON.stringify(report,null,2)+'\n');
for(const p of pieces)console.log(p.id,'peak',p.peakAfterDb.toFixed(1),'max calibration error',Math.max(...Object.values(p.groups).map(g=>Math.abs(g.errorDb))).toFixed(2));
