import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const path='engine/tremor-vs-upstream.patch',snapshot='engine/tremor-vs-upstream.json';
const hash=data=>createHash('sha256').update(data).digest('hex');
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(dir+'/'+e.name):[dir+'/'+e.name]);}
const tree=()=>Object.fromEntries(files('engine/doomgeneric').sort().map(p=>[p,hash(/\.(c|h|md|txt|sh|yml|json|gitignore|gitattributes)$/.test(p)||/Makefile/.test(p)?readFileSync(p).toString('utf8').replace(/\r\n/g,'\n'):readFileSync(p))]));
if(process.argv.includes('--check')){
 const saved=JSON.parse(readFileSync(snapshot,'utf8'));
 if(saved.patchSha256!==hash(readFileSync(path))||JSON.stringify(saved.files)!==JSON.stringify(tree()))throw Error('Upstream patch is stale: npm run upstream:patch in the Tremor repository');
}else{
 const patch=execFileSync('git',['diff','--no-ext-diff','--no-color','--binary','821957f','--','engine/doomgeneric'],{encoding:'utf8'}).replace(/\r\n/g,'\n');
 writeFileSync(path,patch);
 writeFileSync(snapshot,JSON.stringify({pristineCommit:'821957f',patchSha256:hash(patch),files:tree()},null,2)+'\n');
}
