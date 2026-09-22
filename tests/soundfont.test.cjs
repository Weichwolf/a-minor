const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{createHash}=require('node:crypto');
const manifest=JSON.parse(fs.readFileSync('assets/soundfont/manifest.json')),bytes=fs.readFileSync('assets/soundfont/'+manifest.file);
let core,bank;
const ready=(async()=>{core=await import('spessasynth_core');core.SpessaLog.setLogLevel(false,false,false);bank=core.SoundBankLoader.fromArrayBuffer(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length));})();
async function render({ch=3,program=0,note=60,velocity=80,off=1,seconds=4,changes=[]}={}){
 await ready;const rate=24000,synth=new core.SpessaSynthProcessor(rate,{eventsEnabled:false,effectsEnabled:false});synth.soundBankManager.addSoundBank(bank,'fluid');await synth.processorInitialized;
 synth.processMessage([192|ch,program]);synth.processMessage([176|ch,91,0]);synth.processMessage([176|ch,93,0]);
 const events=[{t:.1,fn:()=>note>=0&&synth.processMessage([144|ch,note,velocity])},{t:off+.1,fn:()=>note>=0&&synth.processMessage([128|ch,note,0])},...changes.map(c=>({t:c.t,fn:()=>c.data?synth.processMessage(c.data):synth.midiChannels[ch].setSystemParameter(c.param,c.value)}))].sort((a,b)=>a.t-b.t);
 const left=new Float32Array(rate*seconds),right=new Float32Array(left.length);let index=0;
 for(let p=0;p<left.length;p+=128){while(index<events.length&&events[index].t<=p/rate)events[index++].fn();synth.process(left,right,p,Math.min(128,left.length-p));}
 const rms=(a,b)=>{let sum=0;for(let i=Math.floor(a*rate);i<Math.floor(b*rate);i++)sum+=(left[i]**2+right[i]**2)/2;return Math.sqrt(sum/((b-a)*rate));};let peak=0,jump=0;for(let i=1;i<left.length;i++){peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));jump=Math.max(jump,Math.abs(left[i]-left[i-1]));assert(Number.isFinite(left[i]));}const frequency=()=>{const start=Math.round(.7*rate),size=Math.round(.15*rate);let best=-Infinity,period=0;for(let lag=70;lag<=130;lag++){let cross=0,a=0,b=0;for(let i=0;i<size;i++){const x=left[start+i],y=left[start+i+lag];cross+=x*y;a+=x*x;b+=y*y;}const value=cross/Math.sqrt(a*b);if(value>best){best=value;period=lag;}}return rate/period;};return {frequency:frequency(),before:rms(0,.09),attack:rms(.12,.3),held:rms(.5,.7),tail:rms(1.4,1.8),late:rms(3,3.5),peak,jump,rms};
}

test('FluidR3 selection is intact, MIT licensed, and contains every used melodic/drum preset',async()=>{
 await ready;assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);assert.equal(bytes.length,manifest.bytes);assert.match(fs.readFileSync('assets/soundfont/LICENSE.txt','utf8'),/Permission is hereby granted/);assert.equal(manifest.license,'MIT');
 for(const p of JSON.parse(fs.readFileSync('data/repertoire.json')).pieces)for(const [role,program]of Object.entries(p.programs))assert(bank.presets.some(p=>p.program===program&&p.isGMGSDrum===(role==='drums')));
 assert(bank.presets.some(p=>!p.isGMGSDrum&&p.program===28));assert.equal(bank.presets.length,11);
});

test('real SoundFont PCM: velocity, sustained sample loops, note-off release, bass and guitar envelopes',async()=>{
 const metrics={soft:await render({velocity:35}),loud:await render({velocity:100}),short:await render({off:.1}),held:await render({off:3}),bass:await render({ch:5,program:33,note:36,off:.3}),guitar:await render({ch:6,program:27,note:52,off:3}),guitarShort:await render({ch:6,program:27,note:52,off:.1})};
 for(const m of Object.values(metrics)){assert(m.before<1e-7);assert(m.attack>.0001);assert(m.peak<1);}
 assert(metrics.loud.attack>metrics.soft.attack*2,'velocity must change audible dynamics');assert(metrics.held.tail>.001);assert(metrics.short.tail<metrics.held.tail*.05,'piano release respects note-off');assert(metrics.guitar.tail>metrics.guitarShort.tail*10,'guitar sustain/release use the bank envelopes');assert(metrics.bass.late<.00001,'bass release reaches silence');
 fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/soundfont-envelopes.json',JSON.stringify(metrics,null,2)+'\n');
});

test('open hi-hat chokes, cymbals ring after note-off, and channel mute survives controller/program changes',async()=>{
 const closedOnly=await render({ch:9,note:-1,changes:[{t:.35,data:[153,42,80]}]}),open=await render({ch:9,note:46,off:.1}),closed=await render({ch:9,note:46,off:.1,changes:[{t:.35,data:[153,42,80]}]}),crash=await render({ch:9,note:49,off:.03}),muted=await render({ch:6,program:27,off:3,changes:[{t:.35,param:'isMuted',value:true},{t:.35,param:'gain',value:0},{t:.4,data:[182,121,0]},{t:.45,data:[198,30]},{t:.6,data:[150,67,100]}]});
 assert(open.rms(.6,.9)>.00001);assert(Math.abs(closed.rms(.6,.9)-closedOnly.rms(.6,.9))<1e-7,'after choke only the closed-hat tail remains');assert(crash.tail>.0001,'one-shot cymbal survives note-off');assert(muted.rms(.8,1)<1e-7,'mute survives reset controllers and program changes');
});

test('pitch wheel reaches the target interval and a loud chord leaves output headroom',async()=>{
 const straight=await render({ch:6,program:27,note:57,off:2}),bent=await render({ch:6,program:27,note:57,off:2,changes:[{t:.35,data:[230,127,127]}]}),chord=await render({velocity:110,off:3,changes:[64,67,71,74,77,81,84].map(n=>({t:.1,data:[147,n,110]}))});
 assert(Math.abs(bent.frequency/straight.frequency-2**(2/12))<.02,'two-semitone bend');assert(chord.peak<1,'loud polyphony does not clip before the output compressor');assert(chord.attack>straight.attack);
});

test('preset calibration matches measured original PCM, including the runtime drum boost',async()=>{
 const reference=JSON.parse(fs.readFileSync('tests/fixtures/fluidr3-levels.json')),balance=JSON.parse(fs.readFileSync('assets/soundfont/balance.json'));
 assert.deepEqual(manifest.balance,balance);
 for(const sample of reference.cases){const m=await render(sample),bus=sample.ch===9?balance.drumBusDb:0,expected=(sample.ch===9?balance.drumDb:balance.melodicDb)[sample.program];const actual=20*Math.log10(m.attack/sample.attackRms)+bus;assert(Math.abs(actual-expected)<.05,`preset ${sample.program}, channel ${sample.ch}: ${actual.toFixed(2)} dB != ${expected} dB`);}
});
