import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const catalog=JSON.parse(fs.readFileSync('data/repertoire.json'));
const server=spawn('python3',['-m','http.server','8769','--bind','127.0.0.1'],{stdio:'ignore'}),base='http://127.0.0.1:8769';
let browser;
try{
  let available=false;for(let i=0;i<100;i++){try{available=(await fetch(base)).ok;}catch{}if(available)break;await new Promise(r=>setTimeout(r,30));}if(!available)throw Error('Score server unavailable');
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:760,height:1080}});page.on('pageerror',e=>{throw e;});await page.addInitScript(()=>localStorage.setItem('a-minor-language','en'));await page.emulateMedia({media:'print'});
  for(const piece of catalog.pieces)for(const role of ['guitar','keys']){
    await page.goto(base+'/#/piece/'+role+'/'+piece.id);await page.waitForSelector('#repertoire-piece[data-ready]');
    await page.evaluate(()=>AM.repertoire.resize());
    const instrument=role==='guitar'?'Guitar':'Keyboard';
    await page.evaluate(({instrument})=>{const p=document.createElement('p');p.className='lead';p.textContent=instrument==='Guitar'?'P4 · E2 A2 D3 G3 C4 F4 · pick':'49 keys · C2–C6';document.querySelector('#repertoire-piece h1').after(p);},{instrument});
    await page.pdf({path:piece.dir+'/'+piece.title+' '+instrument+'.pdf',format:'A4',preferCSSPageSize:true,printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:`<div style="width:100%;font:8px sans-serif;color:#777;text-align:center">a-minor · ${piece.title} · ${instrument} · <span class="pageNumber"></span>/<span class="totalPages"></span></div>`});
  }
  console.log(`Built ${catalog.pieces.length} × 2 = ${catalog.pieces.length*2} PDF parts`);
}finally{await browser?.close();server.kill();}
