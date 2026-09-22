import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {SoundBankLoader,SpessaSynthProcessor,SpessaLog} from 'spessasynth_core';
const target=process.argv[2];if(!target)throw Error('Pass an output JSON path');
const scope=vm.createContext({AM:{},TextEncoder,TextDecoder,Uint8Array});vm.runInContext(fs.readFileSync('js/midi.js','utf8'),scope);
const MIDI=scope.AM.midi,rate=48000,roles=['keys','bass','guitar','drums'],channels=roles.map(r=>MIDI.channels[r]);
const catalog=JSON.parse(fs.readFileSync('data/repertoire.json')),profile=JSON.parse(fs.readFileSync('assets/soundfont/balance.json'));
const file=fs.readFileSync('assets/soundfont/FluidR3-a-minor.sf2'),hash=b=>createHash('sha256').update(b).digest('hex');
SpessaLog.setLogLevel(false,false,false);
const bank=SoundBankLoader.fromArrayBuffer(file.buffer.slice(file.byteOffset,file.byteOffset+file.length)),pieces=[];
const db=x=>10*Math.log10(Math.max(1e-16,x));
for(const piece of catalog.pieces){
 const bytes=fs.readFileSync(piece.midi),seq=MIDI.decode(bytes),score=JSON.parse(fs.readFileSync(piece.score));
 const synth=new SpessaSynthProcessor(rate,{eventsEnabled:false});synth.soundBankManager.addSoundBank(bank,'fluid');await synth.processorInitialized;
 synth.midiChannels[9].setSystemParameter('gain',10**(profile.drumBusDb/20));
 const outputs=Array.from({length:16},()=>[new Float32Array(128),new Float32Array(128)]),fx=[new Float32Array(128),new Float32Array(128)],stems=channels.map(ch=>outputs[ch]),all=[...outputs,fx];
 const windows=[],programs={...piece.programs};let event=0,section=0,peak=0;
 for(let at=0;at<Math.ceil((seq.duration+3)*rate);){
  const start=at,sums=roles.map(()=>0),peaks=roles.map(()=>0),end=Math.min(at+4800,Math.ceil((seq.duration+3)*rate));
  while(at<end){
   while(event<seq.events.length&&seq.events[event].t<=at/rate){const data=seq.events[event++].data;synth.processMessage(data);if(data[0]>>4===12){const role=roles[channels.indexOf(data[0]&15)];if(role)programs[role]=data[1];}}
   for(const pair of all)for(const a of pair)a.fill(0);
   const n=Math.min(128,end-at);synth.processSplit(outputs,...fx,0,n);
   for(let i=0;i<n;i++)for(let side=0;side<2;side++){
    let sum=fx[side][i];for(let r=0;r<roles.length;r++){const v=stems[r][side][i];sums[r]+=v*v;peaks[r]=Math.max(peaks[r],Math.abs(v));sum+=v;}
    peak=Math.max(peak,Math.abs(sum)*.6);
   }
   at+=n;
  }
  while(section+1<seq.markers.length&&seq.markers[section+1].t<=start/rate)section++;
  windows.push({t:start/rate,section,programs:{...programs},db:sums.map(s=>db(s/((at-start)*2))),peak:peaks.map(p=>db(p*p))});
 }
 const sections=score.sections.map((s,i)=>({name:s.name,start:seq.markers[i].t,end:seq.markers[i+1]?.t??seq.duration}));
 pieces.push({id:piece.id,title:piece.title,midiSha256:hash(bytes),duration:seq.duration,peakDb:db(peak*peak),sections,windows});
 console.log(piece.id,piece.title,'peak',db(peak*peak).toFixed(1));
}
fs.mkdirSync(new URL('../docs/audio/',import.meta.url),{recursive:true});
fs.writeFileSync(target,JSON.stringify({rate,windowSeconds:.1,roles,bankSha256:hash(file),profile,method:'Complete continuous quartet render plus 3 s release; 100 ms stereo dry-stem RMS windows, shared effects included in sample peak at browser master 0.6, before compressor.',pieces})+'\n');
