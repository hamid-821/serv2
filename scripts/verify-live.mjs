import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const digest=v=>createHash('sha256').update(v).digest('hex');
const base='http://localhost:3000';
const app=await fetch(base+'/app.js',{signal:AbortSignal.timeout(10000)});
if(!app.ok||digest(Buffer.from(await app.arrayBuffer()))!==digest(readFileSync('public/app.js')))throw new Error('Port 3000 is not serving this workspace app.js; do not stop its process.');
const bootstrap=await fetch(base+'/api/bootstrap').then(r=>r.json());
console.log(JSON.stringify({workspaceAssetMatches:true,categories:bootstrap.categories?.length,googleConfigured:bootstrap.googleEnabled}));
if(process.argv.includes('--full')){
 for(const path of ['/api/platform/lobby','/api/platform/spaces','/api/leagues','/api/daily','/responsive.css','/daily.js','/stories.js','/admin-platform.js','/assets/icon-192.png','/assets/icon-512.png','/manifest.webmanifest','/templates/gamify-2-questions.xlsx']){const r=await fetch(base+path);if(!r.ok)throw new Error(path+' returned '+r.status);console.log(r.status,path);}
}
