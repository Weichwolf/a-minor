const assert=require('node:assert/strict'),fs=require('node:fs');
module.exports=async(browser,base)=>{
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'/#/practice/guitar/5/gothic/49');await page.waitForSelector('#repertoire-piece[data-ready]');
  const seed=await page.evaluate(()=>{
   const C=AM.practiceComposer;
   for(let seed=0;seed<512;seed++)if(C.focusFor(5,seed,'gothic').guitar==='rhythmChart'){
    const p=C.generate(5,seed,'gothic').piece;
    if(p.sections.some(s=>s.bars.some(b=>b.guitar.rhythmSlash)&&s.bars.some(b=>!b.guitar.rhythmSlash)))return seed;
   }
   throw Error('No mixed rhythm-chart row');
  });
  await page.goto(base+'/#/practice/guitar/5/gothic/'+seed);await page.waitForSelector('#repertoire-piece[data-ready]');
  assert(await page.locator('.rhythm-slash').count()>0);assert(await page.locator('.percent-repeat').count()>0);assert(await page.locator('ellipse.head').count()>0);
  const before=await page.evaluate(()=>({seconds:AM.repertoire.current.sequence.duration,tempo:AM.repertoire.current.piece.tempo,text:document.querySelector('#rep-duration').textContent}));
  const clock=seconds=>Math.floor(Math.round(seconds)/60)+':'+String(Math.round(seconds)%60).padStart(2,'0');assert(before.text.includes(clock(before.seconds)));
  await page.fill('#rep-tempo',String(before.tempo/2));assert((await page.locator('#rep-duration').innerText()).includes(clock(before.seconds*2)));
  await page.fill('#rep-tempo','');assert(!/NaN|Infinity/.test(await page.locator('#rep-duration').innerText()));
  await page.fill('#rep-tempo',String(before.tempo));
  const pending=page.waitForEvent('download');await page.click('#rep-pdf');const download=await pending,pdf=fs.readFileSync(await download.path());assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,1);await download.saveAs('test-results/practice-mixed-rhythm-chart.pdf');
  await page.screenshot({path:'test-results/practice-mixed-rhythm-chart.png',fullPage:true});assert.deepEqual(errors,[]);
  console.log('PASS mixed rhythm slashes in rendered score/PDF and duration display at changed tempos');
 }finally{await context.close();}
};
