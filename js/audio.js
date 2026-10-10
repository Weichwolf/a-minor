AM.audio = (() => {
  let ctx;
  const players = new Set();
  const get = () => {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };
  const prepare = async (notes,options={}) => {
    await AM.soundfont.ready();
    return (duration,onEnd) => {
      const bytes=AM.midi.notes(notes,duration,options);
      AM.soundfont.play(bytes,{loop:true,onEnd}).catch(onEnd);
    };
  };
  const silence = () => AM.soundfont.stop();
  const preferencesKey = 'a-minor-midi';
  const device = p => ({id:p.id,name:p.name||'',manufacturer:p.manufacturer||''});
  const validDevice = p => p && ['id','name','manufacturer'].every(k=>typeof p[k]==='string'&&p[k].length<=1024) && p.id.length>0;
  let preferences = {version:1,output:null,routes:{}};
  try {
    const saved=JSON.parse(localStorage.getItem(preferencesKey));
    if(saved?.version===1) {
      if(validDevice(saved.output))preferences.output=device(saved.output);
      for(const ch of Object.values(AM.midi.channels))if(validDevice(saved.routes?.[ch]))preferences.routes[ch]=device(saved.routes[ch]);
    }
  } catch {}
  const out = {access:null, port:null, status:'',outputId:preferences.output?.id||'',routes:Object.fromEntries(Object.entries(preferences.routes).map(([ch,p])=>[ch,p.id]))};
  const savePreferences = () => { try { localStorage.setItem(preferencesKey,JSON.stringify(preferences)); } catch {} };
  const NOTE = {kick:36, snare:38, hat:42, click:37};
  const allOff = () => {
    if (out.port?.state !== 'connected') return;
    out.port.clear();
    Object.values(NOTE).forEach(n => out.port.send([0x89, n, 0]));
    out.port.send([0xB9, 123, 0]);
  };
  const ports = () => [...(out.access?.outputs.values() || [])].filter(p => p.state === 'connected');
  function restoreOutputs() {
    const ps=ports(), find=saved=>{
      if(!saved)return null;
      const exact=ps.find(p=>p.id===saved.id);if(exact)return exact;
      const matches=ps.filter(p=>saved.name&&p.name===saved.name&&(p.manufacturer||'')===saved.manufacturer);
      return matches.length===1?matches[0]:null;
    };
    out.port=find(preferences.output);out.outputId=out.port?.id||preferences.output?.id||'';
    if(out.port)preferences.output=device(out.port);
    for(const [ch,saved] of Object.entries(preferences.routes)) {
      const port=find(saved);out.routes[ch]=port?.id||saved.id;
      if(port)preferences.routes[ch]=device(port);
    }
    out.status=out.port?'connected':preferences.output?'disconnected':ps.length?'chooseDevice':'noOutputs';
    savePreferences();
    return ps;
  }
  async function midiInit() {
    if (!navigator.requestMIDIAccess) { out.status = 'midiUnavailable'; return []; }
    try {
      out.access ||= await navigator.requestMIDIAccess({sysex:false});
      out.access.onstatechange = () => {
        players.forEach(p => {
          const disconnected=p.ports?[...p.ports].some(port=>port.state==='disconnected'):out.port?.state==='disconnected';
          if(disconnected){p.stop();p.onEnd?.(Error('disconnected'));p.onError?.(Error('disconnected'));}
        });
        const ps=restoreOutputs();out.onchange?.(ps);
      };
      const ps=restoreOutputs();out.onchange?.(ps);return ps;
    } catch (e) { out.status = 'midiDenied';out.onchange?.(ports());return []; }
  }
  function midiSelect(id) {
    players.forEach(p => p.stop()); allOff();
    out.port = ports().find(p => p.id === id) || null; out.status = out.port ? 'connected' : 'chooseDevice';
    out.outputId=out.port?.id||'';preferences.output=out.port?device(out.port):null;savePreferences();
  }
  const portFor = ch => out.routes[ch] ? ports().find(p=>p.id===out.routes[ch]) : out.port;
  const routeSelect = (ch,id) => {
    if(!Object.values(AM.midi.channels).includes(ch))throw Error('Invalid MIDI route');
    players.forEach(p=>p.stop());
    const port=ports().find(p=>p.id===id);
    if(port){out.routes[ch]=port.id;preferences.routes[ch]=device(port);}else{delete out.routes[ch];delete preferences.routes[ch];}
    savePreferences();
  };
  const restoreMidi = () => preferences.output||Object.keys(preferences.routes).length ? midiInit() : Promise.resolve([]);
  const deviceName = id => [preferences.output,...Object.values(preferences.routes)].find(p=>p?.id===id)?.name||id;
  class Player {
    constructor() { this.playing = false; }
    load(seq, bpm) {
      if (!Number.isFinite(bpm) || bpm < 30 || bpm > 160 || !Number.isFinite(seq.len) || seq.len <= 0 || !seq.events.length) throw Error('Ungültige Sequenz oder Tempo');
      this.seq = seq; this.bpm = bpm;
    }
    play() {
      if (this.playing) return;
      if (!out.port || out.port.state !== 'connected') throw Error('MIDI-Ausgang fehlt');
      this.playing = true; players.add(this);
      const beatMs = 60000 / this.bpm / this.seq.q, ev = [...this.seq.events].sort((a, b) => a.t - b.t), start = performance.now() + 100;
      let cycle = 0, index = 0, lastBeat = -1;
      const tick = () => {
        if (!this.playing) return;
        const now = performance.now();
        try {
          if (!out.port || out.port.state !== 'connected') throw Error('disconnected');
          if (now - (start + (cycle * this.seq.len + ev[index].t) * beatMs) > 250) throw Error('timingInterrupted');
          for (let guard = 0; guard < 256; guard++) {
            const e = ev[index], t = start + (cycle * this.seq.len + e.t) * beatMs;
            if (t > now + 100) break;
            const velocity = e.type === 'click' ? (e.strong ? 105 : 70) : Math.round((e.vel ?? .8) * 110);
            out.port.send([0x99, NOTE[e.type], velocity], t);
            out.port.send([0x89, NOTE[e.type], 0], t + 40);
            if (++index === ev.length) { index = 0; cycle++; }
          }
          const beat = Math.floor((now - start) / (beatMs * this.seq.q));
          if (beat >= 0 && beat !== lastBeat) { lastBeat = beat; this.onBeat?.(beat % this.seq.steps.length); }
          this.timer = setTimeout(tick, 25);
        } catch (e) { this.stop(); this.onError?.(e); }
      };
      tick();
    }
    stop() {
      this.playing = false; clearTimeout(this.timer); players.delete(this);
      try { allOff(); } catch (e) { out.status = 'stopError'; }
    }
  }
  return {Player, prepare, get, silence, out, midiInit, midiSelect,portFor,routeSelect,restoreMidi,deviceName,register:p=>players.add(p),unregister:p=>players.delete(p)};
})();

AM.backing = (() => {
  function build(c) {
    const m = AM.music.meter(c.time,c.groups), bars = c.bars ?? 4;
    if (!Number.isInteger(bars) || bars < 1 || bars > 64 || !['click','drums'].includes(c.type)) throw Error('Invalid accompaniment');
    const pattern = c.drums || 'half';
    if (!['half','straight','shuffle','compound','grouped'].includes(pattern)) throw Error('Invalid drum pattern');
    const events = [], steps = [], beats = m.len / m.q;
    const accents = new Set(); let at = 0;
    for (const g of m.groups) { accents.add(at); at += g; }
    for (let b = 0; b < bars; b++) {
      for (let i = 0; i < beats; i++) {
        const t = b * m.len + i * m.q, strong = m.d === 8 && !m.compound ? accents.has(i) : i === 0;
        steps.push({t,bar:i === 0,strong,label:i + 1});
        if (c.type === 'click') { events.push({t,type:'click',strong}); continue; }
        events.push({t,type:'hat',vel:strong ? .52 : .42});
        if (m.compound) {
          events.push({t:t + .5,type:'hat',vel:.32},{t:t + 1,type:'hat',vel:.36});
          events.push({t,type:i % 2 ? 'snare' : 'kick',vel:i % 2 ? .65 : .85});
        } else if (m.d === 8) {
          if (strong) events.push({t,type:i === 0 ? 'kick' : 'snare',vel:.7});
        } else if (pattern === 'half') {
          if (i === 0 || i === 2) events.push({t,type:i === 0 ? 'kick' : 'snare',vel:i === 0 ? .85 : .65});
        } else {
          events.push({t,type:i % 2 ? 'snare' : 'kick',vel:i % 2 ? .65 : .85});
          events.push({t:t + (pattern === 'shuffle' ? 2 / 3 : .5),type:'hat',vel:.32});
        }
      }
    }
    return {events,len:bars * m.len,bar:m.len,beats,q:m.q,steps};
  }
  return {build};
})();
