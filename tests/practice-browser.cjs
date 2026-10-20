const assert=require('node:assert/strict'),fs=require('node:fs');
module.exports=async(browser,base)=>{
 const context=await browser.newContext({viewport:{width:1920,height:1200}}),page=await context.newPage(),errors=[],pdfRequests=[];let popups=0;
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/assets/vendor/pdfmake/'))pdfRequests.push(r.url());});
 page.on('dialog',async d=>{errors.push('Unexpected '+d.type());await d.dismiss();});context.on('page',()=>popups++);
 const ready=()=>page.waitForSelector('#repertoire-piece[data-ready]');
 const go=async(instrument,grade,seed,style='rock')=>{await page.goto(base+`/#/practice/${instrument}/${grade}/${style}/${seed}`);await ready();};
 try{
  await page.addInitScript(()=>{
   window.printCalls=0;window.popupCalls=0;window.print=()=>{printCalls++;};window.open=()=>{popupCalls++;return null;};window.sent=[];
   window.ports=new Map(['band','drums'].map(id=>[id,{id,name:id,manufacturer:'test',state:localStorage.getItem('test-midi-offline')===id?'disconnected':'connected',send:(data,t)=>sent.push({id,data:[...data],t}),clear:()=>sent.push({id,clear:true})}]));
   window.access={outputs:ports};Object.defineProperty(navigator,'requestMIDIAccess',{value:async()=>access});
  });
  await page.goto(base+'/#/practice');await page.waitForSelector('.tracks');assert.equal(await page.locator('.track').count(),4);
  assert.deepEqual(await page.locator('nav.top a:not(.brand)').allTextContents(),['Theorie','Praxis','Griffbrett','MIDI','Bookmarks']);
  await page.locator('.track[href="#/practice/keys"]').click();await ready();assert.equal(await page.inputValue('#rep-arrangement'),'solo');
  const stylesByGrade=await page.evaluate(()=>AM.practiceComposer.profiles.map(p=>p.styles));
  for(const language of ['de','en']){
   await page.selectOption('#language',language);
   for(const instrument of ['guitar','keys','bass','drums'])for(let grade=0;grade<6;grade++)for(const style of stylesByGrade[grade]){
    await go(instrument,grade,100+grade,style);
    const p=await page.evaluate(()=>AM.repertoire.current.piece),unique=p.sections.filter((s,i,ss)=>ss.findIndex(x=>x.name===s.name)===i);
    assert.equal(await page.locator('.rep-section').count(),unique.length);assert.equal(await page.locator('.rep-section .measure').count(),p.uniqueBars);
    assert.deepEqual(await page.locator('.rep-section .measure').allTextContents(),Array.from({length:p.uniqueBars},(_,i)=>String(i+1)));
    assert.deepEqual(await page.locator('#rep-section option').evaluateAll(es=>es.slice(1).map(e=>e.value)),unique.map(s=>String(p.sections.findIndex(x=>x.name===s.name))));
    assert(!/undefined|NaN/.test(await page.locator('main').innerText()));assert.equal(await page.locator('[data-done],form[data-log],.check,.rep-log,[data-aid],.practice-info').count(),0);
    assert.equal(await page.locator('.practice-description').count(),1);assert.equal(await page.locator('#practice-grade option').count(),6);assert.equal(await page.locator('#practice-style option').count(),7);assert.equal(await page.locator('#practice-style option:enabled').count(),stylesByGrade[grade].length);assert.equal(await page.inputValue('#practice-style'),style);assert.equal(p.style,style);
    const id='0x'+(100+grade).toString(16).padStart(8,'0').toUpperCase();assert.equal(new URL(page.url()).hash.split('/').at(-1),id);assert((await page.title()).includes(id));
    assert(await page.locator('#practice-controls').evaluate(e=>!!e.closest('.rep-player')&&e.previousElementSibling?.getAttribute('href')==='#/midi'));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   }
  }
  await page.selectOption('#language','de');
  await go('keys',4,31,'progressive');await page.selectOption('#practice-grade','3');await page.waitForFunction(()=>AM.repertoire.current?.piece.grade===3);await ready();
  assert.equal(await page.inputValue('#practice-style'),'rock');assert.match(await page.locator('#practice-style option[value=progressive]').innerText(),/ab Grade 4/);assert(await page.locator('#practice-style option[value=progressive]').evaluate(e=>e.disabled));
  await go('keys',0,31,'blues');assert.equal(await page.inputValue('#practice-style'),'rock');assert(new URL(page.url()).hash.includes('/0/rock/'));
  await page.evaluate(()=>{const p=AM.practiceComposer.generate(0,91,'rock').piece;p.generatorVersion=3;p.style=p.requestedStyle='gothic';p.id='practice-0-gothic-91';p.title='Archived Gothic';delete p.harmonyScale;AM.bookmarks.toggle(p,'keys',AM.practice.link('keys',0,91,'gothic'));window.legacyNotes=JSON.stringify(p.sections);});
  await page.goto(base+'/#/practice/keys/0/gothic/91');await ready();assert.equal(await page.inputValue('#practice-style'),'gothic');assert.equal(await page.evaluate(()=>JSON.stringify(AM.repertoire.current.piece.sections)===legacyNotes),true);
  await page.click('#practice-new');await page.waitForFunction(()=>AM.repertoire.current?.piece.style==='rock');await ready();await page.evaluate(()=>AM.bookmarks.remove('practice-0-gothic-91:keys'));
  assert.equal(pdfRequests.length,0,'PDF assets stay unloaded until a PDF is requested');
  for(const [grade,seed] of [[1,11],[3,11],[5,6],[5,11]]){
   await go('keys',grade,seed,'blues');assert((await page.locator('.practice-description').innerText()).includes('12-Takt-Blues'));
   const pending=page.waitForEvent('download');await page.click('#rep-pdf');const file=await pending,pdf=fs.readFileSync(await file.path());assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,1);await file.saveAs(`test-results/practice-blues-grade${grade}-seed${seed}.pdf`);
  }
  await go('keys',3,17);
  const original=await page.evaluate(()=>({url:location.hash,bytes:[...AM.repertoire.current.bytes],id:AM.repertoire.current.piece.id}));
  await page.click('#piece-bookmark');assert.equal(await page.getAttribute('#piece-bookmark','aria-pressed'),'true');
  await page.reload();await ready();assert.deepEqual(await page.evaluate(()=>[...AM.repertoire.current.bytes]),original.bytes);assert.equal(await page.getAttribute('#piece-bookmark','aria-pressed'),'true');
  await page.selectOption('#rep-part',await page.locator('#rep-part option').first().getAttribute('value'));await ready();assert.deepEqual(await page.evaluate(()=>[...AM.repertoire.current.bytes]),original.bytes);assert.equal(await page.getAttribute('#piece-bookmark','aria-pressed'),'false','bookmarks are per instrument');
  await page.goto(base+'/#/bookmarks');await page.waitForSelector('.bookmark-card');await page.click('.bookmark-card summary');
  await page.fill('.bookmark-edit [name=name]','Groovegefühl');await page.fill('.bookmark-edit [name=note]','<img src=x onerror=alert(1)> Schöner Bass\n=SUM(1,2)');await page.click('.bookmark-edit button');
  await page.waitForFunction(()=>document.querySelector('.bookmark-open')?.textContent==='Groovegefühl');assert.equal(await page.locator('.bookmark-card img,.bookmark-card script').count(),0);
  const saved=await page.evaluate(()=>AM.bookmarks.all());
  const jsonDownload=page.waitForEvent('download');await page.click('#bookmarks-json');const jsonFile=await jsonDownload,backup=fs.readFileSync(await jsonFile.path());
  assert.equal(JSON.parse(backup).bookmarks[0].piece.sections.length,saved[0].piece.sections.length);assert(JSON.parse(backup).bookmarks[0].analysis.progressions.length);
  const csvDownload=page.waitForEvent('download');await page.click('#bookmarks-csv');const csvFile=await csvDownload;assert(fs.readFileSync(await csvFile.path(),'utf8').includes('Schöner Bass'));
  const fresh=await browser.newContext(),other=await fresh.newPage();await other.goto(base+'/#/bookmarks');await other.waitForSelector('#bookmarks-import',{state:'attached'});
  await other.setInputFiles('#bookmarks-import',{name:'backup.json',mimeType:'application/json',buffer:backup});await other.waitForSelector('.bookmark-card');assert.deepEqual(await other.evaluate(()=>AM.bookmarks.all()),saved);
  await other.setInputFiles('#bookmarks-import',{name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"schema":"wrong"}')});await other.waitForFunction(()=>document.querySelector('#bookmarks-status').textContent.includes('JSON'));assert.deepEqual(await other.evaluate(()=>AM.bookmarks.all()),saved);
  await other.evaluate(()=>AM.practiceComposer.generate=()=>{throw Error('Generator changed');});await other.click('.bookmark-open');await other.waitForSelector('#repertoire-piece[data-ready]');assert.deepEqual(await other.evaluate(()=>[...AM.repertoire.current.bytes]),original.bytes,'saved score opens without regenerating');await other.selectOption('#rep-part',await other.locator('#rep-part option').first().getAttribute('value'));await other.waitForFunction(()=>AM.repertoire.current?.instrument==='guitar'&&document.querySelector('#repertoire-piece[data-ready]'));assert.deepEqual(await other.evaluate(()=>[...AM.repertoire.current.bytes]),original.bytes,'switching instruments preserves the complete saved composition');await fresh.close();
  await page.click('.bookmark-open');await ready();await page.click('#practice-new');await ready();await page.waitForFunction(id=>AM.repertoire.current.piece.id!==id,original.id);assert.equal(await page.getAttribute('#piece-bookmark','aria-pressed'),'false');
  await page.selectOption('#practice-style','rock');await page.waitForFunction(()=>AM.repertoire.current?.piece.requestedStyle==='rock');await ready();await page.selectOption('#practice-grade','5');await page.waitForFunction(()=>AM.repertoire.current?.piece.grade===5);await ready();
  await page.reload();await ready();assert.equal(await page.inputValue('#practice-style'),'rock');assert.equal(await page.inputValue('#practice-grade'),'5');
  await page.goto(base+'/#/midi');await page.waitForSelector('#connect');await page.click('#connect');await page.selectOption('#output','band');await page.selectOption('[data-midi-route="9"]','drums');await page.selectOption('[data-midi-route="3"]','band');
  await page.reload();await page.waitForFunction(()=>AM.audio.out.port?.id==='band');assert.equal(await page.inputValue('#output'),'band');assert.equal(await page.inputValue('[data-midi-route="9"]'),'drums');
  await page.evaluate(()=>localStorage.setItem('test-midi-offline','drums'));await page.reload();await page.waitForFunction(()=>AM.audio.out.port?.id==='band');assert.equal(await page.inputValue('[data-midi-route="9"]'),'drums');assert.match(await page.locator('[data-midi-route="9"] option:checked').innerText(),/getrennt/);
  await page.evaluate(()=>{ports.get('drums').state='connected';access.onstatechange();localStorage.removeItem('test-midi-offline');});
  for(const instrument of ['guitar','keys','bass','drums']){
   await go(instrument,0,321);await page.selectOption('#rep-output','midi');await page.selectOption('#rep-arrangement','band');await page.uncheck('#rep-count');await page.evaluate(()=>sent=[]);await page.locator('[data-transport=practice]').click();await page.waitForTimeout(250);
   const sent=await page.evaluate(()=>window.sent),own=({guitar:6,keys:3,bass:5,drums:9})[instrument],otherCh=instrument==='guitar'?3:6;
   assert(!sent.some(e=>e.data?.[0]===(144|own)));assert(sent.some(e=>e.data?.[0]===(144|otherCh)));if(instrument!=='drums')assert(sent.some(e=>e.id==='drums'&&e.data?.[0]===153));
   await page.locator('[data-transport=practice]').click();assert((await page.evaluate(()=>window.sent)).some(e=>e.data?.[1]===120));
  }
  await go('keys',2,42);assert.equal(await page.inputValue('#rep-output'),'midi');await page.selectOption('#rep-arrangement','solo');await page.check('#rep-count');await page.evaluate(()=>sent=[]);await page.locator('[data-transport=listen]').click();await page.waitForTimeout(150);
  assert((await page.evaluate(()=>sent)).some(e=>e.data?.[0]===153&&e.data[1]===37),'solo retains audible count-in');await page.locator('[data-transport=listen]').click();await page.uncheck('#rep-count');await page.evaluate(()=>sent=[]);await page.locator('[data-transport=listen]').click();await page.waitForTimeout(150);
  assert((await page.evaluate(()=>sent)).filter(e=>e.data?.[0]>>4===9&&e.data[2]>0).every(e=>e.data[0]===147),'solo plays only the selected instrument');await page.locator('[data-transport=listen]').click();
  await page.selectOption('#rep-output','browser');await page.selectOption('#rep-arrangement','band');await page.locator('[data-transport=listen]').click();await page.waitForFunction(()=>document.querySelector('[data-transport=listen]').dataset.playing==='playing');await page.locator('[data-transport=listen]').click();
  await page.evaluate(()=>{window.originals={play:AM.soundfont.play,stop:AM.soundfont.stop,time:Object.getOwnPropertyDescriptor(AM.soundfont,'currentTime')};window.testPosition=0;AM.soundfont.play=async bytes=>{window.playedSequence=AM.midi.decode(bytes);};AM.soundfont.stop=()=>{};Object.defineProperty(AM.soundfont,'currentTime',{configurable:true,get:()=>testPosition});});
  await page.locator('[data-transport=listen]').click();await page.waitForFunction(()=>document.querySelector('[data-transport=listen]').dataset.playing==='playing');
  for(const marker of await page.evaluate(()=>AM.repertoire.current.sequence.markers)){
   await page.evaluate(t=>testPosition=t,marker.t+.05);await page.waitForFunction(label=>document.querySelectorAll('.rep-section.current').length===1&&document.querySelector('.rep-section.current h2').textContent.trim().startsWith(label+' '),marker.label);
  }
  await page.locator('[data-transport=listen]').click();await page.evaluate(()=>{AM.soundfont.play=originals.play;AM.soundfont.stop=originals.stop;Object.defineProperty(AM.soundfont,'currentTime',originals.time);});
  const midiDownload=page.waitForEvent('download');await page.locator('.rep-downloads a[download]').click();const midiFile=await midiDownload;assert.equal(fs.readFileSync(await midiFile.path()).subarray(0,4).toString(),'MThd');
  await page.setViewportSize({width:390,height:844});
  for(const instrument of ['guitar','keys','bass','drums'])for(let grade=0;grade<6;grade++){
   await go(instrument,grade,900+grade,'progressive');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert((await page.locator('.rep-section .svg').evaluateAll(es=>es.map(e=>e.querySelectorAll('.measure').length))).every(n=>n>0&&n<=4));
  }
  await page.screenshot({path:'test-results/practice-mobile.png',fullPage:true});assert(pdfRequests.length>0,'blues PDF checks loaded the PDF assets');
  await page.reload();await ready();await page.route('**/assets/vendor/pdfmake/pdfmake.min.js',r=>r.abort());await page.click('#rep-pdf');await page.waitForFunction(()=>!document.querySelector('#rep-pdf').disabled&&document.querySelector('.rep-status').textContent.includes('Bitte erneut versuchen'));await page.unroute('**/assets/vendor/pdfmake/pdfmake.min.js');
  await page.setViewportSize({width:1920,height:1200});
  for(const language of ['de','en']){
   await page.selectOption('#language',language);
   for(const instrument of ['guitar','keys','bass','drums'])for(let grade=0;grade<6;grade++){
    await go(instrument,grade,900+grade,grade%2?'rock':'progressive');const pending=page.waitForEvent('download');await page.click('#rep-pdf');const file=await pending;await file.saveAs(`test-results/practice-${instrument}-grade${grade}-${language}.pdf`);
    assert(file.suggestedFilename().includes(new URL(page.url()).hash.split('/').at(-1)));const pdf=fs.readFileSync(await file.path());assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,1,'variable form fits one page');
    assert.deepEqual(await page.evaluate(()=>({print:printCalls,popups:popupCalls})),{print:0,popups:0});
   }
  }
  await go('keys',5,11);await page.screenshot({path:'test-results/practice-desktop.png',fullPage:true});assert.equal(popups,0);assert.deepEqual(errors,[]);
  console.log('PASS 240 available style/grade/instrument/language combinations, grade-dependent styles and legacy scores, four blues PDFs, immutable bookmarks with JSON/CSV backup and import, MIDI persistence/reconnect, solo/band playback, variable forms, four-bar rows and 48 single-page direct PDF downloads');
 }finally{await context.close();}
};
