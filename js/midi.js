AM.midi = (() => {
  const channels = {keys:3,bass:5,guitar:6,drums:9};
  const vlq = n => {
    if (!Number.isSafeInteger(n) || n < 0 || n > 0x0fffffff) throw Error('Invalid MIDI tick');
    const a = [n & 127]; while ((n = Math.floor(n / 128))) a.unshift((n & 127) | 128); return a;
  };
  const be = (n,size) => Array.from({length:size},(_,i) => (n >>> (8 * (size-i-1))) & 255);
  function encode(events,endTick,ppq = 480) {
    if (!Number.isInteger(ppq) || ppq < 1 || ppq > 32767) throw Error('Invalid MIDI division');
    const sorted = events.map((e,i) => ({...e,i})).sort((a,b) => a.tick-b.tick || (a.order ?? 0)-(b.order ?? 0) || a.i-b.i);
    let tick = 0; const track = [];
    for (const e of sorted) {
      if (!e.data?.length || e.data.some(x => !Number.isInteger(x) || x < 0 || x > 255)) throw Error('Invalid MIDI event');
      track.push(...vlq(e.tick-tick),...e.data); tick=e.tick;
    }
    track.push(...vlq(endTick-tick),255,47,0);
    return new Uint8Array([77,84,104,100,0,0,0,6,0,0,0,1,...be(ppq,2),77,84,114,107,...be(track.length,4),...track]);
  }
  const meta = (type,data) => [255,type,...vlq(data.length),...data];
  const text = (type,value) => meta(type,[...new TextEncoder().encode(value)]);
  const tempo = bpm => {
    if (!Number.isFinite(bpm) || bpm <= 0 || 60000000/bpm > 0xffffff) throw Error('Invalid MIDI tempo');
    return meta(81,be(Math.round(60000000/bpm),3));
  };
  function decode(input) {
    const b = new Uint8Array(input);
    let p=0;
    const need = n => { if (p+n > b.length) throw Error('Truncated MIDI'); };
    const byte = () => { need(1); return b[p++]; };
    const num = n => { need(n); let v=0; while(n--) v=v*256+byte(); return v; };
    const label = () => String.fromCharCode(byte(),byte(),byte(),byte());
    const variable = () => { let n=0; for(let i=0;i<4;i++) { const v=byte();n=n*128+(v&127);if(v<128)return n; } throw Error('Invalid MIDI VLQ'); };
    if (b.length > 20000000 || label() !== 'MThd') throw Error('Invalid MIDI header');
    const header=num(4);if(header<6)throw Error('Invalid MIDI header');
    const format=num(2), tracks=num(2), ppq=num(2);
    if(format>1 || !tracks || tracks>256 || !ppq || ppq&32768)throw Error('Unsupported MIDI format');
    need(header-6);p+=header-6;
    const raw=[]; let endTick=0;
    for(let track=0;track<tracks;track++) {
      if(label()!=='MTrk')throw Error('Invalid MIDI track');
      const length=num(4);need(length);const end=p+length;let tick=0,running=0,ended=false;
      while(p<end) {
        tick+=variable();let status=byte();
        if(status<128){p--;status=running;if(!status)throw Error('Missing MIDI running status');}
        if(status===255) {
          const type=byte(), size=variable();need(size);const data=[...b.slice(p,p+size)];p+=size;
          raw.push({tick,type,data});
          if(type===47){if(size)throw Error('Invalid MIDI end');ended=true;break;}
        } else if(status===240 || status===247) {const size=variable();need(size);p+=size;running=0;}
        else {
          if(status<128 || status>=240)throw Error('Unsupported MIDI status');
          running=status;const size=[12,13].includes(status>>4)?1:2, data=[status];
          for(let i=0;i<size;i++){const v=byte();if(v>127)throw Error('Invalid MIDI data');data.push(v);}
          raw.push({tick,data});
        }
        if(p>end)throw Error('Invalid MIDI track length');
      }
      if(!ended || p!==end)throw Error('Invalid MIDI end');
      endTick=Math.max(endTick,tick);
    }
    if(p!==b.length)throw Error('Trailing MIDI data');
    raw.sort((a,b)=>a.tick-b.tick);
    let tick=0,time=0,us=500000;const events=[],markers=[],meters=[];
    for(const e of raw) {
      time+=(e.tick-tick)/ppq*us/1000000;tick=e.tick;
      if(e.type===81){if(e.data.length!==3)throw Error('Invalid tempo');us=e.data.reduce((a,v)=>a*256+v,0);if(!us)throw Error('Invalid tempo');}
      else if(e.type===6)markers.push({t:time,tick,label:new TextDecoder().decode(new Uint8Array(e.data))});
      else if(e.type===88)meters.push({t:time,tick,n:e.data[0],d:2**e.data[1]});
      else if(e.type===undefined)events.push({t:time,tick:e.tick,data:e.data});
    }
    return {events,duration:time+(endTick-tick)/ppq*us/1000000,markers,meters,ppq,endTick,format};
  }
  function notes(events,duration,{instrument='theory',program} = {}) {
    const guitar=instrument==='guitar', channels=guitar?[6,0,1]:[3,3,3], used=new Set(), out=[{tick:0,data:tempo(60),order:-5}];
    for(const n of events) {
      if(!Number.isInteger(n.midi)||n.midi<0||n.midi>127||!Number.isInteger(n.velocity)||n.velocity<1||n.velocity>127||!Number.isFinite(n.t)||n.t<0||!Number.isFinite(n.dur)||n.dur<=0||n.t+n.dur>duration+1e-6)throw Error('Invalid preview note');
      const ch=channels[n.voice??0]??channels[0], on=Math.round(n.t*480), off=Math.round((n.t+n.dur)*480);used.add(ch);
      out.push({tick:on,data:[144|ch,n.midi,n.velocity],order:1},{tick:off,data:[128|ch,n.midi,0],order:-1});
      if(n.bend) {
        if(!Number.isFinite(n.bend)||Math.abs(n.bend)>12)throw Error('Invalid bend');
        out.push({tick:on,data:[176|ch,101,0],order:-4},{tick:on,data:[176|ch,100,0],order:-4},{tick:on,data:[176|ch,6,12],order:-4});
        for(let i=0;i<=16;i++){const v=Math.max(0,Math.min(16383,Math.round(8192+n.bend/12*8191*i/16)));out.push({tick:on+Math.round((off-on)*.55*i/16),data:[224|ch,v&127,v>>7]});}
        out.push({tick:off,data:[224|ch,0,64]});
      }
    }
    for(const ch of used)out.unshift({tick:0,data:[192|ch,program??(guitar?27:0)],order:-5});
    return encode(out,Math.round(duration*480));
  }
  function excerpt(sequence,{from=0,to=sequence.duration,countIn=0,pulse=1}={}) {
    if(!Number.isFinite(from)||!Number.isFinite(to)||from<0||to<=from||to>sequence.duration+1e-6||!Number.isInteger(countIn)||countIn<0||countIn>12||!Number.isFinite(pulse)||pulse<=0)throw Error('Invalid MIDI excerpt');
    const delay=countIn*pulse, state=new Map(), held=new Map(), out=[{tick:0,data:tempo(60),order:-10}];
    for(const e of sequence.events) {
      if(e.t>=from)break;
      const [status,a,b]=e.data,kind=status>>4,ch=status&15,key=ch+':'+a;
      if(kind===9&&b>0){const ns=held.get(key)||[];ns.push(e.data);held.set(key,ns);}
      else if(kind===8||(kind===9&&b===0)){const ns=held.get(key);ns?.shift();if(!ns?.length)held.delete(key);}
      else if(kind===11||kind===12||kind===14)state.set(status+':'+(kind===11?a:''),e.data);
    }
    for(const data of state.values())out.push({tick:Math.round(delay*480),data,order:-5});
    for(const notes of held.values())for(const data of notes)out.push({tick:Math.round(delay*480),data,order:2});
    for(const e of sequence.events)if(e.t>=from&&e.t<to)out.push({tick:Math.round((e.t-from+delay)*480),data:e.data});
    for(let i=0;i<countIn;i++){const tick=Math.round(i*pulse*480);out.push({tick,data:[153,37,i===0?95:65]},{tick:tick+24,data:[137,37,0]});}
    const end=Math.round((to-from+delay)*480);
    for(const ch of new Set(sequence.events.map(e=>e.data[0]&15)))out.push({tick:end,data:[176|ch,64,0],order:3},{tick:end,data:[176|ch,123,0],order:4});
    return encode(out,end);
  }
  return {channels,encode,decode,meta,text,tempo,notes,excerpt};
})();
