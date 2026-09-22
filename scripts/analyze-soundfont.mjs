import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {SoundBankLoader,SpessaSynthProcessor,SpessaLog} from 'spessasynth_core';
const dir=process.argv[2]||'test-results/soundfont-analysis';fs.mkdirSync(dir,{recursive:true});
const scope=vm.createContext({AM:{},TextEncoder,TextDecoder,Uint8Array});vm.runInContext(fs.readFileSync('js/midi.js','utf8'),scope);
const MIDI=scope.AM.midi,catalog=JSON.parse(fs.readFileSync('data/repertoire.json')),rate=48000,channels=[3,5,6,9];
SpessaLog.setLogLevel(false,false,false);
const file=fs.readFileSync(process.argv[3]||'assets/soundfont/FluidR3-a-minor.sf2'),bank=SoundBankLoader.fromArrayBuffer(file.buffer.slice(file.byteOffset,file.byteOffset+file.length)),rows=[];
const profile=process.argv[4]==='none'?null:JSON.parse(fs.readFileSync(process.argv[4]||'assets/soundfont/balance.json'));
for(const piece of catalog.pieces){
 const seq=MIDI.decode(fs.readFileSync(piece.midi)),raw=[];
 for(const label of ['A','B']){
  const marker=(seq.markers.find(m=>m.label===label)||seq.markers[1]),next=seq.markers[seq.markers.indexOf(marker)+1];
  const segment=MIDI.decode(MIDI.excerpt(seq,{from:marker.t,to:Math.min(marker.t+8,next?.t??seq.duration)}));
  const synth=new SpessaSynthProcessor(rate,{eventsEnabled:false});synth.soundBankManager.addSoundBank(bank,'fluid');await synth.processorInitialized;
  if(profile)synth.midiChannels[9].setSystemParameter('gain',10**(profile.drumBusDb/20));
  const size=Math.ceil(segment.duration*rate),audio=new Float32Array(size*10),outputs=Array.from({length:16},()=>[new Float32Array(128),new Float32Array(128)]),fx=[new Float32Array(128),new Float32Array(128)];const stems=[...channels.map(ch=>outputs[ch]),fx];let index=0;
  for(let at=0;at<size;at+=128){
   while(index<segment.events.length&&segment.events[index].t<=at/rate)synth.processMessage(segment.events[index++].data);
   for(const pair of [...outputs,fx])for(const a of pair)a.fill(0);
   const n=Math.min(128,size-at);synth.processSplit(outputs,...fx,0,n);
   for(let i=0;i<n;i++)for(const [part,pair]of stems.entries())for(let side=0;side<2;side++)audio[(at+i)*10+part*2+side]=pair[side][i];
  }
  raw.push(Buffer.from(audio.buffer));
 }
 const data=Buffer.concat(raw);fs.writeFileSync(path.join(dir,piece.id+'.f32'),data);
 const a=new Float32Array(data.buffer,data.byteOffset,data.byteLength/4),rms=[],peak=[];for(let role=0;role<5;role++){let sum=0,max=0;for(let i=role*2;i<a.length;i+=10)for(let side=0;side<2;side++){sum+=a[i+side]**2;max=Math.max(max,Math.abs(a[i+side]));}rms.push(10*Math.log10(sum/(a.length/5)));peak.push(20*Math.log10(max));}
 rows.push({id:piece.id,title:piece.title,programs:piece.programs,seconds:a.length/10/rate,rmsDb:rms,peakDb:peak});console.log(piece.title,rms.map(v=>v.toFixed(1)).join(' / '));
}
fs.writeFileSync(path.join(dir,'analysis.json'),JSON.stringify({rate,bankSha256:createHash('sha256').update(file).digest('hex'),profile,channels,roles:['keys','bass','guitar','drums','effects'],method:'First 8 seconds of A and B (second section if no B), original MIDI controllers and velocity, 48 kHz stereo, isolated dry buses and shared effects, before browser master gain/compressor.',pieces:rows},null,2)+'\n');
