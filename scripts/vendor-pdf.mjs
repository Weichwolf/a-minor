import fs from 'node:fs';
const root = 'assets/vendor/pdfmake';
fs.mkdirSync(root,{recursive:true});
for (const name of ['pdfmake.min.js']) {
  const code = fs.readFileSync('node_modules/pdfmake/build/'+name,'utf8').replace(/\/\/# sourceMappingURL=.*$/gm,'').trimEnd()+'\n';
  fs.writeFileSync(root+'/'+name,code);
}
fs.copyFileSync('node_modules/pdfmake/LICENSE',root+'/LICENSE');
fs.copyFileSync('node_modules/pdfmake/src/3rd-party/svg-to-pdfkit/LICENSE',root+'/svg-to-pdfkit-LICENSE');
const {version} = JSON.parse(fs.readFileSync('node_modules/pdfmake/package.json'));
const vfs = Object.fromEntries(['DejaVuSans.ttf','DejaVuSans-Bold.ttf'].map(name => [name,fs.readFileSync('node_modules/dejavu-fonts-ttf/ttf/'+name).toString('base64')]));
const fonts = {DejaVuSans:{normal:'DejaVuSans.ttf',bold:'DejaVuSans-Bold.ttf',italics:'DejaVuSans.ttf',bolditalics:'DejaVuSans-Bold.ttf'}};
fs.writeFileSync(root+'/vfs_fonts.js','pdfMake.addVirtualFileSystem('+JSON.stringify(vfs)+');\npdfMake.addFonts('+JSON.stringify(fonts)+');\n');
fs.copyFileSync('node_modules/dejavu-fonts-ttf/LICENSE',root+'/DejaVu-LICENSE');
const fontVersion = JSON.parse(fs.readFileSync('node_modules/dejavu-fonts-ttf/package.json')).version;
fs.writeFileSync(root+'/version.json',JSON.stringify({pdfmake:version,'dejavu-fonts-ttf':fontVersion},null,2)+'\n');
