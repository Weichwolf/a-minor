const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const base = 'http://127.0.0.1:8766';
const server = spawn('python3',['-m','http.server','8766','--bind','127.0.0.1'],{stdio:'ignore'});
(async () => {
  let browser;
  try {
    for (let i=0;i<100;i++) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise(r => setTimeout(r,30)); }
    browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    await require('./piano-browser.cjs')(browser,base);
    const context = await browser.newContext(), page = await context.newPage(), errors=[];
    page.on('pageerror',e => errors.push(e.message)); page.on('dialog',() => { throw Error('Unexpected dialog'); });
    await page.addInitScript(() => {
      window.sent=[];
      window.port={id:'test',name:'Test <device>',state:'connected',connection:'closed',send:(bytes,t) => { window.sent.push({bytes:[...bytes],t}); if (window.port.connection === 'closed') { window.port.connection='open'; setTimeout(() => window.access.onstatechange?.(),0); } },clear:() => window.sent.push({clear:true})};
      window.access={outputs:new Map([['test',window.port]])};
      Object.defineProperty(navigator,'requestMIDIAccess',{value:async()=>window.access});
    });
    await page.goto(base); await page.waitForSelector('.tracks');
    assert.equal(await page.locator('html').getAttribute('lang'),'de');
    assert.equal(await page.locator('a[href="#/sync"]').count(),0);
    await page.goto(base+'/#/unit/u1-pedal');await page.waitForSelector('svg.score');
    assert.equal(await page.locator('svg.score .staff').count(),5);
    assert.equal(await page.locator('[data-aid]:checked').count(),0);
    await page.locator('.play').first().click();assert.match(await page.locator('.player .status').first().innerText(),/MIDI/);
    await page.selectOption('#language','en');assert.equal(await page.locator('h1').innerText(),'Pedal note and melody');
    await page.locator('[data-done]').first().check();
    await page.locator('details.log summary').first().click();await page.locator('input[name=note]').first().fill('<img src=x onerror=alert(1)> deliberate rest');await page.locator('form[data-log] button').first().click();
    await page.waitForTimeout(60);assert.equal(new URL(page.url()).hash,'#/unit/u1-pedal#e1-pedal-1');
    assert.equal(await page.locator('article img').count(),0);
    await page.reload();await page.waitForSelector('svg.score');assert.equal(await page.locator('html').getAttribute('lang'),'en');assert(await page.locator('[data-done]').first().isChecked());
    await page.goto(base+'/#/log');await page.waitForSelector('#exp');
    const downloadPromise=page.waitForEvent('download');await page.locator('#exp').click();const download=await downloadPromise, backup=fs.readFileSync(await download.path());
    const saved=JSON.parse(backup);assert(saved.done['e1-pedal-1']);assert(saved.log.some(e=>e.note.includes('<img')));
    await page.locator('#imp').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"log":{},"done":{}}')});
    await page.waitForFunction(()=>document.querySelector('#import-status').textContent.length>0);
    assert.deepEqual(await page.evaluate(()=>AM.store.get()),saved);
    const restored=await browser.newContext(), other=await restored.newPage();await other.goto(base+'/#/log');await other.waitForSelector('#imp',{state:'attached'});
    await other.locator('#imp').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:backup});
    await other.waitForFunction(()=>AM.store.isDone('e1-pedal-1'));assert.deepEqual(await other.evaluate(()=>AM.store.get()),saved);await restored.close();
    console.log('PASS language persistence, progress, safe text, backup and restore');
    await page.goto(base+'/#/midi');await page.waitForSelector('#connect');await page.locator('#connect').click();await page.waitForSelector('#output option[value=test]',{state:'attached'});await page.selectOption('#output','test');
    await page.locator('.play').click();await page.waitForTimeout(180);
    assert.equal(await page.locator('.play').innerText(),'■ Stop');
    assert(await page.evaluate(()=>sent.some(x=>x.bytes?.[0]===0x99)));
    await page.locator('.play').click();assert(await page.evaluate(()=>sent.some(x=>x.clear)));
    await page.locator('.play').click();await page.evaluate(()=>{port.state='disconnected';access.onstatechange();});assert.equal(await page.locator('.play').innerText(),'▶ Start');
    await page.evaluate(()=>{port.state='connected';access.onstatechange();});await page.selectOption('#output','test');
    await page.goto(base+'/#/unit/u0-4');await page.waitForSelector('.player');await page.locator('.play').first().click();await page.selectOption('#language','de');
    assert.equal(await page.locator('.play').first().innerText(),'▶ Start');
    console.log('PASS MIDI channel output, implicit port opening, stop, disconnect and language change');
    const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/course.json'),'utf8'));
    const unitIds=Object.values(data).flatMap(t=>t.phases.flatMap(p=>p.units.map(u=>u.id)));
    for(const lang of ['de','en']) {
      await page.selectOption('#language',lang);
      for(const id of unitIds) {
        await page.goto(base+'/#/unit/'+id);await page.waitForSelector('h1');await page.waitForTimeout(12);
        const text=await page.locator('main').innerText();assert(!/undefined|NaN/.test(text),id);
        assert.equal(await page.locator('svg [cx="NaN"], svg [cy="NaN"]').count(),0,id);
      }
    }
    await page.goto(base+'/#/unit/u1-pedal');await page.waitForSelector('svg.score');
    fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/pedal-desktop.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});await page.goto(base+'/#/unit/u0-6');await page.waitForSelector('svg.score');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:'test-results/pedal-mobile.png',fullPage:true});
    for (const id of ['u0-3','ku1-1','ku0-4']) {
      await page.goto(base+'/#/unit/'+id);await page.waitForSelector('svg.score');
      await page.locator('details.diagram').evaluateAll(items=>items.forEach(e=>e.open=true));
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id + ': expanded mobile aids');
    }
    await page.screenshot({path:'test-results/keyboard-mobile.png',fullPage:true});
    await page.selectOption('#language','de');
    for (const id of ['u5-2','ku5-3','u7-1','u7-3','u7-solo','u6-7','u7-6','ku8-6']) {
      await page.goto(base+'/#/unit/'+id);await page.waitForSelector('svg.score');
      assert.deepEqual(await page.locator('.player select').first().locator('option').allTextContents(),['Klick','Drums']);
      assert.match(await page.locator('.player label').nth(1).innerText(),/^Begleitung/);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id);
      await page.locator('.listen').first().click();
      assert.equal(await page.locator('.listen[data-playing]').count(),1,id);
      await page.locator('.player input').first().fill('72');await page.locator('.player input').first().dispatchEvent('change');
      assert.equal(await page.locator('.listen[data-playing]').count(),0,id);
      await page.locator('svg.score').first().screenshot({path:'test-results/'+id+'-mobile.png'});
    }
    await page.setViewportSize({width:1280,height:900});await page.waitForTimeout(100);
    await page.locator('svg.score').first().screenshot({path:'test-results/final-keyboard-desktop.png'});
    console.log('PASS advanced scores, accompaniment labels, mobile wrapping and preview cancellation');
    await page.goto(base+'/#/unit/u6-4');await page.waitForSelector('.harmonic-reference');
    assert.match(await page.locator('.harmonic-reference').first().textContent(),/Bass: E2/);
    await page.goto(base+'/#/unit/u1-pedal');await page.waitForSelector('.harmonic-reference');
    assert.match(await page.locator('.harmonic-reference').first().textContent(),/Pedalton: E2/);
    await page.selectOption('#language','en');
    assert.match(await page.locator('.harmonic-reference').first().textContent(),/Pedal tone: E2/);
    await page.setViewportSize({width:390,height:844});
    assert(await page.locator('svg.score').first().evaluate(svg=>{
      const label=svg.querySelector('.harmonic-reference').getBBox();
      return [...svg.querySelectorAll('.head,.stem,.rest')].every(n=>{const b=n.getBBox();return b.y+b.height<label.y;});
    }),'bass references clear the lowest notes and stems');
    await page.screenshot({path:'test-results/pedal-references-mobile.png',fullPage:true});
    await page.goto(base+'/#/unit/nonexistent');await page.waitForSelector('.tracks');
    assert.deepEqual(errors,[]);console.log('PASS every unit in both languages, mobile layout and unknown route');
  } finally { await browser?.close(); server.kill(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
