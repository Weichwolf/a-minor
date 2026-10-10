const assert=require('node:assert/strict'),fs=require('node:fs');
module.exports=async(browser,base)=>{
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const ready=()=>page.waitForSelector('#repertoire-piece[data-ready]');
 const go=async(instrument,grade,seed)=>{
  await page.goto(base+'/#/practice/'+instrument+'/'+grade+'/'+seed);
  await page.waitForFunction(({instrument,grade,seed})=>AM.repertoire.current?.instrument===instrument&&AM.repertoire.current?.piece.grade===grade&&AM.repertoire.current?.piece.seed===seed&&document.querySelector('#repertoire-piece[data-ready]'),{instrument,grade,seed});
 };
 try{
  await page.addInitScript(()=>{
   window.sent=[];
   window.ports=new Map(['band','drums'].map(id=>[id,{id,name:id,manufacturer:'test',state:localStorage.getItem('test-midi-offline')===id?'disconnected':'connected',send:(data,t)=>sent.push({id,data:[...data],t}),clear:()=>sent.push({id,clear:true})}]));
   window.access={outputs:ports};Object.defineProperty(navigator,'requestMIDIAccess',{value:async()=>access});
  });
  await page.goto(base+'/#/practice');await page.waitForSelector('.tracks');
  assert.equal(await page.locator('.track').count(),2);assert.equal(await page.locator('nav.top a[aria-current]').getAttribute('href'),'#/practice');
  await page.locator('.track[href="#/practice/guitar"]').click();await ready();assert.equal(await page.locator('#practice-grade option').count(),6);
  for(const lang of ['de','en']){
   await page.selectOption('#language',lang);
   for(const instrument of ['guitar','keys'])for(let grade=0;grade<6;grade++){
    await go(instrument,grade,100+grade);assert.equal(await page.locator('.rep-section').count(),4);
    assert.equal(await page.locator('.rep-section h2').allTextContents().then(x=>x.map(s=>s[0]).join('')),'ABAC');
    assert(await page.locator('svg.score').count()>0);assert(!/undefined|NaN/.test(await page.locator('main').innerText()));
    assert.match(await page.locator('.practice-form').innerText(),/12.*16/);assert.equal(await page.inputValue('#practice-grade'),String(grade));
    assert.equal((await page.evaluate(()=>AM.repertoire.current.sequence.markers.map(m=>m.label))).join(''),'ABAC');
   }
  }
  await page.selectOption('#language','de');await go('guitar',2,101);
  const original=await page.evaluate(()=>({url:location.hash,bytes:[...AM.repertoire.current.bytes],seed:AM.repertoire.current.piece.seed}));
  await page.reload();await ready();assert.deepEqual(await page.evaluate(()=>[...AM.repertoire.current.bytes]),original.bytes);
  await page.locator('.rep-downloads a').nth(1).click();await page.waitForFunction(()=>AM.repertoire.current?.instrument==='keys');await ready();
  assert.deepEqual(await page.evaluate(()=>[...AM.repertoire.current.bytes]),original.bytes,'same quartet for both instruments');
  await page.selectOption('#language','en');await ready();assert.deepEqual(await page.evaluate(()=>[...AM.repertoire.current.bytes]),original.bytes,'language preserves the piece');
  await page.selectOption('#language','de');await go('guitar',2,101);
  await page.check('[data-done]');await page.locator('details.log summary').click();await page.locator('form input').fill('ABAC sicher <script>');await page.locator('form button').click();
  assert.equal(await page.locator('.rep-log script').count(),0);
  await page.click('#practice-new');await page.waitForFunction(n=>AM.repertoire.current?.piece.seed!==n,original.seed);await ready();
  assert(!await page.isChecked('[data-done]'));assert.notDeepEqual(await page.evaluate(()=>[...AM.repertoire.current.bytes]),original.bytes);
  await page.selectOption('#practice-grade','5');await page.waitForFunction(()=>AM.repertoire.current?.piece.grade===5);await ready();
  await page.goto(base+'/#/log');await page.waitForSelector('.logt');await page.locator('.logt a[href="'+original.url+'"]').click();await ready();
  assert(await page.isChecked('[data-done]'));assert.deepEqual(await page.evaluate(()=>[...AM.repertoire.current.bytes]),original.bytes);
  await go('keys',2,101);assert(!await page.isChecked('[data-done]'));
  await page.goto(base+'/#/midi');await page.waitForSelector('#connect');await page.click('#connect');await page.selectOption('#output','band');
  await page.selectOption('[data-midi-route="9"]','drums');await page.selectOption('[data-midi-route="3"]','band');
  await page.reload();await page.waitForFunction(()=>AM.audio.out.port?.id==='band');
  assert.equal(await page.inputValue('#output'),'band');assert.equal(await page.inputValue('[data-midi-route="9"]'),'drums');assert.equal(await page.inputValue('[data-midi-route="3"]'),'band');
  await page.evaluate(()=>localStorage.setItem('test-midi-offline','drums'));await page.reload();await page.waitForFunction(()=>AM.audio.out.port?.id==='band');
  assert.equal(await page.inputValue('[data-midi-route="9"]'),'drums');assert.match(await page.locator('[data-midi-route="9"] option:checked').innerText(),/getrennt/);
  await page.evaluate(()=>{ports.get('drums').state='connected';access.onstatechange();});assert.equal(await page.inputValue('[data-midi-route="9"]'),'drums');await page.evaluate(()=>localStorage.removeItem('test-midi-offline'));
  for(const instrument of ['guitar','keys']){
   await go(instrument,0,321);await page.selectOption('#rep-output','midi');await page.uncheck('#rep-count');await page.evaluate(()=>sent=[]);
   await page.locator('[data-transport=practice]').click();await page.waitForTimeout(250);
   const out=await page.evaluate(()=>sent),own=instrument==='guitar'?6:3,other=instrument==='guitar'?3:6;
   assert(!out.some(e=>e.data?.[0]===(144|own)));assert(out.some(e=>e.id==='band'&&e.data?.[0]===(144|other)));assert(out.some(e=>e.id==='band'&&e.data?.[0]===149));assert(out.some(e=>e.id==='drums'&&e.data?.[0]===153));
   await page.locator('[data-transport=practice]').click();assert((await page.evaluate(()=>sent)).some(e=>e.data?.[1]===120));
   await page.selectOption('#rep-section','1');await page.check('#rep-count');await page.check('#rep-loop');await page.evaluate(()=>sent=[]);await page.locator('[data-transport=listen]').click();await page.waitForTimeout(150);
   assert((await page.evaluate(()=>sent)).some(e=>e.id==='drums'&&e.data?.[0]===153&&e.data[1]===37));
   await page.locator('[data-transport=listen]').click();
  }
  await go('keys',3,42);await page.uncheck('#rep-count');await page.locator('[data-transport=listen]').click();await page.waitForFunction(()=>document.querySelector('[data-transport=listen]').dataset.playing==='playing');await page.locator('[data-transport=listen]').click();
  const download=page.waitForEvent('download');await page.locator('.rep-downloads a[download]').click();const file=await download;assert.equal(fs.readFileSync(await file.path()).subarray(0,4).toString(),'MThd');
  await page.setViewportSize({width:390,height:844});
  for(const instrument of ['guitar','keys'])for(let grade=0;grade<6;grade++){
   await go(instrument,grade,900+grade);await page.check('#rep-aids');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),instrument+' Grade '+grade+' mobile overflow');
  }
  await page.screenshot({path:'test-results/practice-mobile.png',fullPage:true});
  await page.emulateMedia({media:'print'});await page.evaluate(()=>AM.repertoire.resize());const pdf=await page.pdf({path:'test-results/practice.pdf',format:'A4',printBackground:true});assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert(pdf.length>5000);
  assert.deepEqual(errors,[]);console.log('PASS practice: six grades × two parts × two languages, generation, reproducible URLs, logs, MIDI settings reload/reconnect, band playback, mobile scores and exports');
 }finally{await context.close();}
};
