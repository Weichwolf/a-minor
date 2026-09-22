import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {roles,baseVolume,groups,measure} from './repertoire-mix.mjs';
const source=process.argv[2],target=process.argv[3];if(!source||!target)throw Error('Pass analysis JSON and output mix JSON');
const analysis=JSON.parse(fs.readFileSync(source)),catalog=JSON.parse(fs.readFileSync('data/repertoire.json'));
if(analysis.pieces.length!==catalog.pieces.length||new Set(analysis.pieces.map(p=>p.id)).size!==catalog.pieces.length)throw Error('Calibration requires every piece exactly once');
const scope=vm.createContext({AM:{},TextEncoder,TextDecoder,Uint8Array});vm.runInContext(fs.readFileSync('js/midi.js','utf8'),scope);const MIDI=scope.AM.midi;
const targets={keys:{lead:-29,backing:-33},guitar:{lead:-28,riff:-29,backing:-31},bass:{band:-29},drums:{band:-31}};
const hash=b=>createHash('sha256').update(b).digest('hex'),pieces={};
for(const measured of analysis.pieces){
 const entry=catalog.pieces.find(p=>p.id===measured.id),bytes=fs.readFileSync(entry.score),score=JSON.parse(bytes),bars=groups(score),seq=MIDI.decode(fs.readFileSync(entry.midi));
 if(hash(fs.readFileSync(entry.midi))!==measured.midiSha256)throw Error('Stale MIDI analysis: '+entry.id);
 for(const e of seq.events)if(e.data[0]>>4===11&&e.data[1]===7){const role=roles.find(r=>MIDI.channels[r]===(e.data[0]&15));if(e.data[2]!==baseVolume[role])throw Error('Analyze an --unmixed build before calibration');}
 const calibration=measure(score,measured,seq,MIDI.channels);
 for(const [key,m] of Object.entries(calibration)){const [role,,voice]=key.split('/');m.targetDb=targets[role][voice];}
 // A shared offset fits all role targets into MIDI's finite volume range.
 const offset=Math.min(0,...Object.entries(calibration).map(([key,m])=>40*Math.log10(127/baseVolume[key.split('/')[0]])-(m.targetDb-m.levelDb)));
 const volumes={};for(const [key,m] of Object.entries(calibration)){const role=key.split('/')[0];volumes[key]=Math.max(1,Math.min(127,Math.round(baseVolume[role]*10**((m.targetDb+offset-m.levelDb)/40))));}
 for(const b of bars)for(const key of Object.values(b.groups))if(!volumes[key])throw Error('Unmeasured part '+entry.id+' '+key);
 pieces[entry.id]={scoreSha256:hash(bytes),offsetDb:offset,volumes,measurement:calibration};
 console.log(entry.id,'offset',offset.toFixed(1),JSON.stringify(volumes));
}
fs.writeFileSync(target,JSON.stringify({version:1,bankSha256:analysis.bankSha256,method:'Drums: full-duration stereo RMS including rests. Melodic parts: 80th percentile of 100 ms stereo RMS windows overlapping MIDI notes by at least 40 ms; gate 24 dB below group maximum; intro and final bar excluded from calibration, included in verification. One volume per instrument/program/role per piece; common offset preserves target relationships within CC7 range.',targets,pieces},null,2)+'\n');
