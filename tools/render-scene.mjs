/* Rendert ein prozedurales Kapitelmotiv aus tools/scene-<name>.html mit Chromium nach assets/scene-<name>.jpg.
   Aufruf: node tools/render-scene.mjs <network|dawn> [seed] [scale] [quality] [zieldatei]   (benötigt das npm-Paket playwright). */
import {writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),[name='network',seed,scale=2,quality,target]=process.argv.slice(2),source=join(root,'tools',`scene-${name}.html`);
if(!existsSync(source)){console.error(`Unbekanntes Motiv „${name}“: ${source} fehlt.`);process.exit(1)}
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch(),page=await browser.newPage();
const query=new URLSearchParams({scale});if(seed)query.set('seed',seed);if(quality)query.set('q',quality);
await page.goto(pathToFileURL(source).href+'?'+query);
await page.waitForFunction(()=>window.rendered,null,{timeout:120000});
const data=await page.evaluate(()=>window.sceneDataURL),buffer=Buffer.from(data.split(',')[1],'base64'),out=target?resolve(target):join(root,'assets',`scene-${name}.jpg`);
await writeFile(out,buffer);await browser.close();
console.log(`${out}: ${(buffer.length/1024).toFixed(0)} KB (Motiv ${name}, Seed ${seed||'Standard'}, ${1600*scale} × ${900*scale})`);
