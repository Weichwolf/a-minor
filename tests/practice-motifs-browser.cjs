const assert=require('node:assert/strict'),fs=require('node:fs');
module.exports=async(browser,base)=>{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'/#/practice/keys/3/rock/11');await page.waitForSelector('#repertoire-piece[data-ready]');
  const cases=await page.evaluate(()=>AM.practiceComposer.styles.map(style=>{
   const grade=Math.max(3,AM.practiceComposer.styleGrade(style));let seed=0;
   while(!AM.practiceMotifs.plan(grade,seed,style).accent)seed++;
   return{style,grade,seed};
  }));
  for(const {style,grade,seed} of cases){
   await page.goto(base+`/#/practice/keys/${grade}/${style}/${seed}`);await page.waitForSelector('#repertoire-piece[data-ready]');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const p=await page.evaluate(()=>AM.repertoire.current.piece);assert(p.musicalAccent);assert.equal(p.generatorVersion,5);assert.equal(p.style,style);
   if(style==='blues'){
    assert(p.sections.some(s=>s.name==='B′'));assert.equal(p.uniqueBars,20);
    const index=p.sections.findIndex(s=>s.name==='B′');await page.selectOption('#rep-section',String(index));assert((await page.locator('#rep-section option:checked').innerText()).startsWith('B′'));
   }
   await page.click('#piece-bookmark');await page.reload();await page.waitForSelector('#repertoire-piece[data-ready]');
   assert.deepEqual(await page.evaluate(()=>AM.repertoire.current.piece),p);assert.equal(await page.getAttribute('#piece-bookmark','aria-pressed'),'true');
   await page.setViewportSize({width:1920,height:1200});
   for(const language of ['de','en']){
    await page.selectOption('#language',language);await page.waitForSelector('#repertoire-piece[data-ready]');assert(!/undefined|NaN/.test(await page.locator('main').innerText()));
    const pending=page.waitForEvent('download');await page.click('#rep-pdf');const file=await pending,pdf=fs.readFileSync(await file.path());
    assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,1,style+': motif and answer sections fit one page');
    await file.saveAs(`test-results/practice-motif-${style}-${language}.pdf`);
   }
   await page.selectOption('#language','de');await page.setViewportSize({width:390,height:844});
  }
  assert.deepEqual(errors,[]);console.log('PASS seven style accents, mobile score layout, immutable motif bookmarks, final blues answer and 14 bilingual single-page PDFs');
 }finally{await context.close();}
};
