/* Rendert tools/scene-network.html mit Chromium und schreibt assets/scene-network.jpg.
   Aufruf: node tools/render-scene.mjs [seed] [scale] [quality] [zieldatei]   (benötigt das npm-Paket playwright). */
import {writeFile} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),[seed=7,scale=2,quality=.82,target]=process.argv.slice(2);
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch(),page=await browser.newPage();
await page.goto(pathToFileURL(join(root,'tools','scene-network.html')).href+`?seed=${seed}&scale=${scale}&q=${quality}`);
await page.waitForFunction(()=>window.rendered,null,{timeout:120000});
const data=await page.evaluate(()=>window.sceneDataURL),buffer=Buffer.from(data.split(',')[1],'base64'),out=target?resolve(target):join(root,'assets','scene-network.jpg');
await writeFile(out,buffer);await browser.close();
console.log(`${out}: ${(buffer.length/1024).toFixed(0)} KB (seed ${seed}, ${1600*scale} × ${900*scale}, Qualität ${quality})`);
