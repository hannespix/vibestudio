#!/usr/bin/env node
/* Legt einen neuen Vortrag unter decks/<slug>/ an.
   node tools/new-deck.mjs <slug> --from <slug>            Kopie eines vorhandenen Vortrags (Folien, Zustand, deck-eigene Assets)
   node tools/new-deck.mjs <slug> --from-export <datei>    aus einer im Editor gespeicherten Ein-Datei-Fassung (HTML speichern)
   node tools/new-deck.mjs <slug> --blank                  Titelfolie + eine Textfolie
   Optionen: --title "…" --subtitle "…" --audience "…" --description "…" --minutes 7 --dir decks --force
   Danach: node build.mjs → der Vortrag erscheint unter /<slug>/ und in der Übersicht. */
import {readFileSync,writeFileSync,mkdirSync,existsSync,cpSync,readdirSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),opts={};const positional=[];
for(let i=0;i<args.length;i++){const a=args[i];if(a.startsWith('--')){const key=a.slice(2);const next=args[i+1];if(next!==undefined&&!next.startsWith('--')){opts[key]=next;i++}else opts[key]=true}else positional.push(a)}
const slug=positional[0];
const fail=msg=>{console.error('Fehler: '+msg);process.exit(1)};
if(!slug||!/^[a-z0-9][a-z0-9-]{0,39}$/.test(slug))fail('Bitte einen Kurznamen angeben: Kleinbuchstaben, Ziffern, Bindestrich (z. B. vave, rp-kurz).');
const decksDir=resolve(root,opts.dir||'decks'),target=join(decksDir,slug);
if(existsSync(target)&&!opts.force)fail(`decks/${slug} existiert schon (mit --force überschreiben).`);

let slides,state,base={};
if(opts['from-export']){
 const html=readFileSync(resolve(opts['from-export']),'utf8');
 const open=html.indexOf('<div class="slides">');const close=html.lastIndexOf('</div></div>',html.indexOf('<div class="deck-ui"'));
 if(open<0||close<0)fail('In der Datei wurde kein Folienbereich gefunden.');
 slides=html.slice(open+'<div class="slides">'.length,close).trim();
 const m=html.match(/<script id="deck-user-data" type="application\/json">([\s\S]*?)<\/script>/);
 state=m?JSON.parse(m[1].replace(/\\u003c/g,'<')):null;
 const title=html.match(/<title>([^<]*)<\/title>/);base={title:title?title[1].replace(/ · Hannes Pix$/,''):slug};
}else if(opts.blank){
 slides=`<section class="chapter paper" data-scene="paper" data-name="Titel" data-duration="7000"><div class="motion-layer" aria-hidden="true"><img class="motion-image" src="assets/scene-paper.jpg" alt=""></div><div class="chapter-title"><h1>${slug}</h1><p>ein neuer vortrag</p></div><div class="signature">Hannes Pix <span>Vibe Studio</span></div><aside class="notes"></aside></section>
<section class="content cream" data-name="Erste Folie" data-duration="30000"><div class="eyebrow">01 / erster gedanke</div><h2>Dein Titel</h2><p class="slide-copy">Hier beginnt deine Geschichte.</p><aside class="notes"></aside></section>`;
 state=null;
}else{
 const from=opts.from||'rp',src=existsSync(join(decksDir,from))?join(decksDir,from):join(root,'decks',from);
 if(!existsSync(join(src,'slides.html')))fail(`Vorlage decks/${from} nicht gefunden.`);
 slides=readFileSync(join(src,'slides.html'),'utf8').trim();
 state=existsSync(join(src,'state.json'))?JSON.parse(readFileSync(join(src,'state.json'),'utf8')):null;
 base=JSON.parse(readFileSync(join(src,'deck.json'),'utf8'));base.basedOn=from;
 if(existsSync(join(src,'assets'))){mkdirSync(target,{recursive:true});cpSync(join(src,'assets'),join(target,'assets'),{recursive:true})}
}
const meta={slug,title:opts.title||base.title||slug,subtitle:opts.subtitle||base.subtitle||'',audience:opts.audience||base.audience||'',author:base.author||'Hannes Pix',lang:base.lang||'de',minutes:Number(opts.minutes||base.minutes||7),description:opts.description||base.description||opts.subtitle||base.subtitle||'',cover:base.cover||'assets/scene-paper.jpg',primary:false,basedOn:base.basedOn||null,created:new Date().toISOString().slice(0,10)};
mkdirSync(target,{recursive:true});
writeFileSync(join(target,'slides.html'),slides+'\n');
writeFileSync(join(target,'state.json'),JSON.stringify(state||{schema:1,updatedAt:0,texts:{},added:[],logo:null})+'\n');
writeFileSync(join(target,'deck.json'),JSON.stringify(meta,null,1)+'\n');
const count=(slides.match(/<section\b/g)||[]).length;
console.log(`Vortrag angelegt: decks/${slug}/ (${count} Folien${meta.basedOn?', Kopie von '+meta.basedOn:''})\n  Titel: ${meta.title}\n  Nächste Schritte: deck.json prüfen, node build.mjs, dann unter /${slug}/ öffnen.`);
