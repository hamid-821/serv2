'use strict';
// Run inside the selected Node environment, not through a public HTTP route.
const {resolve}=require('node:path');
const {mkdirSync,writeFileSync,readFileSync,unlinkSync,existsSync}=require('node:fs');
const {randomUUID}=require('node:crypto');
try{process.loadEnvFile(resolve(__dirname,'../.env'));}catch(e){if(e.code!=='ENOENT')throw e;}
const report={node:process.versions.node,platform:process.platform,sqlite:false,wal:false,persistentDirectoryWritable:false};
let db,file;
try{
 const [major,minor]=process.versions.node.split('.').map(Number);if(!((major===22&&minor>=13)||major===24))throw new Error('Select Node 22.13+ (22.x) or 24.x.');
 const {DatabaseSync}=require('node:sqlite');report.sqlite=true;
 const directory=resolve(process.env.DATA_DIR||resolve(__dirname,'../data'));mkdirSync(directory,{recursive:true});file=resolve(directory,'host-probe-'+randomUUID()+'.sqlite');db=new DatabaseSync(file);
 const result=db.prepare('PRAGMA journal_mode=WAL').get();report.wal=Object.values(result)[0]==='wal';db.exec('CREATE TABLE probe(value TEXT); INSERT INTO probe VALUES (\'ok\')');db.close();db=new DatabaseSync(file);report.persistentDirectoryWritable=db.prepare('SELECT value FROM probe').get().value==='ok';db.close();db=null;
 if(!report.wal)throw new Error('WAL mode is unavailable.');report.localChecksPassed=true;
 report.notVerified=['process stays running when idle','exact RAM/CPU/concurrent connections','SSE through host proxy','provider backup and disk durability','HTTPS connectivity to Google'];
}catch(e){report.error=e.message;process.exitCode=1;}finally{if(db)try{db.close();}catch{}if(file)for(const suffix of ['','-wal','-shm'])if(existsSync(file+suffix))unlinkSync(file+suffix);}
console.log(JSON.stringify(report,null,2));
