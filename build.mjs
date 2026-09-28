/* Baut alle Vorträge aus decks/<slug>/ (slides.html, state.json, deck.json) mit der Hülle shell.html:
   - decks/<slug>/index.html   Entwicklerfassung mit getrennten Dateien (Verweise auf ../../, nicht eingecheckt)
   - dist/<slug>/index.html    Ein-Datei-Fassung für GitHub Pages, dazu dist/<slug>/Vibecoding-<slug>.html zum Herunterladen
   - index.html und dist/index.html  Übersicht aller Vorträge
   Entwürfe ("draft": true in deck.json) bekommen nur die Entwicklerfassung zum Ansehen und Prüfen: keine Ein-Datei-Fassung, kein Eintrag in der Übersicht, nichts auf GitHub Pages.
   Keine Abhängigkeiten. Aufruf: node build.mjs [zielordner] */
import {readFileSync,writeFileSync,mkdirSync,statSync,existsSync,readdirSync,rmSync} from 'node:fs';
import {dirname,join,extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(fileURLToPath(import.meta.url)),out=resolve(root,process.argv[2]||'dist');
const mime={'.ttf':'font/ttf','.otf':'font/otf','.woff':'font/woff','.woff2':'font/woff2','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm'};
const cache=new Map();let embedded=0;
function dataURI(file){if(!cache.has(file)){const type=mime[extname(file).toLowerCase()]||'application/octet-stream';cache.set(file,`data:${type};base64,${readFileSync(file).toString('base64')}`);embedded+=statSync(file).size}return cache.get(file)}
const external=ref=>/^(data:|https?:|\/\/|#|blob:|mailto:)/i.test(ref);
function inlineCSS(file){return readFileSync(file,'utf8').replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g,(m,q,ref)=>{if(external(ref))return m;const target=join(dirname(file),ref.split(/[?#]/)[0]);return existsSync(target)?`url(${dataURI(target)})`:m})}
function inlineJS(file){return readFileSync(file,'utf8').replace(/<\/script/gi,'<\\/script')}
const escape=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fill=(template,values)=>template.replace(/\{\{(\w+)\}\}/g,(m,key)=>key in values?values[key]:m);

/* Verweise auf Dateien im Repo (href/src, root-relativ) in Data-URIs umwandeln … */
function inlineAll(html){
 html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(m,href)=>external(href)?m:`<style>${inlineCSS(join(root,href))}</style>`);
 html=html.replace(/<script src="([^"]+)"><\/script>/g,(m,src)=>external(src)?m:`<script>${inlineJS(join(root,src))}</script>`);
 html=html.replace(/(<(?:img|video|source)\b[^>]*\ssrc=")([^"]+)(")/g,(m,a,src,b)=>external(src)?m:a+dataURI(join(root,src))+b);
 const left=html.match(/(href|src)="(?!data:|https?:|#|mailto:)[^"]+\.(css|js|jpe?g|png|webp|woff2?|ttf)"/g);
 if(left)throw Error('Es sind noch relative Verweise übrig: '+left.join(', '));
 return html.replace('</title>','</title>\n<!-- Ein-Datei-Fassung, erzeugt mit build.mjs. Reveal.js 5.2.1, MIT · DM Sans, SIL OFL 1.1. Quellen und Bildnachweise: QUELLEN.md im Repository. -->');
}
/* … oder für die Entwicklerfassung in einem Unterordner um ein Präfix ergänzen. */
const relocate=(html,prefix)=>html.replace(/((?:href|src)=")(?!data:|https?:|\/\/|#|mailto:|\?)([^"]+)(")/g,(m,a,ref,b)=>a+prefix+ref+b);

const decksDir=join(root,'decks');
const decks=readdirSync(decksDir,{withFileTypes:true}).filter(d=>d.isDirectory()&&existsSync(join(decksDir,d.name,'deck.json'))).map(d=>{
 const dir=join(decksDir,d.name),meta=JSON.parse(readFileSync(join(dir,'deck.json'),'utf8'));
 const slides=readFileSync(join(dir,'slides.html'),'utf8').trim();
 const state=existsSync(join(dir,'state.json'))?JSON.stringify(JSON.parse(readFileSync(join(dir,'state.json'),'utf8'))):'{"schema":1,"updatedAt":0,"texts":{},"added":[],"logo":null}';
 const sections=[...slides.matchAll(/<section\b([^>]*)>/g)];
 const seconds=sections.reduce((n,m)=>n+(Number((m[1].match(/data-duration="(\d+)"/)||[])[1]||0)/1000),0);
 return {slug:d.name,dir,meta,slides,state,count:sections.length,minutes:meta.minutes||Math.round(seconds/60)||0};
}).sort((a,b)=>(b.meta.primary?1:0)-(a.meta.primary?1:0)||a.slug.localeCompare(b.slug));
if(!decks.length)throw Error('Keine Vorträge in decks/<slug>/deck.json gefunden.');

const shell=readFileSync(join(root,'shell.html'),'utf8').replace(/^<!--[\s\S]*?-->\n/,'');
mkdirSync(out,{recursive:true});
for(const deck of decks){
 const m=deck.meta,title=escape(m.title+(m.author?' · '+m.author:''));
 const html=fill(shell,{slug:escape(deck.slug),lang:escape(m.lang||'de'),typeScale:escape(m.typeScale||'standard'),title,description:escape(m.description||m.subtitle||''),count:String(deck.count).padStart(2,'0'),state:deck.state.replace(/</g,'\\u003c'),slides:deck.slides,home:'{{home}}'});
 writeFileSync(join(deck.dir,'index.html'),'<!-- Erzeugt von build.mjs aus shell.html + slides.html; Änderungen dort vornehmen. -->\n'+relocate(fill(html,{home:'index.html'}),'../../'));
 /* Entwurf: eine ältere Ein-Datei-Fassung aus einem früheren Lauf entfernen, damit nichts davon veröffentlicht wird */
 if(m.draft){if(/^[a-z0-9][a-z0-9-]*$/.test(deck.slug))rmSync(join(out,deck.slug),{recursive:true,force:true});continue}
 mkdirSync(join(out,deck.slug),{recursive:true});
 const single=inlineAll(fill(html,{home:'../index.html'}));
 writeFileSync(join(out,deck.slug,'index.html'),single);
 writeFileSync(join(out,deck.slug,`Vibecoding-${deck.slug}.html`),single);
 if(m.primary)writeFileSync(join(out,'Vibecoding.html'),single);
 deck.bytes=Buffer.byteLength(single);
}

/* Übersicht */
const card=d=>{const m=d.meta;return `<article class="deck"${m.cover?` style="--cover:url(${escape(m.cover)})"`:''}>
 <a class="cover" href="${d.slug}/index.html" aria-label="${escape(m.title)} vorführen">${m.cover?`<img src="${escape(m.cover)}" alt="">`:''}</a>
 <div class="deck-body">
  <div class="kicker">${escape(m.audience||'')}</div>
  <h2><a href="${d.slug}/index.html">${escape(m.title)}</a></h2>
  ${m.subtitle?`<p class="sub">${escape(m.subtitle)}</p>`:''}
  <p class="facts">${d.count} Folien · etwa ${d.minutes} Minuten${m.basedOn?` · Variante von <code>${escape(m.basedOn)}</code>`:''}${m.created?` · seit ${escape(m.created)}`:''}</p>
  <p class="actions"><a class="primary" href="${d.slug}/index.html">Vorführen</a><a href="${d.slug}/index.html?edit">Bearbeiten</a><a href="${d.slug}/Vibecoding-${d.slug}.html" download>Herunterladen</a><a class="path" href="${d.slug}/index.html">/${d.slug}/</a></p>
 </div>
</article>`};
const overview=`<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Vibe Studio · Übersicht der Vorträge">
<title>Vibe Studio · Vorträge</title>
<link rel="stylesheet" href="assets/font.css">
<style>
:root{--ink:#24231f;--paper:#eae3d7;--rust:#ad6549;--sage:#627364;--sans:'DM Sans',Arial,sans-serif}
*{box-sizing:border-box}html,body{margin:0;background:#eee8df;color:var(--ink);font:17px/1.5 var(--sans)}
main{max-width:1180px;margin:0 auto;padding:72px 32px 96px}
header{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:44px}
h1{font-size:54px;line-height:1.05;letter-spacing:-2.4px;font-weight:500;margin:0}h1 b{font-weight:400;opacity:.45}
.lead{max-width:560px;color:#6f675b;margin:0}
.decks{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:28px}
.deck{background:#f7f3ec;border:1px solid #d6cdbf;border-radius:18px;overflow:hidden;box-shadow:0 18px 50px #2b241c12;display:flex;flex-direction:column}
.cover{display:block;aspect-ratio:16/9;background:#dcd3c4 var(--cover) center/cover;overflow:hidden}
.cover img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .8s ease}.deck:hover .cover img{transform:scale(1.03)}
.deck-body{padding:22px 24px 24px;display:flex;flex-direction:column;gap:8px;flex:1}
.kicker{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a604d}
h2{font-size:27px;line-height:1.15;letter-spacing:-.9px;font-weight:500;margin:0}h2 a{color:inherit;text-decoration:none}
.sub{margin:0;color:#5f594f}
.facts{margin:4px 0 0;font-size:14px;color:#8a8072}.facts code{font:inherit;background:#e6dfd1;padding:1px 6px;border-radius:5px}
.actions{margin:auto 0 0;padding-top:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.actions a{font-size:14px;text-decoration:none;color:#353a31;background:#e9e3d9;border:1px solid #d0c6b8;border-radius:8px;padding:8px 13px}
.actions a:hover{background:#ded4c5}.actions a.primary{background:#354a3b;border-color:#354a3b;color:#fff}.actions a.primary:hover{background:#2b3d30}
.actions a.path{margin-left:auto;background:transparent;border-color:transparent;color:#9a8c79;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px}
.howto{margin-top:64px;padding:28px 30px;border:1px dashed #bfb4a3;border-radius:18px;color:#5f594f}
.howto h3{margin:0 0 10px;font-size:20px;font-weight:500;letter-spacing:-.4px}.howto p{margin:6px 0}.howto code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;background:#e6dfd1;padding:2px 7px;border-radius:6px}
footer{margin-top:48px;font-size:13px;color:#9a8c79}
@media(max-width:640px){main{padding:44px 18px 64px}h1{font-size:40px}}
</style>
</head>
<body>
<main>
<header><div><h1>Vibe Studio <b>· Vorträge</b></h1></div><p class="lead">Jeder Vortrag hat seine eigene Adresse und lässt sich dort vorführen, im Browser bearbeiten und als eine HTML-Datei herunterladen.</p></header>
<section class="decks">
${decks.filter(d=>!d.meta.draft).map(card).join('\n')}
</section>
<section class="howto">
<h3>Neuen Vortrag anlegen</h3>
<p>Als Kopie eines vorhandenen Vortrags: <code>node tools/new-deck.mjs kurzname --from rp --title "Titel" --audience "Publikum"</code></p>
<p>Aus einer im Editor gespeicherten Datei: <code>node tools/new-deck.mjs kurzname --from-export Vibecoding-bearbeitet.html</code></p>
<p>Danach <code>node build.mjs</code>, einchecken, und der Vortrag erscheint hier unter <code>/kurzname/</code>.</p>
</section>
<footer>Reveal.js 5.2.1 · Vibe Studio · Quellen und Bildnachweise in QUELLEN.md</footer>
</main>
</body></html>
`;
writeFileSync(join(root,'index.html'),'<!-- Erzeugt von build.mjs aus decks/*/deck.json; nicht von Hand bearbeiten. -->\n'+overview);
writeFileSync(join(out,'index.html'),inlineAll(overview));
writeFileSync(join(out,'.nojekyll'),'');
console.log(`Gebaut: ${decks.filter(d=>!d.meta.draft).length} Vortrag/Vorträge → ${out}\n`+decks.map(d=>d.meta.draft?`  Entwurf ${d.slug}: ${d.meta.title} · ${d.count} Folien · nur decks/${d.slug}/index.html, nicht veröffentlicht`:`  /${d.slug}/  ${d.meta.title} · ${d.count} Folien · ${(d.bytes/1024/1024).toFixed(2)} MB`).join('\n')+`\n  Übersicht: index.html · ${cache.size} eingebettete Dateien, ${(embedded/1024/1024).toFixed(2)} MB Rohdaten`);
