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
 /* Design-Dialog: globale Größe, Laufweite je Feldtyp, Zurücksetzen */
 const h2Size=()=>page.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('.slides>section.content h2')).fontSize));
 const h2Base=await h2Size();await page.click('#editor-design');await page.waitForSelector('#design-dialog[open]');
 await page.fill('#design-dialog .design-row[data-level="global"] input[data-key="size"]','120');
 const h2Scaled=await h2Size();check(Math.abs(h2Scaled-h2Base*1.2)<0.6,'Design: globale Größe 120 % skaliert Überschriften ('+h2Base+' → '+h2Scaled+' px)');
 await page.fill('#design-dialog .design-row[data-level="label"] input[data-key="tracking"]','0.1');
 const eyebrow=await page.evaluate(()=>{const cs=getComputedStyle(document.querySelector('.slides>section.content .eyebrow'));return{ls:parseFloat(cs.letterSpacing),size:parseFloat(cs.fontSize)}});
 check(Math.abs(eyebrow.ls-(2.2+0.1*eyebrow.size))<0.6,'Design: Laufweite je Feldtyp ('+eyebrow.ls.toFixed(1)+' px bei '+eyebrow.size.toFixed(1)+' px)');
 await page.click('#design-reset');check(Math.abs((await h2Size())-h2Base)<0.6,'Design: Zurücksetzen stellt die Vorlage wieder her');await page.click('#design-done');
 /* Bewegung: globale Werte, eigene Werte einer Folie, Übernahme */
 const speedOf=index=>page.evaluate(i=>JSON.parse(document.querySelectorAll('.slides>section')[i].querySelector('.motion-layer').dataset.motionSettings).speed,index);
 const slide=async v=>{await page.evaluate(v=>{const el=document.querySelector('#background-speed');el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))},v)};
 await page.click('#tab-background');await page.selectOption('#motion-scope','global');await slide('1.5');
 check((await speedOf(2))===1.5&&(await speedOf(0))===1.5,'Bewegung: globaler Wert gilt für alle Folien');
 await page.selectOption('#motion-scope','slide');await slide('0.75');
 check((await speedOf(0))===0.75&&(await speedOf(2))===1.5,'Bewegung: eigener Wert nur auf dieser Folie');
 await page.click('#motion-inherit');check((await speedOf(0))===1.5,'Bewegung: „Globale Bewegung übernehmen“ entfernt den eigenen Wert');
 await page.selectOption('#motion-scope','global');await slide('1');await page.click('#tab-slide');
 /* Bühne: Randfarbe bei Breitbild */
 check((await page.evaluate(()=>getComputedStyle(document.body).backgroundColor))==='rgb(0, 0, 0)','Bühne: Standard schwarz');
 const settle=()=>page.waitForTimeout(850);
 await page.click('#tab-background');await page.click('#stage-swatches button[data-stage="#ffffff"]');await settle();
 check((await page.evaluate(()=>getComputedStyle(document.body).backgroundColor))==='rgb(255, 255, 255)','Bühne: Rand weiß');
 await page.click('#stage-swatches button[data-stage="#000000"]');await settle();
 check((await page.evaluate(()=>getComputedStyle(document.body).backgroundColor))==='rgb(0, 0, 0)'&&(await page.evaluate(()=>document.querySelector('#stage-swatches button[data-stage="#000000"]').getAttribute('aria-pressed')))==='true','Bühne: Rand schwarz und Auswahl markiert');
 await page.click('#editor-undo');await settle();check((await page.evaluate(()=>getComputedStyle(document.body).backgroundColor))==='rgb(255, 255, 255)','Bühne: Rückgängig stellt die vorige Randfarbe wieder her');
 const hexToRgb=h=>'rgb('+[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(', ')+')',bodyColour=()=>page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
 const edge=await page.evaluate(()=>VibeStudio.stageFromImage());await settle();
 check(/^#[0-9a-f]{6}$/.test(edge||'')&&(await bodyColour())===hexToRgb(edge),'Bühne: Farbe vom Bildrand übernommen ('+edge+')');
 const picked=await page.evaluate(()=>{const r=document.querySelector('.slides>section.present').getBoundingClientRect();return VibeStudio.pickStageAt(r.left+r.width*.5,r.top+r.height*.85)});await settle();
 check(/^#[0-9a-f]{6}$/.test(picked||'')&&picked!==edge&&(await bodyColour())===hexToRgb(picked),'Bühne: Pipette liest die Bildfarbe an der Klickstelle ('+picked+')');
 /* Bühne je Folie */
 await page.selectOption('#stage-scope','slide');await page.click('#stage-swatches button[data-stage="#ffffff"]');await page.waitForTimeout(800);
 check((await bodyColour())==='rgb(255, 255, 255)','Bühne: eigene Farbe für diese Folie');
 await page.evaluate(()=>deck.slide(2));await page.waitForTimeout(900);
 check((await bodyColour())===hexToRgb(picked),'Bühne: andere Folie behält die globale Farbe');
 await page.evaluate(()=>deck.slide(0));await page.waitForTimeout(900);
 check((await bodyColour())==='rgb(255, 255, 255)','Bühne: Rückkehr zeigt wieder die eigene Farbe');
 await page.click('#stage-inherit');await page.waitForTimeout(800);check((await bodyColour())===hexToRgb(picked),'Bühne: „Globale Bühne übernehmen“ entfernt die eigene Farbe');
 await page.selectOption('#stage-scope','global');await page.click('#tab-slide');
 /* Export enthält den Zustand */
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#editor-save')]);
 const exported=await readFile(await download.path(),'utf8');
 check(exported.includes('id="deck-user-data"')&&exported.includes('"added"')&&exported.includes('arrange.js')&&exported.includes('design.js')&&exported.includes('"stage"'),'Export enthält Zustand, Bühne und neue Skripte');
 await page.click('#editor-present');await page.waitForTimeout(200);
 check(!(await page.evaluate(()=>document.body.classList.contains('editing'))),'Zurück im Präsentationsmodus');
 /* Überblenden: die verlassene Folie bleibt bis zum Ende der Überblendung sichtbar und in Bewegung, danach ist sie unsichtbar und pausiert; Nachbarfotos sind vordekodiert */
 await page.evaluate(()=>deck.slide(0));await page.waitForTimeout(1300);await page.evaluate(()=>deck.slide(1));await page.waitForTimeout(350);
 const fadeMid=await page.evaluate(()=>{const s=document.querySelectorAll('.slides>section'),anims=s[0].getAnimations({subtree:true});return{leaving:getComputedStyle(s[0]).visibility,incoming:getComputedStyle(s[1]).visibility,running:anims.filter(a=>a.playState==='running').length,total:anims.length}});
 check(fadeMid.leaving==='visible'&&fadeMid.incoming==='visible'&&fadeMid.total>0&&fadeMid.running===fadeMid.total,`Überblenden: verlassene Folie bleibt sichtbar und in Bewegung (${fadeMid.running} Animationen)`);
 await page.waitForTimeout(1100);
 const fadeEnd=await page.evaluate(()=>{const s=document.querySelectorAll('.slides>section'),anims=s[0].getAnimations({subtree:true});return{leaving:getComputedStyle(s[0]).visibility,present:getComputedStyle(s[1]).visibility,paused:anims.filter(a=>a.playState==='paused').length,total:anims.length,decoded:[0,2].map(i=>s[i].querySelector('.motion-layer img')?.dataset.decoded)}});
 check(fadeEnd.leaving==='hidden'&&fadeEnd.present==='visible'&&fadeEnd.paused===fadeEnd.total,'Überblenden: danach ist die verlassene Folie unsichtbar, ihre Bewegung pausiert');
 check(fadeEnd.decoded.every(d=>d==='1'),'Nachbarfolien: Hintergrundfotos vorab dekodiert');
 const layers=await page.evaluate(()=>{const s=document.querySelectorAll('.slides>section')[0],cs=el=>getComputedStyle(el);const parts=[...s.querySelectorAll('.motion-dust,.motion-dof')];return{parts:parts.length,plain:parts.every(el=>cs(el).mixBlendMode==='normal'&&cs(el).filter==='none'),grain:cs(s.querySelector('.motion-grain')).mixBlendMode,noWillChange:[s.querySelector('.motion-layer'),s.querySelector('.motion-image')].every(el=>cs(el).willChange==='auto')}});
 check(layers.parts===15&&layers.plain&&layers.grain==='soft-light'&&layers.noWillChange,'Effekte: Staub und Lichter ohne Mischmodus und Filter, Ebenen ohne will-change, Körnung soft-light');
 const shrunk=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=4800;c.height=3200;const g=c.getContext('2d');g.fillStyle='#8a6';g.fillRect(0,0,4800,3200);g.fillStyle='#345';g.fillRect(400,300,2000,1500);const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.8));const a=await VibeMedia.importFile(new File([blob],'gross.jpg',{type:'image/jpeg'}));return{w:a.width,h:a.height,from:a.scaledFrom,mime:a.mime,smaller:a.size<blob.size}});
 check(shrunk.w===3200&&shrunk.h===2133&&shrunk.from==='4800 × 3200'&&shrunk.mime==='image/jpeg'&&shrunk.smaller,'Medienimport: 4800-px-Foto auf 3200 px verkleinert');
 await page.screenshot({path:join(shots,'present.png')});
 check(errors.length===0,'Quellfassung ohne Konsolenfehler'+(errors.length?': '+errors.join(' | '):''));
 await page.close();
 /* Responsiver Editor: schmale Fenster */
 for(const [w,h] of [[900,700],[430,900]]){const small=await browser.newPage({viewport:{width:w,height:h}});const errs=[];small.on('pageerror',e=>errs.push(e.message));await small.goto(base+'/index.html');await small.waitForSelector('.reveal.ready');await small.keyboard.press('e');await small.waitForSelector('body.editing');await small.waitForTimeout(400);
  const m=await small.evaluate(()=>({reveal:document.querySelector('.reveal').getBoundingClientRect().width,win:innerWidth,railHidden:getComputedStyle(document.querySelector('#studio-rail')).display==='none',toggles:getComputedStyle(document.querySelector('.panel-toggles')).display!=='none',toolbarVar:getComputedStyle(document.documentElement).getPropertyValue('--toolbar-h').trim(),toolbarH:document.querySelector('#editor-toolbar').offsetHeight,scrollW:document.documentElement.scrollWidth,scale:deck.getScale(),top:Math.round(document.querySelector('.reveal').getBoundingClientRect().top),scrollView:document.body.classList.contains('reveal-scroll')}));
  check(Math.round(m.reveal)===m.win&&m.railHidden&&m.toggles&&m.toolbarVar===m.toolbarH+'px'&&m.top===m.toolbarH&&m.scrollW<=m.win&&m.scale>0&&!m.scrollView,`Responsiv ${w} px: Folie volle Breite unter der Toolbar (${m.toolbarH} px), Leisten eingeklappt, kein Scrollmodus`);
  await small.click('#toggle-rail');await small.waitForTimeout(200);check(await small.evaluate(()=>getComputedStyle(document.querySelector('#studio-rail')).display!=='none'),`Responsiv ${w} px: Folienleiste einblendbar`);
  await small.click('#toggle-inspector');await small.waitForTimeout(200);const open=await small.evaluate(()=>({rail:getComputedStyle(document.querySelector('#studio-rail')).display!=='none',inspector:getComputedStyle(document.querySelector('#studio-inspector')).display!=='none'}));
  check(open.inspector&&(w>760?open.rail:!open.rail),`Responsiv ${w} px: Inspektor einblendbar${w>760?'':', Folienleiste weicht'}`);
  await small.screenshot({path:join(shots,`responsive-${w}.png`)});
  if(w===430){await small.evaluate(()=>{window.__section=document.querySelector('.slides>section');window.__motion=document.querySelectorAll('.motion-image').length});await small.setViewportSize({width:900,height:430});await small.waitForTimeout(500);await small.setViewportSize({width:430,height:900});await small.waitForTimeout(500);const turned=await small.evaluate(()=>({alive:document.contains(window.__section),same:document.querySelectorAll('.motion-image').length===window.__motion,scroll:document.body.classList.contains('reveal-scroll')}));check(turned.alive&&turned.same&&!turned.scroll,'Drehen des Geräts (430 ↔ 900 px) behält Folien-DOM und Animationen')}
  check(errs.length===0,`Responsiv ${w} px: ohne Fehler`);await small.close()}
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
