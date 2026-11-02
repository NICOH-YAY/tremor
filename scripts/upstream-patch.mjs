import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const path='engine/tremor-vs-upstream.patch',snapshot='engine/tremor-vs-upstream.json';
// Git treats NUL-containing files as binary; preserve those bytes (screenshots).
export function hash(data){
 const bytes=Buffer.from(data);
 return createHash('sha256').update(bytes.includes(0)?bytes:bytes.toString('utf8').replace(/\r\n/g,'\n')).digest('hex');
}
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(dir+'/'+e.name):[dir+'/'+e.name]);}
export function tree(paths=files('engine/doomgeneric'),read=readFileSync){
 return Object.fromEntries(paths.map(p=>p.replace(/\\/g,'/')).sort().map(p=>[p,hash(read(p))]));
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
if(process.argv.includes('--check')){
 const saved=JSON.parse(readFileSync(snapshot,'utf8'));
 if(saved.patchSha256!==hash(readFileSync(path))||JSON.stringify(saved.files)!==JSON.stringify(tree()))throw Error('Upstream patch is stale: npm run upstream:patch in the Tremor repository');
}else{
 const patch=execFileSync('git',['diff','--no-ext-diff','--no-color','--binary','821957f','--','engine/doomgeneric'],{encoding:'utf8'}).replace(/\r\n/g,'\n');
 writeFileSync(path,patch);
 writeFileSync(snapshot,JSON.stringify({pristineCommit:'821957f',patchSha256:hash(patch),files:tree()},null,2)+'\n');
}
}
