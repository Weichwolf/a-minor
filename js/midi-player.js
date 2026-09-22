AM.MIDIFilePlayer = class {
  constructor(sequence,{rate=1,loop=false,loopStart=0,levels={},portFor=()=>AM.audio.out.port,onEnd=()=>{}}={}) {
    if(!sequence.events.length||sequence.duration<=0||!Number.isFinite(rate)||rate<=0||rate>8)throw Error('Invalid MIDI sequence');
    if(!Number.isFinite(loopStart)||loopStart<0||loopStart>=sequence.duration)throw Error('Invalid loop start');
    this.sequence=sequence;this.rate=rate;this.loop=loop;this.loopStart=loopStart;this.loopIndex=sequence.events.findIndex(e=>e.t>=loopStart);this.levels={...levels};this.portFor=portFor;this.onEnd=onEnd;this.channels=[...new Set(sequence.events.map(e=>e.data[0]&15))];this.ports=new Set();this.expression=Array(16).fill(127);
  }
  position(elapsed){const d=this.sequence.duration,span=d-this.loopStart,cycle=elapsed<d?0:1+Math.floor((elapsed-d)/span);return {cycle,within:elapsed-cycle*span};}
  get currentTime(){return this.playing?this.position(Math.max(0,(performance.now()-this.start)/1000*this.rate)).within:0;}
  play(){
    if(this.playing)return;
    for(const ch of this.channels){const port=this.portFor(ch);if(!port||port.state!=='connected')throw Error('disconnected');this.ports.add(port);}
    this.start=performance.now()+100;this.index=0;this.cycle=0;this.playing=true;AM.audio.register(this);
    this.setMix(this.levels);this.tick();
  }
  setMix(levels){
    for(const n of Object.values(levels))if(!Number.isFinite(n)||n<0||n>1)throw Error('Invalid mix');
    this.levels={...levels};
    if(!this.playing)return;
    const now=performance.now();for(const p of this.ports)p.clear();
    const elapsed=(now-this.start)/1000*this.rate;const {cycle,within}=this.position(elapsed);this.cycle=cycle;this.index=this.sequence.events.findIndex(e=>e.t>=within);if(this.index<0){this.index=this.loopIndex;this.cycle++;}
    this.expression.fill(127);for(const e of this.sequence.events)if(e.t<Math.max(0,within)&&e.data[0]>>4===11&&e.data[1]===11)this.expression[e.data[0]&15]=e.data[2];
    for(const ch of this.channels){const port=this.portFor(ch),gain=this.levels[ch]??1;port.send([176|ch,11,Math.round(this.expression[ch]*Math.sqrt(gain))]);if(gain===0){port.send([176|ch,64,0]);port.send([176|ch,123,0]);}}
  }
  tick(){
    if(!this.playing)return;
    try {
      if([...this.ports].some(p=>p.state!=='connected'))throw Error('disconnected');
      const {events,duration}=this.sequence,now=performance.now();
      for(let guard=0;guard<8192;guard++) {
        if(!this.loop&&this.cycle>0)break;
        const e=events[this.index],at=this.start+(this.cycle*(duration-this.loopStart)+e.t)*1000/this.rate;
        if(at>now+100)break;
        if(at<now-250)throw Error('timingInterrupted');
        const data=[...e.data],ch=data[0]&15,kind=data[0]>>4,gain=this.levels[ch]??1;
        if(kind===11&&data[1]===11){this.expression[ch]=data[2];data[2]=Math.round(data[2]*Math.sqrt(gain));}
        if(!(kind===9&&data[2]>0&&gain===0))this.portFor(ch).send(data,at);
        if(kind===11&&data[1]===121){this.expression[ch]=127;this.portFor(ch).send([176|ch,11,Math.round(127*Math.sqrt(gain))],at);}
        if(++this.index===events.length){this.index=this.loopIndex;this.cycle++;}
        if(guard===8191)throw Error('timingInterrupted');
      }
      if(!this.loop&&now>=this.start+duration*1000/this.rate){this.playing=false;AM.audio.unregister(this);this.onEnd();return;}
      this.timer=setTimeout(()=>this.tick(),25);
    } catch(error){this.stop();this.onEnd(error);}
  }
  stop(){
    clearTimeout(this.timer);if(!this.playing)return;this.playing=false;AM.audio.unregister(this);
    for(const p of this.ports)try{p.clear();}catch{}
    for(const ch of this.channels){const port=this.portFor(ch);if(port?.state==='connected'){port.send([176|ch,64,0]);port.send([176|ch,123,0]);port.send([176|ch,120,0]);port.send([224|ch,0,64]);}}
  }
};
