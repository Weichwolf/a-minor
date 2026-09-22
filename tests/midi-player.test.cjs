const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){let now=0;const sent=[],timers=new Map(),players=new Set();let serial=0;const ports=Object.fromEntries([3,5,6,9].map(ch=>[ch,{state:'connected',send:(data,t=now)=>sent.push({ch,data:[...data],t}),clear:()=>sent.push({ch,clear:true,t:now})}]));const AM={audio:{register:p=>players.add(p),unregister:p=>players.delete(p)}};vm.runInNewContext(fs.readFileSync('js/midi-player.js','utf8'),{AM,performance:{now:()=>now},setTimeout:fn=>{timers.set(++serial,fn);return serial;},clearTimeout:id=>timers.delete(id)});return {AM,ports,sent,players,advance(t){now=t;const entries=[...timers.values()];timers.clear();for(const fn of entries)fn();}};}
const sequence={duration:1,events:[{t:0,data:[182,121,0]},{t:0,data:[198,27]},{t:0,data:[150,60,90]},{t:.5,data:[134,60,0]},{t:.5,data:[153,42,60]},{t:.6,data:[137,42,0]}]};
test('external MIDI retains channel/program and quiet guide through reset controllers',()=>{
 const s=setup(),p=new s.AM.MIDIFilePlayer(sequence,{portFor:ch=>s.ports[ch],levels:{6:.25}});p.play();assert(s.sent.some(e=>e.ch===6&&e.data?.join()==='198,27'));assert(s.sent.filter(e=>e.data?.[0]===182&&e.data[1]===11).every(e=>e.data[2]===64));
 s.advance(150);p.setMix({6:0});s.advance(500);assert(s.sent.some(e=>e.data?.join()==='182,123,0'));assert(s.sent.some(e=>e.data?.join()==='134,60,0'));p.stop();assert.equal(s.players.size,0);assert(s.sent.some(e=>e.data?.join()==='233,0,64'));assert.equal(p.playing,false);
});
test('muted practice voice sends no note-ons; band notes retain their timing and routing',()=>{
 const s=setup(),p=new s.AM.MIDIFilePlayer(sequence,{portFor:ch=>s.ports[ch],levels:{6:0}});p.play();for(let t=25;t<=1100;t+=25)s.advance(t);assert(!s.sent.some(e=>e.data?.[0]===150));assert(s.sent.some(e=>e.ch===9&&e.t===600&&e.data?.[0]===153));assert(!p.playing);assert(!s.sent.some(e=>e.data?.[1]===120),'normal end preserves release tails');
});
test('loop skips count-in after first pass and stays on the original clock',()=>{
 const s=setup(),seq={duration:1,events:[{t:0,data:[153,37,60]},{t:.1,data:[137,37,0]},{t:.4,data:[150,60,90]},{t:.8,data:[134,60,0]}]},p=new s.AM.MIDIFilePlayer(seq,{loop:true,loopStart:.4,portFor:ch=>s.ports[ch]});p.play();for(let t=25;t<=2500;t+=25)s.advance(t);assert.equal(s.sent.filter(e=>e.data?.[0]===153).length,1);const on=s.sent.filter(e=>e.data?.[0]===150).map(e=>e.t);assert.equal(on.length,4);[500,1100,1700,2300].forEach((t,i)=>assert(Math.abs(t-on[i])<1e-8));p.stop();
});
test('disconnect and interrupted clocks stop all connected ports without a late burst',()=>{
 for(const disconnect of [false,true]){const s=setup();let error;const p=new s.AM.MIDIFilePlayer(sequence,{portFor:ch=>s.ports[ch],onEnd:e=>error=e});p.play();if(disconnect)s.ports[6].state='disconnected';s.advance(disconnect?25:2000);assert.equal(error.message,disconnect?'disconnected':'timingInterrupted');assert.equal(p.playing,false);assert(!s.sent.some(e=>e.data?.[0]===153));assert(s.sent.some(e=>e.ch===9&&e.data?.[1]===120));}
});
