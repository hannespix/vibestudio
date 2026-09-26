/* Baut die Ein-Datei-Fassung: index.html mit allen Stylesheets, Skripten, Schriften und Bildern als Data-URIs.
   Ergebnis: dist/index.html (GitHub Pages) und dist/Vibecoding.html (zum Herunterladen). Keine Abhängigkeiten. */
import {readFileSync,writeFileSync,mkdirSync,statSync,existsSync} from 'node:fs';
import {dirname,join,extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(fileURLToPath(import.meta.url)),out=resolve(root,process.argv[2]||'dist');
const mime={'.ttf':'font/ttf','.otf':'font/otf','.woff':'font/woff','.woff2':'font/woff2','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm'};
const cache=new Map();let embedded=0;
function dataURI(file){if(!cache.has(file)){const type=mime[extname(file).toLowerCase()]||'application/octet-stream';cache.set(file,`data:${type};base64,${readFileSync(file).toString('base64')}`);embedded+=statSync(file).size}return cache.get(file)}
const external=ref=>/^(data:|https?:|\/\/|#|blob:)/i.test(ref);
function inlineCSS(file){return readFileSync(file,'utf8').replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g,(m,q,ref)=>{if(external(ref))return m;const target=join(dirname(file),ref.split(/[?#]/)[0]);return existsSync(target)?`url(${dataURI(target)})`:m})}
function inlineJS(file){return readFileSync(file,'utf8').replace(/<\/script/gi,'<\\/script')}

let html=readFileSync(join(root,'index.html'),'utf8');
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(m,href)=>external(href)?m:`<style>${inlineCSS(join(root,href))}</style>`);
html=html.replace(/<script src="([^"]+)"><\/script>/g,(m,src)=>external(src)?m:`<script>${inlineJS(join(root,src))}</script>`);
html=html.replace(/(<(?:img|video|source)\b[^>]*\ssrc=")([^"]+)(")/g,(m,a,src,b)=>external(src)?m:a+dataURI(join(root,src))+b);
html=html.replace('</title>','</title>\n<!-- Ein-Datei-Fassung, erzeugt mit build.mjs. Reveal.js 5.2.1, MIT · DM Sans, SIL OFL 1.1. Quellen und Bildnachweise: QUELLEN.md im Repository. -->');
if(/(href|src)="(?!data:|https?:|#)[^"]+\.(css|js|jpe?g|png|woff2?|ttf)"/.test(html))throw Error('Es sind noch relative Verweise übrig: '+html.match(/(href|src)="(?!data:|https?:|#)[^"]+\.(css|js|jpe?g|png|woff2?|ttf)"/g).join(', '));

mkdirSync(out,{recursive:true});
writeFileSync(join(out,'index.html'),html);
writeFileSync(join(out,'Vibecoding.html'),html);
writeFileSync(join(out,'.nojekyll'),'');
console.log(`Ein-Datei-Fassung gebaut: ${join(out,'index.html')} (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MB, ${cache.size} eingebettete Dateien, ${(embedded/1024/1024).toFixed(2)} MB Rohdaten)`);
