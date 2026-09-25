import {SourceTextModule,createContext} from 'node:vm';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
const context=createContext({}),modules=new Map();
function load(path){path=resolve(path);if(!modules.has(path))modules.set(path,new SourceTextModule(readFileSync(path,'utf8'),{context,identifier:path}));return modules.get(path);}
await load('public/app.js').link((specifier,parent)=>{if(!specifier.startsWith('./'))throw new Error('Unexpected external browser module '+specifier);return load(resolve(dirname(parent.identifier),specifier));});
console.log(`Browser import graph linked successfully: ${modules.size} modules. No browser execution claimed.`);
