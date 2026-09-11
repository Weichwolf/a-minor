const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {createHash} = require('node:crypto');
const manifest = JSON.parse(fs.readFileSync('assets/piano/manifest.json'));
const code = fs.readFileSync('js/sample-piano.js','utf8');
function setup(fetcher = async () => { throw Error('Unexpected fetch'); }) {
  const timers = new Map(); let next = 0;
  const scope = vm.createContext({AM:{},fetch:fetcher,AbortController,console,setTimeout:(fn,delay) => {timers.set(++next,{fn,delay});return next;},clearTimeout:id=>timers.delete(id)});
  vm.runInContext(code,scope);
  const param = () => Object.fromEntries(['setValueAtTime','linearRampToValueAtTime','exponentialRampToValueAtTime','setTargetAtTime','cancelScheduledValues'].map(k => [k,function(...args){this.events.push([k,...args]);}]).concat([['events',[]],['value',0]]));
  const node = () => ({connect(to){return to;},disconnect(){this.disconnected=true;}}), sources = [], gains = [];
  const context = {currentTime:0,sampleRate:48000,destination:{},createDynamicsCompressor:()=>Object.assign(node(),Object.fromEntries(['threshold','knee','ratio','attack','release'].map(k=>[k,param()]))),createBufferSource:()=>{const n={...node(),playbackRate:param(),detune:param(),start(t){this.started=t;},stop(t){this.stopped=t;}};sources.push(n);return n;},createGain:()=>{const n={...node(),gain:param()};gains.push(n);return n;},createBiquadFilter:()=>({...node(),frequency:param(),Q:param()}),decodeAudioData:async()=>({length:48000,numberOfChannels:2})};
  return {piano:new scope.AM.SamplePiano(context),context,sources,gains,timers};
}
const note = (midi=60,velocity=78,t=0,dur=1) => ({midi,velocity,t,dur});

test('bundled piano samples are attributed, intact and cover C2–C6 within one semitone', () => {
  assert.equal(manifest.license,'CC-BY-3.0'); assert.equal(manifest.samples.length,17 * 3);
  assert.match(fs.readFileSync('assets/piano/credits.html','utf8'),/Alexander Holm/);
  for (const s of manifest.samples) assert.equal(createHash('sha256').update(fs.readFileSync('assets/piano/'+s.file)).digest('hex'),s.sha256,s.file);
  const {piano} = setup();
  for(let midi=36;midi<=84;midi++) for(let velocity=1;velocity<=127;velocity++) {
    const s=piano.select(manifest.samples,note(midi,velocity)); assert(Math.abs(s.midi-midi)<=1);
  }
  assert.equal(piano.select(manifest.samples,note(60,40)).layer,4);
  assert.equal(piano.select(manifest.samples,note(60,60)).layer,8);
  assert.equal(piano.select(manifest.samples,note(60,96)).layer,12);
  for(const n of [note(35),note(85),note(60,0),note(60,128),note(60,78,-1),note(60,78,0,0)]) assert.throws(()=>piano.select(manifest.samples,n));
});

test('piano preserves recorded decay, retunes samples and applies exponential damper release', () => {
  const {piano,sources,gains} = setup(), n={...note(61),bend:2}; n.sample=piano.select(manifest.samples,n);
  piano.note(n,{},.1);
  const source=sources[0], events=gains[0].gain.events;
  assert.equal(source.playbackRate.value,2 ** ((61-n.sample.midi+n.sample.tune/100)/12));
  assert.deepEqual(source.detune.events,[['setValueAtTime',0,.1],['linearRampToValueAtTime',200,.65]]);
  assert(events.some(e=>e[0]==='linearRampToValueAtTime'&&Math.abs(e[2]-.102)<1e-12),'short ramp preserves recorded attack');
  const release=events.find(e=>e[0]==='setTargetAtTime'); assert.equal(release[2],1.1);
  assert(Math.abs(Math.exp(-piano.release(n)/release[3])-.001)<1e-12,'release reaches −60 dB');
  assert(piano.release(note(36))>piano.release(note(84)),'bass damping is slower');
  assert(piano.release(note(60,78,0,.05))<piano.release(note(60,78,0,1)),'short articulations damp faster');
  assert(source.stopped>1.1+piano.release(n),'source survives complete release');
});

test('stop holds the current release level, fades sounding notes and silences future notes', () => {
  const {piano,context,sources,gains} = setup();
  const n={...note(),sample:manifest.samples.find(s=>s.midi===60&&s.layer===8)};
  piano.note(n,{},.1); piano.note(n,{},4); context.currentTime=1.15; piano.stop();
  const held=gains[0].gain.events.at(-2)[1]; assert(held>0&&held<.65*(78/60)**1.3);
  assert.equal(gains[1].gain.events.at(-2)[1],0);
  assert(gains.every(g=>g.gain.events.at(-1)[0]==='linearRampToValueAtTime'&&g.gain.events.at(-1)[1]===0));
  assert(sources.every(s=>Math.abs(s.stopped-1.185)<1e-12));
  sources.forEach(s=>s.onended()); assert(sources.every(s=>s.disconnected));
});

test('loading deduplicates requests, retries failures and keeps prepared buffers usable after eviction', async () => {
  let requests=0, fail=true;
  const {piano,context,sources}=setup(async url=>{
    if(url.endsWith('manifest.json'))return {ok:true,json:async()=>manifest};
    requests++;if(fail)throw Error('offline');return {ok:true,arrayBuffer:async()=>new ArrayBuffer(4)};
  });
  await assert.rejects(piano.prepare([note()])); fail=false;
  const start=await piano.prepare([note(),note()]); assert.equal(requests,2);
  await piano.prepare([note()]); assert.equal(requests,2);
  piano.cache.clear(); piano.bytes=0; start(1,()=>{}); assert.equal(sources.length,2,'prepared exercise retains buffers'); piano.stop();
  context.decodeAudioData=async()=>({length:13*1024*1024,numberOfChannels:2});
  await piano.prepare([note(63)]); assert(piano.bytes<=96*1024*1024);
});

test('lookahead schedules only imminent notes and delayed clocks stop without an attack burst', async () => {
  const {piano,context,sources,timers}=setup(async url=>({ok:true,json:async()=>manifest,arrayBuffer:async()=>new ArrayBuffer(4)}));
  const start=await piano.prepare([note(),note(64,78,10)]); let error;
  start(11,e=>{error=e;}); assert.equal(sources.length,1);
  context.currentTime=11;
  [...timers.values()].find(t=>t.delay===25).fn();
  assert.equal(error.message,'previewInterrupted'); assert.equal(sources.length,1);
  assert.equal(timers.size,0);
});

test('preview loops on form length including rests without adding release tails or clock drift', async () => {
  const {piano,context,sources,timers}=setup(async()=>({ok:true,json:async()=>manifest,arrayBuffer:async()=>new ArrayBuffer(4)}));
  const start=await piano.prepare([note(60,78,.2,.2),note(64,78,.8,.2)]);
  let ended=false;start(1.2,()=>{ended=true;});
  const advance=t=>{context.currentTime=t;const [id,task]=[...timers].find(([,v])=>v.delay===25);timers.delete(id);task.fn();};
  for(let i=1;i<=150;i++)advance(i*.025);
  assert.equal(sources.length,7);
  [.26,.86,1.46,2.06,2.66,3.26,3.86].forEach((t,i)=>assert(Math.abs(sources[i].started-t)<1e-12));
  assert.equal(ended,false);
  piano.stop();assert.equal(timers.size,0);
});

test('silent previews remain stoppable and invalid loop durations are rejected', async () => {
  const {piano,timers}=setup(async()=>({ok:true,json:async()=>manifest}));
  const start=await piano.prepare([]);let ended=false;start(2,()=>{ended=true;});
  assert.equal(ended,false);assert.equal(timers.size,1);piano.stop();assert.equal(timers.size,0);
  for(const duration of [0,-1,Infinity,NaN])assert.throws(()=>start(duration,()=>{}));
});
