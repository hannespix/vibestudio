/* Gemeinsamer Baustein für Kapitelmotive aus echten Fotos (tools/scene-<name>.html, Rendern mit node tools/render-scene.mjs <name>).
   Die Szenendatei nennt die Vorlage (<meta name="scene-source">) und setzt window.PHOTO:
   circle  Kreis des Scheiben- oder Planetenrands in Vorlagenpixeln {x,y,r}, gemessen am Original
   scale   Folienpixel je Vorlagenpixel (bei 1600 × 900)
   apex    wohin der oberste Punkt des Kreises kommt {x,y} in Folienpixeln
   turn    Drehung der Vorlage um den Kreismittelpunkt in Grad (damit das Schönste oben liegt)
   fill    Farbe für Flächen, die die Vorlage nicht abdeckt; stars: Anzahl ergänzter Sterne dort
   grade   Canvas-Filter für eine leichte Farbkorrektur; clip: nur die Scheibe zeigen (Faktor des Radius)
   vignette weiche Abdunklung außerhalb des Kreises ab Faktor des Radius (z. B. für Beschriftungen im Original)
   levels  Tonwerte je Kanal vor allem anderen: {black:[r,g,b], white:[r,g,b], gamma} (z. B. Filmbasis zu Schwarz, Farbstich weg)
   grain   feine Körnung über dem fertigen Bild (Stärke in Tonwerten, z. B. 5)
   squash  Entzerrung schräg fotografierter Scheiben {x,y}: Faktoren entlang der Vorlagenachsen, damit die Ellipse wieder ein Kreis wird (circle.r ist dann der Radius entlang x)
   shadow  weicher Schatten unter einer freigestellten Scheibe {alpha, blur, dy, size}
   before/after  eigene Zeichenschritte vor bzw. nach dem Foto: (ctx, {C,R,u,W,H})
   split   die Scheibe als eigene Ebene, die sich allein dreht (z. B. der Mond vor der stehenden Erde) {margin, bottom, band, search, behind}:
           Ebene mit durchsichtigem Himmel, links, rechts und unten um margin/bottom Folienpixel größer als das Bild, damit beim Drehen
           keine Kante sichtbar wird; als Oberfläche zählt, was weder dunkel (Himmel) noch bläulich oder sehr hell ist (Erde, Wolken).
           Im Hintergrund wird ein Band von band Folienpixeln unter dem Scheibenrand mit Himmel gefüllt, innerhalb des Kreises behind
           {x,y,r} (Folienpixel, etwa die Erde) mit deren Fortsetzung, damit die drehende Scheibe nirgends Stehendes freilegt
   Ausgabe: window.sceneDataURL und window.scenePivot = [x %, y %, Radius] für motion.js (VibeMotionSettings.pivots),
            mit split zusätzlich window.sceneLayerDataURL (WebP mit Alpha) und window.sceneLayer (Lage der Ebene in Folienpixeln). */
(async()=>{
 const P=window.PHOTO,params=new URLSearchParams(location.search),scale=+params.get('scale')||2,quality=+params.get('q')||.88,seed=+params.get('seed')||7;
 const W=1600*scale,H=900*scale,u=scale,canvas=document.getElementById('c');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
 const img=new Image();img.src=window.sceneSource;await img.decode();
 const R=P.circle.r*P.scale,C={x:P.apex.x,y:P.apex.y+R};
 ctx.fillStyle=P.fill||'#000';ctx.fillRect(0,0,W,H);
 /* ergänzte Sterne nur dort, wo die Vorlage fehlt: erst zeichnen, die Vorlage deckt sie danach ab */
 if(P.stars){let a=seed>>>0;const rnd=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};for(let i=0;i<P.stars;i++){const x=rnd()*W,y=rnd()*H,r=(rnd()<.92?.4+rnd()*.5:.9+rnd()*.6)*u,b=(rnd()<.88?.12+rnd()*.22:.4+rnd()*.35)*(P.starGain||1);ctx.fillStyle=`rgba(${230+rnd()*25|0},${230+rnd()*25|0},255,${b})`;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}}
 if(P.before)P.before(ctx,{C,R,u,W,H});
 if(P.shadow){const sh=P.shadow;ctx.save();ctx.filter=`blur(${(sh.blur||30)*u}px)`;ctx.fillStyle=`rgba(0,0,0,${sh.alpha??.5})`;ctx.beginPath();ctx.arc(C.x*u,(C.y+(sh.dy||0))*u,R*(sh.size||1)*u,0,Math.PI*2);ctx.fill();ctx.restore()}
 /* weicher Rand der Vorlage, damit ergänzter Himmel und Foto ohne Kante ineinander übergehen */
 const feather=P.feather||0;let source=img;if(feather||P.levels){const off=document.createElement('canvas');off.width=img.naturalWidth;off.height=img.naturalHeight;const o=off.getContext('2d');o.drawImage(img,0,0);
  if(P.levels){const {black:b,white:w,gamma=1}=P.levels,lut=[0,1,2].map(ch=>Uint8ClampedArray.from({length:256},(_,v)=>255*Math.pow(Math.min(1,Math.max(0,(v-b[ch])/(w[ch]-b[ch]))),1/gamma))),id=o.getImageData(0,0,off.width,off.height),d=id.data;for(let k=0;k<d.length;k+=4){d[k]=lut[0][d[k]];d[k+1]=lut[1][d[k+1]];d[k+2]=lut[2][d[k+2]]}o.putImageData(id,0,0)}
  /* destination-out nimmt nur dort Deckkraft weg, wo gezeichnet wird: Streifen an den vier Kanten, außen voll, nach innen auslaufend */
  if(feather){o.globalCompositeOperation='destination-out';const f=feather,w=off.width,h=off.height,edge=(x0,y0,x1,y1,rx,ry,rw,rh)=>{const g=o.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'#000');g.addColorStop(1,'rgba(0,0,0,0)');o.fillStyle=g;o.fillRect(rx,ry,rw,rh)};edge(0,0,0,f,0,0,w,f);edge(0,h,0,h-f,0,h-f,w,f);edge(0,0,f,0,0,0,f,h);edge(w,0,w-f,0,w-f,0,f,h)}
  source=off}
 /* Foto an seinen Platz zeichnen; ox/oy verschieben alles, etwa für die größere Scheibenebene */
 const paint=(g,ox=0,oy=0)=>{g.save();if(P.clip){g.beginPath();g.arc((C.x+ox)*u,(C.y+oy)*u,R*P.clip*u,0,Math.PI*2);g.clip()}g.translate((C.x+ox)*u,(C.y+oy)*u);g.rotate((P.turn||0)*Math.PI/180);g.scale(P.scale*u*(P.squash?.x||1),P.scale*u*(P.squash?.y||1));if(P.grade)g.filter=P.grade;g.drawImage(source,-P.circle.x,-P.circle.y);g.restore()};
 paint(ctx);
 if(P.vignette){const g=ctx.createRadialGradient(C.x*u,C.y*u,R*u,C.x*u,C.y*u,R*P.vignette*u);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,P.fill||'#000');ctx.fillStyle=g;ctx.beginPath();ctx.rect(0,0,W,H);ctx.arc(C.x*u,C.y*u,R*u,0,Math.PI*2,true);ctx.fill()}
 if(P.after)P.after(ctx,{C,R,u,W,H});
 if(P.grain){let a=(seed*7919)>>>0;const rnd=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},id=ctx.getImageData(0,0,W,H),d=id.data;for(let k=0;k<d.length;k+=4){const v=(rnd()-.5)*P.grain;d[k]+=v;d[k+1]+=v;d[k+2]+=v}ctx.putImageData(id,0,0)}
 if(P.split){const sp=P.split,m=sp.margin??160,mb=sp.bottom??100,band=Math.round((sp.band??10)*u),search=sp.search??14,DW=W+2*m*u,DH=H+mb*u,layer=document.createElement('canvas');layer.width=DW;layer.height=DH;const g=layer.getContext('2d');paint(g,m,0);
  const L=g.getImageData(0,0,DW,DH),ld=L.data,B=ctx.getImageData(0,0,W,H),bd=B.data,lum=(d,k)=>.3*d[k]+.59*d[k+1]+.11*d[k+2];
  /* Oberfläche der Scheibe: weder Himmel (dunkel) noch Erde (blau oder sehr hell) */
  const surface=(d,k)=>{const l=lum(d,k);return l>(sp.sky??16)&&l<(sp.bright??170)&&d[k+2]<=d[k]+(sp.blue??2)},behind=sp.behind,inside=(x,y)=>behind&&Math.hypot(x-behind.x,y-behind.y)<behind.r;
  for(let X=0;X<DW;X++){const dx=X/u-m-C.x;let limb=DH;
   if(Math.abs(dx)<R){const yc=C.y-Math.sqrt(R*R-dx*dx),top=Math.max(0,Math.floor((yc-search)*u)),end=Math.min(DH-3,Math.ceil((yc+search)*u));limb=Math.round(yc*u);
    /* oberstes Pixel der Spalte, ab dem drei Pixel in Folge zur Oberfläche gehören: der tatsächliche Rand mit seinen Bergen */
    for(let Y=top;Y<end;Y++)if(surface(ld,(Y*DW+X)*4)&&surface(ld,((Y+1)*DW+X)*4)&&surface(ld,((Y+2)*DW+X)*4)){limb=Y;break}}
   /* Randpixel halb deckend, in der Farbe der Oberfläche direkt darunter (ohne Schimmer des Hintergrunds) */
   /* durchsichtige Pixel bekommen ebenfalls die Oberflächenfarbe, sonst mischt die Farbunterabtastung von WebP Blau in den Rand */
   if(limb<DH-1){const kb=((limb+1)*DW+X)*4;for(let Y=0;Y<=limb;Y++){const k=(Y*DW+X)*4;ld[k]=ld[kb];ld[k+1]=ld[kb+1];ld[k+2]=ld[kb+2];ld[k+3]=Y<limb?0:170}}else for(let Y=0;Y<DH;Y++)ld[(Y*DW+X)*4+3]=0;
   /* Hintergrund: Band unter dem Rand mit Himmel oder der gespiegelten Erde füllen, damit die drehende Scheibe dort nichts Stehendes freilegt */
   const Xb=X-m*u;if(Xb<0||Xb>=W||limb>=H)continue;
   /* Farbe der Fortsetzung: gespiegelt über den Rand, sonst das nächste Pixel darüber, das sicher zum Hintergrundkörper gehört */
   /* nur eindeutige Pixel des Hintergrundkörpers (deutlich bläulich oder hell), die gemischten Randpixel direkt über dem Rand überspringen */
   const x=Xb/u,edge=3,clear=k=>{const l=lum(bd,k);return l>(sp.sky??16)&&(bd[k+2]>bd[k]+8||l>150)},pick=Y=>{for(const ys of [Y>=limb?2*limb-Y-2*edge:-1,...Array.from({length:30},(_,n)=>limb-edge-1-n)]){if(ys<0)continue;const ks=(ys*W+Xb)*4;if(clear(ks))return ks}return -1};
   /* auch die gemischten Zeilen direkt über dem Rand ersetzen, sonst blitzen sie beim Drehen als feine Linie auf */
   for(let Y=Math.max(0,limb-edge);Y<Math.min(H,limb+band);Y++){const k=(Y*W+Xb)*4,ks=inside(x,Y/u)?pick(Y):-1;bd[k]=ks<0?0:bd[ks];bd[k+1]=ks<0?0:bd[ks+1];bd[k+2]=ks<0?0:bd[ks+2]}}
  g.putImageData(L,0,0);ctx.putImageData(B,0,0);
  window.sceneLayerDataURL=layer.toDataURL('image/webp',sp.quality??.86);window.sceneLayer={left:-m,top:0,width:1600+2*m,height:900+mb}}
 window.scenePivot=[+(C.x/16).toFixed(2),+(C.y/9).toFixed(2),Math.round(R)];
 window.sceneDataURL=canvas.toDataURL('image/jpeg',quality);window.rendered=true;
})();
