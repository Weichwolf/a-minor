AM.SamplePiano = class {
  constructor(context) {
    this.context = context;
    this.cache = new Map();
    this.voices = new Set();
    this.bytes = 0;
    this.output = context.createDynamicsCompressor();
    Object.entries({threshold:-6,knee:6,ratio:8,attack:.003,release:.15}).forEach(([k,v]) => this.output[k].value = v);
    this.output.connect(context.destination);
  }
  async fetch(url, decode = false) {
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(),15000);
    try {
      const response = await fetch(url,{signal:controller.signal});
      if (!response.ok) throw Error('pianoLoadError');
      return decode ? await this.context.decodeAudioData(await response.arrayBuffer()) : await response.json();
    } finally { clearTimeout(timeout); }
  }
  async buffer(sample) {
    const key = sample.file;
    if (this.cache.has(key)) {
      const entry = this.cache.get(key); this.cache.delete(key); this.cache.set(key,entry); return entry.promise;
    }
    const entry = {bytes:0};
    entry.promise = this.fetch('assets/piano/' + key,true).then(buffer => {
      entry.bytes = buffer.length * buffer.numberOfChannels * 4; this.bytes += entry.bytes;
      for (const [k,e] of this.cache) {
        if (this.bytes <= 96 * 1024 * 1024) break;
        if (e.bytes) { this.bytes -= e.bytes; this.cache.delete(k); }
      }
      return buffer;
    }).catch(error => { this.cache.delete(key); throw error; });
    this.cache.set(key,entry); return entry.promise;
  }
  select(samples, note) {
    if (!Number.isFinite(note.midi) || note.midi < 36 || note.midi > 84 || !Number.isFinite(note.velocity) || note.velocity < 1 || note.velocity > 127 || !Number.isFinite(note.t) || note.t < 0 || !Number.isFinite(note.dur) || note.dur <= 0 || !Number.isFinite(note.bend || 0) || Math.abs(note.bend || 0) > 12) throw Error('Invalid piano note');
    return samples.reduce((best,s) => {
      const distance = Math.abs(s.midi - note.midi) * 128 + Math.abs(s.velocity - note.velocity);
      return !best || distance < best.distance ? {sample:s,distance} : best;
    },null).sample;
  }
  async prepare(notes) {
    this.manifest ||= this.fetch('assets/piano/manifest.json').catch(error => { this.manifest = null; throw error; });
    const {samples} = await this.manifest;
    const selected = notes.map(note => ({...note,sample:this.select(samples,note)})).sort((a,b) => a.t - b.t);
    const pending = [...new Map(selected.map(n => [n.sample.file,n.sample])).values()], buffers = new Map();
    await Promise.all(Array.from({length:Math.min(4,pending.length)},async () => {
      while (pending.length) { const s = pending.pop(); buffers.set(s.file,await this.buffer(s)); }
    }));
    return (duration, onEnd) => this.play(selected,buffers,duration,onEnd);
  }
  release(note) {
    return Math.min(.65,Math.max(.18,.18 + (72 - note.midi) * .009)) * Math.min(1,.75 + note.dur * .5);
  }
  note(note, buffer, start) {
    const c = this.context, source = c.createBufferSource(), gain = c.createGain(), damper = c.createBiquadFilter();
    const attack = Math.min(.002,note.dur / 2), off = start + note.dur, release = this.release(note), end = off + release;
    const level = .65 * (note.velocity / note.sample.velocity) ** 1.3;
    source.buffer = buffer; source.playbackRate.value = 2 ** ((note.midi - note.sample.midi + note.sample.tune / 100) / 12);
    if (note.bend) { source.detune.setValueAtTime(0,start); source.detune.linearRampToValueAtTime(note.bend * 100,start + note.dur * .55); }
    gain.gain.setValueAtTime(0,start); gain.gain.linearRampToValueAtTime(level,start + attack);
    gain.gain.setValueAtTime(level,off); gain.gain.setTargetAtTime(0,off,release / Math.log(1000));
    gain.gain.setValueAtTime(level / 1000,end); gain.gain.linearRampToValueAtTime(0,end + .005);
    damper.type = 'lowpass'; damper.Q.value = .5;
    const cutoff = Math.min(18000,c.sampleRate * .45);
    damper.frequency.setValueAtTime(cutoff,start); damper.frequency.setValueAtTime(cutoff,off);
    damper.frequency.exponentialRampToValueAtTime(Math.min(cutoff,1800 + Math.max(0,note.midi - 36) * 60),end);
    source.connect(damper).connect(gain).connect(this.output);
    const voice = {source,gain,damper,start,off,attack,release,level}; this.voices.add(voice);
    source.onended = () => { this.voices.delete(voice); source.disconnect(); gain.disconnect(); damper.disconnect(); };
    source.start(start); source.stop(end + .01);
  }
  play(notes, buffers, duration, onEnd) {
    this.stop();
    if (!Number.isFinite(duration) || duration <= 0 || notes.some(n => n.t >= duration || n.t + n.dur > duration + 1e-7)) throw Error('Invalid preview duration');
    const c = this.context, start = c.currentTime + .06;
    let index = 0, cycle = 0;
    const tick = () => {
      try {
        const now = c.currentTime;
        if (notes.length) {
          const time = () => start + cycle * duration + notes[index].t;
          if (time() < now - .25) throw Error('previewInterrupted');
          for (let guard = 0; time() <= now + .15; guard++) {
            if (guard >= 4096) throw Error('previewInterrupted');
            const n = notes[index]; this.note(n,buffers.get(n.sample.file),time());
            if (++index === notes.length) { index = 0; cycle++; }
          }
        }
        this.timer = setTimeout(tick,25);
      } catch (error) { this.stop(); onEnd(error); }
    };
    tick();
  }
  stop() {
    clearTimeout(this.timer); this.timer = null;
    const now = this.context.currentTime;
    for (const v of this.voices) {
      const p = v.gain.gain;
      const level = now <= v.start ? 0 : now < v.start + v.attack ? v.level * (now - v.start) / v.attack : now < v.off ? v.level : v.level * Math.exp(-(now - v.off) * Math.log(1000) / v.release);
      p.cancelScheduledValues(now); p.setValueAtTime(level,now); p.linearRampToValueAtTime(0,now + .03);
      v.source.stop(now + .035);
    }
    this.voices.clear();
  }
};
