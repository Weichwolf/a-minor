const assert=require('node:assert/strict'),fs=require('node:fs');
module.exports=async(browser,base)=>{
 const context=await browser.newContext({viewport:{width:1920,height:1200}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  for(const instrument of ['guitar','keys']){
   await page.goto(base+`/#/practice/${instrument}/4/progressive/1`);await page.waitForSelector('#repertoire-piece[data-ready]');
   const original=await page.evaluate(()=>({piece:AM.repertoire.current.piece,bytes:[...AM.repertoire.current.bytes]}));
   assert(original.piece.sections.some(s=>s.variationOf==='A'));assert(original.piece.uniqueBars>=20);
   assert((await page.locator('.practice-description').innerText()).includes('variierte Rückkehr von A'));
   const index=original.piece.sections.findIndex(s=>s.name==='A′');await page.selectOption('#rep-section',String(index));
   assert((await page.locator('#rep-section option:checked').innerText()).startsWith('A′'));
   await page.click('#piece-bookmark');await page.reload();await page.waitForSelector('#repertoire-piece[data-ready]');
   assert.equal(await page.getAttribute('#piece-bookmark','aria-pressed'),'true');
   assert.deepEqual(await page.evaluate(()=>({piece:AM.repertoire.current.piece,bytes:[...AM.repertoire.current.bytes]})),original);
   const pending=page.waitForEvent('download');await page.click('#rep-pdf');const file=await pending,pdf=fs.readFileSync(await file.path());
   assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length,1,'long varied form and its description fit one page');
   await file.saveAs(`test-results/practice-varied-${instrument}.pdf`);
  }
  assert.deepEqual(errors,[]);console.log('PASS A′ section selection, saved score reload and two one-page PDFs with section descriptions');
 }finally{await context.close();}
};
