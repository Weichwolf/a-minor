// Offline stem render for inspecting a practice MIDI with the browser SoundFont.
// Usage: node scripts/analyze-practice-audio.mjs input.mid output-directory
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {SoundBankLoader,SpessaSynthProcessor,SpessaLog} from 'spessasynth_core';
const [input,dir]=process.argv.slice(2);if(!input||!dir)throw Error('Pass a MIDI file and output directory');
fs.mkdirSync(dir,{recursive:true});SpessaLog.setLogLevel(false,false,false);
const scope=vm.createContext({AM:{},TextEncoder,TextDecoder,Uint8Array});vm.runInContext(fs.readFileSync('js/midi.js','utf8'),scope);
const seq=scope.AM.midi.decode(fs.readFileSync(input)),rate=48000,channels=[3,5,6,9];
const file=fs.readFileSync('assets/soundfont/FluidR3-a-minor.sf2'),bank=SoundBankLoader.fromArrayBuffer(file.buffer.slice(file.byteOffset,file.byteOffset+file.length));
const synth=new SpessaSynthProcessor(rate,{eventsEnabled:false});synth.soundBankManager.addSoundBank(bank,'fluid');await synth.processorInitialized;
const balance=JSON.parse(fs.readFileSync('assets/soundfont/balance.json'));synth.midiChannels[9].setSystemParameter('gain',10**(balance.drumBusDb/20));
const size=Math.ceil((seq.duration+3)*rate),outputs=Array.from({length:16},()=>[new Float32Array(128),new Float32Array(128)]),fx=[new Float32Array(128),new Float32Array(128)],stems=[...channels.map(ch=>outputs[ch]),fx],block=new Float32Array(128*10),fd=fs.openSync(path.join(dir,'stems.f32'),'w');let index=0;
try{for(let at=0;at<size;at+=128){
 while(index<seq.events.length&&seq.events[index].t<=at/rate)synth.processMessage(seq.events[index++].data);
 for(const pair of [...outputs,fx])for(const a of pair)a.fill(0);
 const n=Math.min(128,size-at);synth.processSplit(outputs,...fx,0,n);
 for(let i=0;i<n;i++)for(const [part,pair]of stems.entries())for(let side=0;side<2;side++)block[i*10+part*2+side]=pair[side][i];
 fs.writeSync(fd,Buffer.from(block.buffer,0,n*10*4));
}}finally{fs.closeSync(fd);}
fs.writeFileSync(path.join(dir,'analysis.json'),JSON.stringify({input,rate,seconds:size/rate,roles:['keys','bass','guitar','drums','effects'],markers:seq.markers,method:'Complete MIDI plus 3-second release; 48 kHz stereo, four dry stems and shared effects, before browser master/compressor; MIDI scheduling in 128-sample blocks.'},null,2)+'\n');console.log(dir,size/rate);
