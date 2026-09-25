import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
let failed=false;for(const dir of ['server','public','tests'])for(const f of readdirSync(dir)){if(!/\.(mjs|js)$/.test(f))continue;const r=spawnSync(process.execPath,['--check',dir+'/'+f],{encoding:'utf8'});if(r.status){failed=true;console.error(dir+'/'+f,r.stderr);}}
if(failed)process.exit(1);console.log('All server, browser and test JavaScript passed syntax checks.');
