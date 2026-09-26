/* Smoke-Test: öffnet die Präsentation headless in Chromium, prüft Editorfunktionen und die gebaute Ein-Datei-Fassung.
   Aufruf: node build.mjs && node tools/smoke-test.mjs   (benötigt das npm-Paket playwright samt Chromium). */
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join,extname,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),shots=process.env.SMOKE_SHOTS||join(root,'dist','smoke');
const {chromium}=createRequire(import.meta.url)('playwright');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://x').pathname),file=join(root,path.endsWith('/')?path+'index.html':path);if(!file.startsWith(root))throw Error('outside');const body=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream'});res.end(body)}catch{res.writeHead(404);res.end('not found')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const failures=[],notes=[];const check=(ok,label)=>{(ok?notes:failures).push((ok?'✓ ':'✗ ')+label);if(!ok)console.error('✗ '+label)};
await mkdir(shots,{recursive:true});
const expectedSlides=((await readFile(join(root,'index.html'),'utf8')).match(/<section\b/g)||[]).length;
const browser=await chromium.launch();
async function open(url){const page=await browser.newPage({viewport:{width:1600,height:1000}});const errors=[],requests=[];page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});page.on('request',r=>requests.push(r.url()));await page.goto(url);await page.waitForSelector('.reveal.ready',{timeout:20000});await page.evaluate(()=>document.fonts.ready);return{page,errors,requests}}
try{
 /* Quellfassung */
 const {page,errors}=await open(base+'/index.html');
 check(await page.evaluate(()=>deck.getTotalSlides())===expectedSlides,'Quellfassung: '+expectedSlides+' Folien');
 check(await page.$('#fullscreen')!==null,'Vollbild-Knopf in der Steuerleiste');
 await page.click('#fullscreen');await page.waitForTimeout(300);
 const fullscreen=await page.evaluate(()=>({on:!!document.fullscreenElement,pressed:document.querySelector('#fullscreen').getAttribute('aria-pressed'),toast:document.querySelector('#toast').classList.contains('visible')}));
 check(fullscreen.on?fullscreen.pressed==='true':fullscreen.toast,'Vollbild-Knopf reagiert ('+(fullscreen.on?'Vollbild aktiv':'Hinweis gezeigt')+')');
 if(fullscreen.on){await page.click('#fullscreen');await page.waitForTimeout(300);check(!(await page.evaluate(()=>!!document.fullscreenElement)),'Vollbild wieder beendet')}
 await page.evaluate(()=>deck.slide(deck.getTotalSlides()-1));await page.waitForTimeout(400);
 check((await page.evaluate(()=>deck.getCurrentSlide().classList.contains('network')&&deck.getCurrentSlide().querySelector('h1')?.textContent.trim()))==='danke','Letzte Folie ist die Danke-Folie');
 await page.screenshot({path:join(shots,'danke.png')});
 const motion=await page.evaluate(()=>VibeMotionSettings.defaults(document.querySelector('.slides>section.chapter.paper')));
 check(motion.strength===95&&motion.movement===76&&motion.rotation===28&&motion.texture===12,'Kräftige Effekt-Grundeinstellung (Stärke '+motion.strength+', Bewegung '+motion.movement+')');
 const scenes=await page.evaluate(()=>[...document.querySelectorAll('.slides>section.chapter .motion-image')].map(i=>i.getAttribute('src')));
 check(new Set(scenes).size===scenes.length,'Jede Kapitelfolie hat ein eigenes Hintergrundmotiv ('+scenes.length+')');
 await page.evaluate(()=>deck.slide(10));await page.waitForTimeout(400);check(await page.evaluate(()=>deck.getCurrentSlide().classList.contains('dawn')),'Folie 11 nutzt das Morgenlicht-Motiv');await page.screenshot({path:join(shots,'ermoeglichen.png')});
 await page.evaluate(()=>deck.slide(0));await page.waitForTimeout(300);
 const fonts=await page.evaluate(async()=>Object.fromEntries(await Promise.all(['DM Sans'].map(async f=>[f,(await document.fonts.load('20px "'+f+'"')).length>0]))));
 for(const[f,ok]of Object.entries(fonts))check(ok,'Schrift verfügbar: '+f);
 check(!(await page.evaluate(()=>[...document.fonts].some(f=>/BaWue/i.test(f.family)))),'Keine BaWue-Schriften eingebettet');
 const overflow=await page.evaluate(()=>[...document.querySelectorAll('.slides>section.content')].map(s=>[s.dataset.name,s.scrollHeight]).filter(([,h])=>h>902));
 check(overflow.length===0,'Inhaltsfolien passen in 900 px'+(overflow.length?': '+overflow.map(([n,h])=>n+' '+h).join(', '):''));
 await page.keyboard.press('e');await page.waitForSelector('body.editing');
 check(await page.$('#tab-object')!==null,'Inspektor hat Tab „Objekt“');
 await page.click('#editor-add');await page.waitForTimeout(100);
 const id=await page.evaluate(()=>DeckEditor.selected()?.dataset.editId);check(!!id,'Neues Textfeld ist ausgewählt');
 await page.keyboard.press('Escape');await page.click(`[data-edit-id="${id}"]`);
 await page.fill('#editor-rotate','30');
 check(await page.evaluate(id=>document.querySelector(`[data-edit-id="${id}"]`).style.rotate,id)==='30deg','Drehung über Eingabefeld: 30deg');
 check(await page.evaluate(id=>DeckEditor.textData(document.querySelector(`[data-edit-id="${id}"]`)).rotate,id)===30,'Drehung im Zustand gespeichert');
 check(await page.evaluate(()=>!document.querySelector('#edit-rotate').hidden),'Drehgriff sichtbar');
 await page.click('[data-arrange="hcenter"]');
 const centre=await page.evaluate(id=>{const b=VibeArrange.box(document.querySelector(`[data-edit-id="${id}"]`));return b.left+b.width/2},id);
 check(Math.abs(centre-800)<1.5,'Horizontal zentriert (Mitte '+centre.toFixed(1)+')');
 await page.click('[data-arrange="top"]');
 const top=await page.evaluate(id=>VibeArrange.box(document.querySelector(`[data-edit-id="${id}"]`)).top,id);
 check(Math.abs(top)<1.5,'Oben ausgerichtet (top '+top.toFixed(1)+')');
 await page.click('#editor-rotate-reset');await page.selectOption('#editor-align','justify');
 check(await page.evaluate(id=>getComputedStyle(document.querySelector(`[data-edit-id="${id}"]`)).textAlign,id)==='justify','Blocksatz gesetzt');
 const snap=await page.evaluate(()=>VibeArrange.snapMove({left:100,top:100,width:200,height:50},697,247,{threshold:8}));
 check(snap.dx===700&&snap.guides.some(g=>g.axis==='x'&&g.v===800)&&Math.abs(snap.dy-247)<8.01,'Fanglinien: Einrasten an der Folienmitte (dx '+snap.dx+', dy '+snap.dy.toFixed(1)+')');
 await page.click('#editor-grid-toggle');
 check(await page.evaluate(()=>document.body.classList.contains('grid-on')&&document.querySelectorAll('#editor-grid line').length>40),'Raster eingeschaltet und gezeichnet');
 const gridSnap=await page.evaluate(()=>{VibeArrange.prefs.guides=false;const s=VibeArrange.snapMove({left:100,top:100,width:200,height:50},3,-4,{threshold:8});VibeArrange.prefs.guides=true;return s});
 check(gridSnap.dx===0&&gridSnap.dy===0,'Raster: Kante rastet auf 50-px-Linie');
 /* Echtes Ziehen am Griff: Fanglinie erscheint während der Bewegung */
 await page.click(`[data-edit-id="${id}"]`);const handle=await page.$('#edit-move');const hb=await handle.boundingBox();
 const before=await page.evaluate(id=>VibeArrange.box(document.querySelector(`[data-edit-id="${id}"]`)),id),scale=await page.evaluate(()=>deck.getScale());
 await page.mouse.move(hb.x+10,hb.y+10);await page.mouse.down();await page.mouse.move(hb.x+10+(805-before.left)*scale,hb.y+10+120*scale,{steps:12});
 const guidesDuringDrag=await page.evaluate(()=>document.querySelectorAll('#editor-guides line').length);
 await page.screenshot({path:join(shots,'drag-guides.png')});await page.mouse.up();
 const after=await page.evaluate(id=>VibeArrange.box(document.querySelector(`[data-edit-id="${id}"]`)),id);
 check(guidesDuringDrag>0,'Fanglinie während des Ziehens sichtbar ('+guidesDuringDrag+')');
 check(Math.abs(after.left-800)<1.5,'Ziehen rastet an x = 800 ein (left '+after.left.toFixed(1)+')');
 check(await page.evaluate(()=>document.querySelectorAll('#editor-guides line').length)===0,'Fanglinien nach dem Loslassen ausgeblendet');
 await page.click('#editor-grid-toggle');
 /* Drehgriff ziehen */
 await page.click(`[data-edit-id="${id}"]`);const spin=await page.$('#edit-rotate');const sb=await spin.boundingBox();const eb=await (await page.$(`[data-edit-id="${id}"]`)).boundingBox();
 await page.mouse.move(sb.x+14,sb.y+14);await page.mouse.down();await page.mouse.move(eb.x+eb.width+120,eb.y+eb.height/2,{steps:10});await page.mouse.up();
 const dragged=await page.evaluate(id=>DeckEditor.textData(document.querySelector(`[data-edit-id="${id}"]`)).rotate,id);
 check(dragged>60&&dragged<120,'Drehgriff gezogen ('+dragged+'°)');
 await page.click('#tab-object');check(await page.evaluate(()=>!document.querySelector('#object-properties').hidden&&document.querySelector('#object-rotate').value!==''),'Objekt-Tab zeigt Werte');
 await page.screenshot({path:join(shots,'editor-rotated.png')});
 await page.click('#editor-undo');
 check(await page.evaluate(id=>DeckEditor.textData(document.querySelector(`[data-edit-id="${id}"]`))?.rotate,id)!==dragged,'Rückgängig setzt Drehung zurück');
 /* Export enthält den Zustand */
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#editor-save')]);
 const exported=await readFile(await download.path(),'utf8');
 check(exported.includes('id="deck-user-data"')&&exported.includes('"added"')&&exported.includes('arrange.js'),'Export enthält Zustand und neue Skripte');
 await page.click('#editor-present');await page.waitForTimeout(200);
 check(!(await page.evaluate(()=>document.body.classList.contains('editing'))),'Zurück im Präsentationsmodus');
 await page.screenshot({path:join(shots,'present.png')});
 check(errors.length===0,'Quellfassung ohne Konsolenfehler'+(errors.length?': '+errors.join(' | '):''));
 await page.close();
 /* Ein-Datei-Fassung */
 if(existsSync(join(root,'dist','index.html'))){const one=await open(base+'/dist/index.html');
  check(await one.page.evaluate(()=>deck.getTotalSlides())===expectedSlides,'Ein-Datei-Fassung: '+expectedSlides+' Folien');
  const extra=one.requests.filter(u=>!u.endsWith('/dist/index.html')&&!u.startsWith('data:'));
  check(extra.length===0,'Ein-Datei-Fassung lädt keine externen Dateien'+(extra.length?': '+extra.slice(0,3).join(', '):''));
  const oneFonts=await one.page.evaluate(async()=>(await document.fonts.load('20px "DM Sans"')).length>0);
  check(oneFonts,'Ein-Datei-Fassung: Schriften eingebettet');
  await one.page.keyboard.press('e');await one.page.waitForSelector('body.editing');await one.page.screenshot({path:join(shots,'single-file-editor.png')});
  check(one.errors.length===0,'Ein-Datei-Fassung ohne Konsolenfehler'+(one.errors.length?': '+one.errors.join(' | '):''));await one.page.close()}
 else notes.push('· dist/index.html fehlt, Ein-Datei-Fassung nicht geprüft (node build.mjs)');
}catch(e){failures.push('✗ Abbruch: '+(e.stack||e))}
await browser.close();server.close();
console.log(notes.join('\n'));if(failures.length){console.error('\n'+failures.join('\n'));process.exit(1)}console.log(`\nAlle ${notes.length} Prüfungen bestanden. Screenshots: ${shots}`);
