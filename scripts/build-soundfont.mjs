import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {BasicSoundBank,SoundBankLoader,SpessaLog,GeneratorTypes} from 'spessasynth_core';

const source = process.argv[2];
if (!source) throw Error('Pass the original FluidR3_GM.sf2 path');
SpessaLog.setLogLevel(false,false,false);
const original = fs.readFileSync(source), bank = SoundBankLoader.fromArrayBuffer(original.buffer.slice(original.byteOffset,original.byteOffset + original.byteLength));
const programs = [0,4,25,26,27,28,29,30,33];
const selected = bank.presets.filter(p => p.isGMGSDrum ? [0,16].includes(p.program) : p.bankMSB === 0 && p.bankLSB === 0 && programs.includes(p.program));
if (selected.length !== programs.length + 2) throw Error('Missing or ambiguous FluidR3 presets: ' + JSON.stringify(selected.map(p => [p.name,p.program,p.bankMSB,p.isGMGSDrum])));
const balance=JSON.parse(fs.readFileSync('assets/soundfont/balance.json'));
for(const preset of selected){
  const db=preset.isGMGSDrum?balance.drumDb[preset.program]-balance.drumBusDb:balance.melodicDb[preset.program];
  if(!Number.isFinite(db)||db>0)throw Error('Invalid preset attenuation');
  if(db===0)continue;
  // SpessaSynth scales SF2 attenuation by 0.4: 25 stored centibels give 1 dB.
  const type=GeneratorTypes.initialAttenuation,offset=Math.round(-db*25);
  for(const zone of preset.zones)zone.setGenerator(type,zone.getGenerator(type,preset.globalZone.getGenerator(type,0))+offset);
}
const subset = new BasicSoundBank();
subset.soundBankInfo = {...bank.soundBankInfo};
subset.addCompletePresets(selected);
const output = Buffer.from(subset.writeSF2({software:'a-minor / SpessaSynth 4.3.22'}));
const dir = 'assets/soundfont';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'FluidR3-a-minor.sf2'),output);
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({name:'FluidR3 GM — a-minor selection',license:'MIT',source:'https://deb.debian.org/debian/pool/main/f/fluid-soundfont/fluid-soundfont-gm_3.1-5.3_all.deb',sourceSha256:hash(original),file:'FluidR3-a-minor.sf2',sha256:hash(output),bytes:output.length,presets:selected.map(p => ({name:p.name,program:p.program,bankMSB:p.bankMSB,bankLSB:p.bankLSB,drums:p.isGMGSDrum})),balance,adaptation:'Selected complete presets; original samples, envelopes, modulators and loop points retained without resampling or lossy compression. Preset initial attenuation calibrated using balance.json; browser drum bus supplies the documented common boost.'},null,2)+'\n');
console.log(JSON.stringify({bytes:output.length,presets:selected.map(p => [p.name,p.program,p.isGMGSDrum])}));
