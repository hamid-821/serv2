import {DatabaseSync} from 'node:sqlite';
import {existsSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const file=resolve('data/gamify.sqlite');if(existsSync(file)){mkdirSync('data/backups',{recursive:true});const db=new DatabaseSync(file);db.exec('PRAGMA busy_timeout=5000');const dest=resolve('data/backups/gamify-'+new Date().toISOString().replace(/[:.]/g,'-')+'.sqlite');db.prepare('VACUUM INTO ?').run(dest);db.close();console.log('Consistent local database backup saved inside data/backups.');}
