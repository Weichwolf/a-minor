const assert=require('node:assert/strict');
module.exports=async(browser,base)=>{
 const context=await browser.newContext(),page=await context.newPage();
 try{
  await page.goto(base+'/#/practice/keys/1/rock');await page.waitForSelector('#practice-new');
  const read=()=>page.evaluate(()=>({hash:location.hash,counts:JSON.parse(localStorage.getItem('a-minor-practice-selection'))}));
  const first=await read();assert.equal(Object.values(first.counts['keys:1:rock']).reduce((a,b)=>a+b,0),1);
  await page.locator('#practice-new').click();await page.waitForFunction(hash=>location.hash!==hash,first.hash);await page.waitForSelector('#practice-new');
  const second=await read();assert.equal(Object.values(second.counts['keys:1:rock']).reduce((a,b)=>a+b,0),2);
  assert.notEqual(first.hash,second.hash);
  await page.reload();await page.waitForSelector('#practice-new');assert.deepEqual(await read(),second);
  await page.goto(base+'/'+first.hash);await page.waitForSelector('#practice-new');assert.deepEqual((await read()).counts,second.counts);
  console.log('PASS balanced selection on first opening and new piece; reload and existing URLs preserve selection counts');
 }finally{await context.close();}
};
