const assert=require('node:assert/strict'),fs=require('node:fs');
module.exports=async(browser,base)=>{
 const context=await browser.newContext(),page=await context.newPage(),errors=[],pdfRequests=[];let popups=0;
 page.on('pageerror',e=>errors.push(e.message));page.on('request',request=>{if(request.url().includes('/assets/vendor/pdfmake/'))pdfRequests.push(request.url());});
 page.on('dialog',async dialog=>{errors.push('Unexpected '+dialog.type()+' dialog');await dialog.dismiss();});context.on('page',()=>popups++);
 const ready=()=>page.waitForSelector('#repertoire-piece[data-ready]');
 const go=async(instrument,grade,seed)=>{
  await page.goto(base+'/#/practice/'+instrument+'/'+grade+'/'+seed);
  await page.waitForFunction(({instrument,grade,seed})=>AM.repertoire.current?.instrument===instrument&&AM.repertoire.current?.piece.grade===grade&&AM.repertoire.current?.piece.seed===seed&&document.querySelector('#repertoire-piece[data-ready]'),{instrument,grade,seed});
 };
 try{
  await page.addInitScript(()=>{
   window.printCalls=0;window.popupCalls=0;window.print=()=>{printCalls++;};window.open=()=>{popupCalls++;return null;};
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
    await go(instrument,grade,100+grade);assert.equal(await page.locator('.rep-section').count(),3);
    assert.equal(await page.locator('.rep-section h2').allTextContents().then(x=>x.map(s=>s[0]).join('')),'ABC');
    assert.deepEqual(await page.locator('.rep-section .measure').allTextContents(),Array.from({length:12},(_,i)=>String(i+1)));
    assert.deepEqual(await page.locator('#rep-section option').allTextContents(),[lang==='de'?'Ganzes Stück':'Whole piece','A · 1–4','B · 5–8','C · 9–12']);
    assert.equal(await page.locator('svg.score').count(),3);assert(!/undefined|NaN/.test(await page.locator('main').innerText()));
    assert.equal(await page.locator('#rep-aids').count(),0);
    const identifier='0x'+(100+grade).toString(16).padStart(8,'0').toUpperCase();
    assert.equal(new URL(page.url()).hash.split('/').at(-1),identifier);
    assert((await page.locator('#repertoire-piece>h2').innerText()).endsWith(identifier));assert((await page.title()).includes(identifier));
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
  await page.evaluate(()=>{
   window.highlightOriginals={play:AM.soundfont.play,stop:AM.soundfont.stop,time:Object.getOwnPropertyDescriptor(AM.soundfont,'currentTime')};window.testPosition=0;
   AM.soundfont.play=async bytes=>{window.playedSequence=AM.midi.decode(bytes);};AM.soundfont.stop=()=>{};
   Object.defineProperty(AM.soundfont,'currentTime',{configurable:true,get:()=>testPosition});
  });
  await page.selectOption('#rep-section','all');await page.uncheck('#rep-loop');await page.locator('[data-transport=listen]').click();
  await page.waitForFunction(()=>document.querySelector('[data-transport=listen]').dataset.playing==='playing');
  assert.equal(await page.evaluate(()=>playedSequence.markers.map(m=>m.label).join('')),'ABAC','whole-piece playback retains the repeated A');
  for(const marker of await page.evaluate(()=>AM.repertoire.current.sequence.markers)){
   const position=marker.t+.05;await page.evaluate(t=>testPosition=t,position);
   await page.waitForFunction(({label,position})=>document.querySelectorAll('.rep-section.current').length===1&&document.querySelector('.rep-section.current h2').textContent.trim().startsWith(label+' ')&&Math.abs(document.querySelector('#rep-progress').value-position)<.001,{label:marker.label,position});
  }
  await page.selectOption('#rep-section','3');await page.evaluate(()=>testPosition=0);await page.locator('[data-transport=listen]').click();
  await page.waitForFunction(()=>document.querySelector('[data-transport=listen]').dataset.playing==='playing'&&document.querySelector('.rep-section.current h2')?.textContent.trim().startsWith('C '));
  assert(await page.evaluate(()=>{
   const seq=AM.repertoire.current.sequence,from=seq.markers[3].t,isNote=e=>e.data[0]===147&&e.data[2]>0;
   return Math.abs(playedSequence.duration-(seq.duration-from))<.002&&playedSequence.events.find(isNote).data[1]===seq.events.find(e=>e.t>=from&&isNote(e)).data[1];
  }),'selecting C plays its original MIDI excerpt');
  await page.locator('[data-transport=listen]').click();await page.evaluate(()=>{AM.soundfont.play=highlightOriginals.play;AM.soundfont.stop=highlightOriginals.stop;Object.defineProperty(AM.soundfont,'currentTime',highlightOriginals.time);});
  const download=page.waitForEvent('download');await page.locator('.rep-downloads a[download]').click();const file=await download;assert.equal(fs.readFileSync(await file.path()).subarray(0,4).toString(),'MThd');
  await page.setViewportSize({width:390,height:844});
  for(const instrument of ['guitar','keys'])for(let grade=0;grade<6;grade++){
   await go(instrument,grade,900+grade);assert.equal(await page.locator('svg.score').count(),3);assert.deepEqual(await page.locator('.rep-section').evaluateAll(items=>items.map(el=>el.querySelectorAll('.measure').length)),[4,4,4]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),instrument+' Grade '+grade+' mobile overflow');
  }
  await page.screenshot({path:'test-results/practice-mobile.png',fullPage:true});
  assert.equal(pdfRequests.length,0,'PDF assets load only when requested');
  await page.route('**/assets/vendor/pdfmake/pdfmake.min.js',route=>route.abort());
  await page.click('#rep-pdf');await page.waitForFunction(()=>!document.querySelector('#rep-pdf').disabled&&document.querySelector('.rep-status').textContent.includes('Bitte erneut versuchen'));
  assert.equal(await page.locator('#rep-pdf').innerText(),'PDF herunterladen','failed downloads allow retry');
  await page.unroute('**/assets/vendor/pdfmake/pdfmake.min.js');
  await page.setViewportSize({width:1920,height:1200});
  for(const lang of ['de','en']){
   await page.selectOption('#language',lang);
   for(const instrument of ['guitar','keys'])for(let grade=0;grade<6;grade++){
    await go(instrument,grade,900+grade);
    assert.equal(await page.locator('.rep-section svg.score').count(),3);
    assert.equal(await page.locator('.rep-section .measure').count(),12);
    const download=page.waitForEvent('download');await page.click('#rep-pdf');const file=await download;
    await file.saveAs('test-results/practice-'+instrument+'-grade'+grade+'-'+lang+'.pdf');
    const identifier=new URL(page.url()).hash.split('/').at(-1);
    assert(file.suggestedFilename().includes(identifier),'PDF filename uses the URL identifier');
    assert(file.suggestedFilename().endsWith((instrument==='keys'?'Keyboard':lang==='de'?'Gitarre':'Guitar')+'.pdf'));
    const pdf=fs.readFileSync(await file.path());
    assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert(pdf.length>5000);
    assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,1,instrument+' Grade '+grade+' '+lang+': ABC on one PDF page');
    assert.equal(await page.locator('#rep-pdf').innerText(),lang==='de'?'PDF herunterladen':'Download PDF');
    assert.deepEqual(await page.evaluate(()=>({print:printCalls,popups:popupCalls})),{print:0,popups:0},'direct download opens no print dialog or popup');
   }
  }
  assert.equal(popups,0);assert.deepEqual(errors,[]);console.log('PASS practice: six grades × two parts × two languages, ABC notation with ABAC playback/highlights, matching URL/PDF identifiers, logs, MIDI settings reload/reconnect, band playback, four-bar mobile rows and direct single-page ABC PDF downloads with retry');
 }finally{await context.close();}
};
