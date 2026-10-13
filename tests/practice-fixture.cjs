const fs=require('node:fs'),vm=require('node:vm');
module.exports=()=>{
 const storage=new Map(),c=vm.createContext({console,TextEncoder,TextDecoder,Uint8Array,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},location:{href:'https://a-minor.ch/'},crypto:{getRandomValues:a=>{a[0]=77;return a;}}});c.window=c;
 for(const name of ['music','glyphs','notation','midi','practice-generator','practice-rhythm','practice-curriculum','practice-phrasing','practice-composer','practice-info','bookmarks','practice'])vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),c);
 c.AM.i18n={t:k=>JSON.parse(fs.readFileSync('locales/de.json')).ui[k]};c.AM.storage=storage;return c.AM;
};
module.exports.plain=x=>JSON.parse(JSON.stringify(x));
