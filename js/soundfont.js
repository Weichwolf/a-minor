AM.soundfont = (() => {
  let loading, engine, generation=0;
  const fetchBuffer = async url => {
    const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),30000);
    try {const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw Error('soundfontLoadError');return await r.arrayBuffer();}
    finally {clearTimeout(timer);}
  };
  async function ready() {
    if(!loading)loading=(async()=>{
      const context=AM.audio.get();await context.resume();
      const [lib,core,data]=await Promise.all([import('../assets/vendor/spessasynth.js'),import('../assets/vendor/spessasynth-core.js'),fetchBuffer('assets/soundfont/FluidR3-a-minor.sf2')]);
      await context.audioWorklet.addModule('assets/vendor/spessasynth_processor.min.js');
      const synth=new lib.WorkletSynthesizer(context,{eventsEnabled:true});synth.setLogLevel(false,false,false);
      try {
        await synth.soundBankManager.addSoundBank(data,'fluid');await synth.isReady;
        const gain=context.createGain(), limiter=context.createDynamicsCompressor();
        gain.gain.value=0;limiter.threshold.value=-6;limiter.knee.value=6;limiter.ratio.value=12;limiter.attack.value=.003;limiter.release.value=.15;
        synth.connect(gain);gain.connect(limiter).connect(context.destination);
        const sequencer=new lib.Sequencer(synth,{skipToFirstNoteOn:false});
        sequencer.eventHandler.timeDelay=0;
        engine={context,synth,gain,sequencer,MIDI:core.BasicMIDI};return engine;
      } catch(error){synth.destroy();throw error;}
    })().catch(error=>{loading=null;throw error;});
    return loading;
  }
  function mix(levels={}) {
    if(!engine)return;
    for(let ch=0;ch<16;ch++) {
      const level=levels[ch]??1;
      if(!Number.isFinite(level)||level<0||level>1)throw Error('Invalid mix');
      engine.synth.midiChannels[ch].setSystemParameter('gain',level);
      engine.synth.midiChannels[ch].setSystemParameter('isMuted',level===0);
    }
  }
  function stop() {
    generation++;
    if(!engine)return;
    engine.cancel?.();engine.cancel=null;
    engine.sequencer.pause();engine.synth.stopAll(false);
    const now=engine.context.currentTime,p=engine.gain.gain;
    p.cancelScheduledValues(now);p.setValueAtTime(p.value,now);p.linearRampToValueAtTime(0,now+.03);
  }
  async function play(bytes,{loop=false,loopStart=0,rate=1,levels={},onEnd=()=>{}}={}) {
    if(!Number.isFinite(rate)||rate<=0||rate>8)throw Error('Invalid playback rate');
    stop();const run=generation,e=await ready();if(run!==generation)return;
    await e.context.resume();if(run!==generation)return;
    e.synth.stopAll(true);mix(levels);
    const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),parsed=e.MIDI.fromArrayBuffer(buffer,'a-minor.mid'),decoded=AM.midi.decode(bytes);
    if(!Number.isFinite(loopStart)||loopStart<0||loopStart>=decoded.duration)throw Error('Invalid loop start');
    parsed.loop={start:parsed.secondsToMIDITicks(loopStart),end:decoded.endTick,type:'hard'};parsed.lastVoiceEventTick=decoded.endTick;parsed.duration=decoded.duration;
    const loaded=await new Promise((resolve,reject)=>{
      const clear=()=>{clearTimeout(timer);e.sequencer.eventHandler.removeEvent('songChange','load');e.sequencer.eventHandler.removeEvent('midiError','load');e.cancel=null;};
      const timer=setTimeout(()=>{clear();reject(Error('soundfontLoadError'));},15000);
      e.cancel=()=>{clear();resolve(false);};
      e.sequencer.eventHandler.addEvent('songChange','load',()=>{clear();resolve(true);});
      e.sequencer.eventHandler.addEvent('midiError','load',()=>{clear();reject(Error('Invalid MIDI'));});
      e.sequencer.loadNewSongList([parsed]);
    });
    if(!loaded||run!==generation)return;
    mix(levels);e.sequencer.skipToFirstNoteOn=false;e.sequencer.loopCount=loop?Infinity:0;e.sequencer.playbackRate=rate;
    e.sequencer.eventHandler.addEvent('songEnded','finish',()=>{if(run===generation)onEnd();});
    e.sequencer.eventHandler.addEvent('midiError','play',error=>{if(run===generation){stop();onEnd(Error(String(error)));}});
    const now=e.context.currentTime;e.gain.gain.cancelScheduledValues(now);e.gain.gain.setValueAtTime(0,now);e.gain.gain.linearRampToValueAtTime(.6,now+.01);
    e.sequencer.play();
  }
  return {ready,play,stop,mix,get currentTime(){return engine?.sequencer.currentTime??0;},get engine(){return engine;}};
})();
