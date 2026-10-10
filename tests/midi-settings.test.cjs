const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const key='a-minor-midi';
function setup(memory=new Map(),devices=['band','drums']){
 const outputs=new Map(devices.map(id=>[id,{id,name:id,manufacturer:'test',state:'connected',send(){},clear(){}}]));
 const access={outputs},scope=vm.createContext({navigator:{requestMIDIAccess:async()=>access},localStorage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)},AM:{midi:{channels:{keys:3,bass:5,guitar:6,drums:9}}},performance:{now:()=>0},setTimeout,clearTimeout});
 vm.runInContext(fs.readFileSync('js/audio.js','utf8'),scope);return {audio:scope.AM.audio,access,outputs,memory};
}
test('global MIDI output and every channel route survive a fresh page session',async()=>{
 const first=setup();await first.audio.midiInit();first.audio.midiSelect('band');
 for(const ch of [3,5,6,9])first.audio.routeSelect(ch,'drums');
 const second=setup(first.memory);assert.equal(second.audio.out.outputId,'band');await second.audio.restoreMidi();
 assert.equal(second.audio.out.port.id,'band');assert.equal(second.audio.out.status,'connected');
 for(const ch of [3,5,6,9])assert.equal(second.audio.portFor(ch).id,'drums');
 second.audio.routeSelect(3,'');second.audio.midiSelect('');const third=setup(first.memory);await third.audio.restoreMidi();
 assert.equal(third.audio.out.port,null);assert(!Object.hasOwn(third.audio.out.routes,3));assert.equal(third.audio.portFor(9).id,'drums');
});
test('disconnected outputs stay remembered and reconnect without changing the chosen routes',async()=>{
 const s=setup();await s.audio.midiInit();s.audio.midiSelect('band');s.audio.routeSelect(9,'drums');
 for(const p of s.outputs.values())p.state='disconnected';s.access.onstatechange();
 assert.equal(s.audio.out.port,null);assert.equal(s.audio.out.outputId,'band');assert.equal(s.audio.out.routes[9],'drums');
 const reloaded=setup(s.memory,[]);await reloaded.audio.restoreMidi();assert.equal(reloaded.audio.out.status,'disconnected');
 for(const p of s.outputs.values())p.state='connected';s.access.onstatechange();assert.equal(s.audio.out.port.id,'band');assert.equal(s.audio.portFor(9).id,'drums');
});
test('unique name and manufacturer restore changed device IDs, but ambiguous devices remain unselected',async()=>{
 const s=setup();await s.audio.midiInit();s.audio.midiSelect('band');s.audio.routeSelect(9,'drums');
 const next=setup(s.memory,['new-band','new-drums']);next.outputs.get('new-band').name='band';next.outputs.get('new-drums').name='drums';await next.audio.restoreMidi();
 assert.equal(next.audio.out.port.id,'new-band');assert.equal(next.audio.portFor(9).id,'new-drums');
 const ambiguous=setup(s.memory,['a','b']);for(const p of ambiguous.outputs.values())p.name='band';await ambiguous.audio.restoreMidi();assert.equal(ambiguous.audio.out.port,null);
});
test('invalid or unavailable storage and denied MIDI do not break initialization',async()=>{
 for(const value of ['broken','null','{"version":1,"output":42,"routes":{"9":{"id":"x"}}}']){const s=setup(new Map([[key,value]]));await s.audio.restoreMidi();assert.equal(s.audio.out.port,null);assert.equal(Object.keys(s.audio.out.routes).length,0);}
 const s=setup();await s.audio.midiInit();s.audio.midiSelect('band');
 const scope={AM:{midi:{channels:{keys:3,bass:5,guitar:6,drums:9}}},localStorage:{getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');}},navigator:{requestMIDIAccess:async()=>{throw Error('denied');}}};
 vm.runInNewContext(fs.readFileSync('js/audio.js','utf8'),scope);assert.equal((await scope.AM.audio.midiInit()).length,0);assert.equal(scope.AM.audio.out.status,'midiDenied');
});
