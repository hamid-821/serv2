import {mkdirSync,writeFileSync,readFileSync,readdirSync,existsSync,unlinkSync,rmdirSync,lstatSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
export function buildVercel({backend=process.env.BACKEND_ORIGIN,output=resolve('.vercel/output'),allowLocal=false}={}){
 if(!backend)throw new Error('Set BACKEND_ORIGIN in Vercel to your persistent backend HTTPS origin, e.g. https://your-game.onrender.com. SQLite cannot run as a Vercel Function. See docs/DEPLOY.md.');
 const url=new URL(backend);if((url.protocol!=='https:'&&!(allowLocal&&url.protocol==='http:'))||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('BACKEND_ORIGIN must be an HTTPS origin without a path, query or credentials.');
 const project=resolve('.'),target=resolve(output);if(!target.startsWith(project+sep)||target===project)throw new Error('Build output must stay inside the project.');
 if(existsSync(target)&&!target.endsWith(sep+'output'))throw new Error('Refusing to replace a directory not named output.');
 const clean=dir=>{for(const entry of readdirSync(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isDirectory()&&!entry.isSymbolicLink()){clean(path);rmdirSync(path);}else unlinkSync(path);}};
 if(existsSync(target)){if(lstatSync(target).isSymbolicLink())throw new Error('Output must not be a symlink.');clean(target);}mkdirSync(target,{recursive:true});
 const copy=(source,dest)=>{mkdirSync(dest,{recursive:true});for(const entry of readdirSync(source,{withFileTypes:true})){if(entry.isSymbolicLink())throw new Error('Public assets must not contain symlinks.');const from=resolve(source,entry.name),to=resolve(dest,entry.name);if(entry.isDirectory())copy(from,to);else writeFileSync(to,readFileSync(from));}};
 copy(resolve('public'),resolve(target,'static'));
 const headers={'Cache-Control':'no-store','CDN-Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store'};
 const config={version:3,routes:[
  {src:'/(api|auth|uploads)(/.*)?',dest:url.origin+'/$1$2',headers},
  {src:'/health',dest:url.origin+'/health',headers},
  {src:'/.*',headers:{'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self' blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com"},continue:true},
  {src:'/(sw\\.js|index\\.html|.*\\.js|.*\\.css)',headers:{'Cache-Control':'public, max-age=0, must-revalidate'},continue:true},
  {handle:'filesystem'},{src:'/',dest:'/index.html'}]};
 writeFileSync(resolve(target,'config.json'),JSON.stringify(config,null,2));console.log('Vercel static frontend + persistent API proxy built. No database or private data copied.');return config;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))buildVercel();
