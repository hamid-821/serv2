from pathlib import Path
import zipfile, hashlib, json
root=Path(__file__).resolve().parent.parent
out=root/'release'
out.mkdir(exist_ok=True)
target=out/'gamify-2-v0.2.1-node22.zip'
folders=['server','public','docs','tests']
files=['app.cjs','package.json','README.md','.gitignore','.vercelignore','.dockerignore','.env.example','vercel.json','render.yaml','Dockerfile','start-game.cmd']
files+=['scripts/'+n for n in ['check-host.cjs','build-vercel.mjs','validate-ui.mjs','check-module-graph.mjs','backup-db.mjs','verify-live.mjs','package-release.py']]
for folder in folders:
    files.extend(str(p.relative_to(root)).replace('\\','/') for p in (root/folder).rglob('*') if p.is_file())
files=sorted(set(files))
for name in files:
    if name.startswith(('audit/','data/','release/','.vercel/')) or name.endswith(('.sqlite','.log')) or name=='.env':
        raise RuntimeError('Private file in release: '+name)
secret=(root/'data'/'admin-key.txt').read_bytes().strip() if (root/'data'/'admin-key.txt').exists() else b''
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for name in files:
        data=(root/name).read_bytes()
        if secret and secret in data:
            raise RuntimeError('Private admin key found in '+name)
        z.writestr(name,data)
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
    assert 'vercel.json' in z.namelist() and 'scripts/build-vercel.mjs' in z.namelist()
checksum=hashlib.sha256(target.read_bytes()).hexdigest()
(out/(target.name+'.sha256')).write_text(checksum+'  '+target.name+'\n',encoding='utf-8')
print(json.dumps({'zip':str(target),'files':len(files),'bytes':target.stat().st_size,'sha256':checksum,'private_data_included':False},ensure_ascii=True))
