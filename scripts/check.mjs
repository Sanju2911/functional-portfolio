import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),dist=path.join(root,'dist');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
const files=walk(dist);let scripts=0,links=0;
for(const file of files){
  if(file.endsWith('.js')){execFileSync(process.execPath,['--check',file],{stdio:'pipe',windowsHide:true});scripts++;}
  if(file.endsWith('.html')){
    const html=fs.readFileSync(file,'utf8');
    for(const [,url] of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
      if(/^(?:[a-z]+:|\/\/|#)/i.test(url))continue;
      const raw=url.split(/[?#]/)[0];if(!raw)continue;
      let target=raw.startsWith('/')?path.join(dist,raw):path.resolve(path.dirname(file),raw);
      if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
      if(!fs.existsSync(target))throw Error(`Broken local reference in ${path.relative(root,file)}: ${raw}`);
      links++;
    }
  }
}
for(const file of [...files,...walk(path.join(root,'database'))]){
  if(!/\.(?:js|mjs|cjs|html|sql|json|css)$/.test(file))continue;
  const text=fs.readFileSync(file,'utf8');
  if(/(?:sb_secret_[A-Za-z0-9_-]+|github_pat_[A-Za-z0-9_]+|ghp_[A-Za-z0-9]+|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/.test(text))throw Error(`Private credential pattern in ${path.relative(root,file)}`);
}
const config=JSON.parse(fs.readFileSync(path.join(root,'firebase.json'),'utf8'));
if(config.hosting.public!=='dist'||config.hosting.site!=='portfolio-0129')throw Error('Unexpected Firebase deployment target');
execFileSync(process.execPath,[path.join(root,'database/test-project-covers.cjs')],{stdio:'inherit',windowsHide:true});
console.log(`PASS: ${scripts} JavaScript files parse, ${links} local HTML references resolve, source credential scan is clean, and Firebase target is explicit.`);
