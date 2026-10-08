import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Match the exact retired photograph even if it is copied under another name.
const removedPhotoHash='0683c6d12b606becfea10bc403cb278e499914fbd6d2f5c33856e2dfd55e107a';
const removedFilename=Buffer.from('6e657767617264656e312e77656270','hex').toString('utf8');
const walk=directory=>readdirSync(directory).flatMap(name=>{const path=`${directory}/${name}`;return statSync(path).isDirectory()?walk(path):[path]});
const root=fileURLToPath(new URL('../',import.meta.url));
const assets=walk(join(root,'public'));
for(const path of assets.filter(path=>/\.(webp|png|jpe?g|avif)$/i.test(path))){
  assert.notEqual(createHash('sha256').update(readFileSync(path)).digest('hex'),removedPhotoHash,`Approved photograph only: ${path}`);
}
for(const path of [...walk(join(root,'src')),...assets.filter(path=>/\.(svg|css|html|json|txt)$/.test(path)),join(root,'index.html')]){
  assert.ok(!readFileSync(path,'utf8').includes(removedFilename),`No retired image reference: ${path}`);
}
console.log('PASS: retired photograph absent from all image assets and website references.');
