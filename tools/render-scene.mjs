/* Rendert ein Kapitelmotiv (prozedural oder aus einem bearbeiteten Foto) aus tools/scene-<name>.html mit Chromium nach assets/scene-<name>.jpg.
   Aufruf: node tools/render-scene.mjs <name> [seed] [scale] [quality] [zieldatei]   (benötigt das npm-Paket playwright; Motive mit Vorlage zusätzlich curl; SCENE_CACHE=<ordner> speichert geladene Vorlagen zwischen). */
import {writeFile} from 'node:fs/promises';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),[name='network',seed,scale=2,quality,target]=process.argv.slice(2),source=join(root,'tools',`scene-${name}.html`);
if(!existsSync(source)){console.error(`Unbekanntes Motiv „${name}“: ${source} fehlt.`);process.exit(1)}
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch(),page=await browser.newPage();
const query=new URLSearchParams({scale});if(seed)query.set('seed',seed);if(quality)query.set('q',quality);
/* Motive mit Vorlage (ein bearbeitetes Foto): <meta name="scene-source" content="URL"> in der Szenendatei. Die Vorlage wird mit curl geladen und der Seite als data:-URL übergeben, so bleibt die Leinwand exportierbar. Manche Archive verlangen eine erkennbare Kennung (User-Agent). */
const sourceUrl=readFileSync(source,'utf8').match(/<meta name="scene-source" content="([^"]+)"/)?.[1];
/* SCENE_CACHE=<ordner> hält geladene Vorlagen vor, damit wiederholtes Rendern die Archive nicht erneut abfragt */
const cacheDir=process.env.SCENE_CACHE,cacheFile=sourceUrl&&cacheDir&&join(cacheDir,createHash('sha1').update(sourceUrl).digest('hex').slice(0,16)+'.jpg');
if(sourceUrl){const data=cacheFile&&existsSync(cacheFile)?readFileSync(cacheFile):execFileSync('curl',['-sfL','--max-time','300','-A','VibeStudio/1.0 (https://github.com/hannespix/vibestudio)',sourceUrl],{maxBuffer:128*1024*1024});if(cacheFile&&!existsSync(cacheFile)){mkdirSync(cacheDir,{recursive:true});writeFileSync(cacheFile,data)}await page.addInitScript(`window.sceneSource='data:image/jpeg;base64,${data.toString('base64')}'`);console.log(`Vorlage: ${sourceUrl} (${(data.length/1024/1024).toFixed(1)} MB)`)}
await page.goto(pathToFileURL(source).href+'?'+query);
await page.waitForFunction(()=>window.rendered,null,{timeout:120000});
const pivot=await page.evaluate(()=>window.scenePivot);if(pivot)console.log(`Drehpunkt für motion.js (pivots): [${pivot.join(',')}]`);
const data=await page.evaluate(()=>window.sceneDataURL),buffer=Buffer.from(data.split(',')[1],'base64'),out=target?resolve(target):join(root,'assets',`scene-${name}.jpg`);
await writeFile(out,buffer);
/* Motive mit eigener Scheibenebene (split in tools/scene-photo.js): zweite Datei <ziel>-disc.webp, Lage als Hinweis für .motion-disc in style.css */
const layer=await page.evaluate(()=>window.sceneLayer&&{box:window.sceneLayer,data:window.sceneLayerDataURL});await browser.close();
console.log(`${out}: ${(buffer.length/1024).toFixed(0)} KB (Motiv ${name}, Seed ${seed||'Standard'}, ${1600*scale} × ${900*scale})`);
if(layer){const discOut=out.replace(/\.jpe?g$/i,'')+'-disc.webp',disc=Buffer.from(layer.data.split(',')[1],'base64');await writeFile(discOut,disc);const b=layer.box;console.log(`${discOut}: ${(disc.length/1024).toFixed(0)} KB, Scheibenebene: left ${b.left}px, top ${b.top}px, width ${b.width}px, height ${b.height}px`)}
