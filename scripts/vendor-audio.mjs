import fs from 'node:fs';
import path from 'node:path';
const clean = text => text.replace(/[ \t]+$/gm,'').trimEnd()+'\n';
const root = 'assets/vendor';fs.mkdirSync(root,{recursive:true});
for (const [pkg,name] of [['spessasynth_lib','spessasynth'],['spessasynth_core','spessasynth-core'],['stb-vorbis','stb-vorbis']]) {
  let code = fs.readFileSync(`node_modules/${pkg}/dist/index.js`,'utf8').replace('from "spessasynth_core"','from "./spessasynth-core.js"').replace('from "stb-vorbis"','from "./stb-vorbis.js"').replace(/\/\/# sourceMappingURL=.*$/gm,'');
  fs.writeFileSync(path.join(root,name+'.js'),clean(code));
  fs.copyFileSync(`node_modules/${pkg}/LICENSE`,path.join(root,name+'-LICENSE'));
}
fs.writeFileSync(path.join(root,'spessasynth_processor.min.js'),clean(fs.readFileSync('node_modules/spessasynth_lib/dist/spessasynth_processor.min.js','utf8')));
fs.writeFileSync(path.join(root,'versions.json'),JSON.stringify(Object.fromEntries(['spessasynth_lib','spessasynth_core','stb-vorbis'].map(p=>[p,JSON.parse(fs.readFileSync(`node_modules/${p}/package.json`)).version])),null,2)+'\n');
