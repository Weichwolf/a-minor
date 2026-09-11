const assert = require('node:assert/strict');
const fs = require('node:fs');
module.exports = async (browser,base) => {
  const context=await browser.newContext(), page=await context.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
    const requested=[]; page.on('request',r=>{if(r.url().endsWith('.mp3'))requested.push(r.url());});
    await page.goto(base+'/#/unit/ku0-1'); await page.waitForSelector('.listen');
    assert.equal(requested.length,0,'no samples loaded before Listen');
    await page.evaluate(()=>{
      window.pianoStarts=0;
      const original=AM.SamplePiano.prototype.note;
      AM.SamplePiano.prototype.note=function(...args){pianoStarts++;return original.apply(this,args);};
    });
    let release;
    const gate=new Promise(r=>{release=r;});
    await page.route('**/*.mp3',async route=>{await gate;await route.continue();});
    await page.locator('.listen').first().click();
    await page.waitForFunction(()=>document.querySelector('.listen').dataset.playing==='loading');
    assert.match(await page.locator('.preview-status').first().innerText(),/geladen/);
    await page.locator('.listen').first().click();release();
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(()=>pianoStarts),0,'cancelled load never autoplays');
    assert.equal(await page.locator('.listen[data-playing]').count(),0);
    await page.unroute('**/*.mp3');
    await page.locator('.listen').first().click();
    await page.waitForFunction(()=>document.querySelector('.listen').dataset.playing==='playing');
    await page.waitForFunction(()=>pianoStarts>0);
    assert(requested.length>0&&requested.length<51,'loads an exercise subset');
    await page.locator('.listen').first().click();
    const stopped=await page.evaluate(()=>pianoStarts);await page.waitForTimeout(250);
    assert.equal(await page.evaluate(()=>pianoStarts),stopped,'stop cancels future attacks');
    const loopStart=await page.evaluate(async()=>{
      const play=await AM.audio.prepare([{midi:60,velocity:78,t:0,dur:.1}]);
      const before=pianoStarts;play(.3,()=>{throw Error('Loop ended unexpectedly');});return before;
    });
    await page.waitForFunction(before=>pianoStarts>=before+3,loopStart);
    await page.evaluate(()=>AM.audio.silence());
    const loopStopped=await page.evaluate(()=>pianoStarts);await page.waitForTimeout(400);
    assert.equal(await page.evaluate(()=>pianoStarts),loopStopped,'loop stop cancels subsequent cycles');
    const failContext=await browser.newContext(), fail=await failContext.newPage();
    try {
      await fail.route('**/*.mp3',r=>r.fulfill({status:503,body:'unavailable'}));
      await fail.goto(base+'/#/unit/ku0-1');await fail.waitForSelector('.listen');await fail.locator('.listen').first().click();
      await fail.waitForFunction(()=>document.querySelector('.preview-status').textContent.includes('nicht geladen'));
      assert.equal(await fail.locator('.listen[data-playing]').count(),0);
      await fail.unroute('**/*.mp3');await fail.locator('.listen').first().click();
      await fail.waitForFunction(()=>document.querySelector('.listen').dataset.playing==='playing');
      await fail.goto(base+'/#/unit/u7-6');await fail.waitForSelector('.listen');await fail.locator('.listen').first().click();
      await fail.selectOption('#language','en');await fail.waitForTimeout(300);
      assert.equal(await fail.locator('.listen[data-playing]').count(),0,'language change cancels pending or active preview');
    } finally {await failContext.close();}
    const metrics=await page.evaluate(async()=>{
      const manifest=await (await fetch('assets/piano/manifest.json')).json();
      const buffers=new Map();
      const render=async(midi,velocity,dur,{stopAt,bend,polyphony=1}={})=>{
        const c=new OfflineAudioContext(2,48000*4,48000), piano=new AM.SamplePiano(c);
        const n={midi,velocity,t:0,dur,bend};n.sample=piano.select(manifest.samples,n);
        if(!buffers.has(n.sample.file))buffers.set(n.sample.file,await c.decodeAudioData(await (await fetch('assets/piano/'+n.sample.file)).arrayBuffer()));
        for(let i=0;i<polyphony;i++)piano.note(n,buffers.get(n.sample.file),.1);
        let suspended;
        if(stopAt!==undefined)suspended=c.suspend(stopAt).then(()=>{piano.stop();return c.resume();});
        const result=await c.startRendering();await suspended;
        const data=result.getChannelData(0);
        const rms=(a,b)=>Math.sqrt(data.slice(a*48000,b*48000).reduce((sum,x)=>sum+x*x,0)/((b-a)*48000));
        let peak=0,jump=0;for(let i=1;i<data.length;i++){peak=Math.max(peak,Math.abs(data[i]));jump=Math.max(jump,Math.abs(data[i]-data[i-1]));}
        return {before:rms(0,.09),attack:rms(.12,.3),held:rms(.5,.7),tail:rms(1.1,1.3),late:rms(2.5,3),afterStop:rms(.5,.7),peak,jump};
      };
      return {soft:await render(60,40,2),loud:await render(60,96,2),short:await render(60,78,.12),long:await render(60,78,2),stopped:await render(60,78,2,{stopAt:.35}),poly:await render(60,96,2,{polyphony:8}),bend:await render(61,78,.8,{bend:2})};
    });
    for(const m of Object.values(metrics)){assert(m.before<1e-7);assert(m.attack>.001);assert(m.peak<1);}
    assert(metrics.loud.attack>metrics.soft.attack*1.5,'velocity changes audible dynamics');
    assert(metrics.short.tail<1e-7,'staccato damper reaches silence');
    assert(metrics.long.tail>.001,'held piano retains natural decay');
    assert(metrics.stopped.afterStop<1e-7,'stop fades to silence');
    assert(metrics.bend.attack>.001);assert.deepEqual(errors,[]);
    fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/piano-envelope.json',JSON.stringify(metrics,null,2)+'\n');
    console.log('PASS sample lazy loading, load cancellation, retry, real decoding, envelope renders and polyphonic headroom');
  } finally {await context.close();}
};
