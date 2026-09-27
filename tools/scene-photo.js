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
   Ausgabe: window.sceneDataURL und window.scenePivot = [x %, y %, Radius] für motion.js (VibeMotionSettings.pivots). */
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
 ctx.save();if(P.clip){ctx.beginPath();ctx.arc(C.x*u,C.y*u,R*P.clip*u,0,Math.PI*2);ctx.clip()}
 ctx.translate(C.x*u,C.y*u);ctx.rotate((P.turn||0)*Math.PI/180);ctx.scale(P.scale*u*(P.squash?.x||1),P.scale*u*(P.squash?.y||1));if(P.grade)ctx.filter=P.grade;
 /* weicher Rand der Vorlage, damit ergänzter Himmel und Foto ohne Kante ineinander übergehen */
 const feather=P.feather||0;let source=img;if(feather||P.levels){const off=document.createElement('canvas');off.width=img.naturalWidth;off.height=img.naturalHeight;const o=off.getContext('2d');o.drawImage(img,0,0);
  if(P.levels){const {black:b,white:w,gamma=1}=P.levels,lut=[0,1,2].map(ch=>Uint8ClampedArray.from({length:256},(_,v)=>255*Math.pow(Math.min(1,Math.max(0,(v-b[ch])/(w[ch]-b[ch]))),1/gamma))),id=o.getImageData(0,0,off.width,off.height),d=id.data;for(let k=0;k<d.length;k+=4){d[k]=lut[0][d[k]];d[k+1]=lut[1][d[k+1]];d[k+2]=lut[2][d[k+2]]}o.putImageData(id,0,0)}
  /* destination-out nimmt nur dort Deckkraft weg, wo gezeichnet wird: Streifen an den vier Kanten, außen voll, nach innen auslaufend */
  if(feather){o.globalCompositeOperation='destination-out';const f=feather,w=off.width,h=off.height,edge=(x0,y0,x1,y1,rx,ry,rw,rh)=>{const g=o.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'#000');g.addColorStop(1,'rgba(0,0,0,0)');o.fillStyle=g;o.fillRect(rx,ry,rw,rh)};edge(0,0,0,f,0,0,w,f);edge(0,h,0,h-f,0,h-f,w,f);edge(0,0,f,0,0,0,f,h);edge(w,0,w-f,0,w-f,0,f,h)}
  source=off}
 ctx.drawImage(source,-P.circle.x,-P.circle.y);
 ctx.restore();
 if(P.vignette){const g=ctx.createRadialGradient(C.x*u,C.y*u,R*u,C.x*u,C.y*u,R*P.vignette*u);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,P.fill||'#000');ctx.fillStyle=g;ctx.beginPath();ctx.rect(0,0,W,H);ctx.arc(C.x*u,C.y*u,R*u,0,Math.PI*2,true);ctx.fill()}
 if(P.after)P.after(ctx,{C,R,u,W,H});
 if(P.grain){let a=(seed*7919)>>>0;const rnd=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},id=ctx.getImageData(0,0,W,H),d=id.data;for(let k=0;k<d.length;k+=4){const v=(rnd()-.5)*P.grain;d[k]+=v;d[k+1]+=v;d[k+2]+=v}ctx.putImageData(id,0,0)}
 window.scenePivot=[+(C.x/16).toFixed(2),+(C.y/9).toFixed(2),Math.round(R)];
 window.sceneDataURL=canvas.toDataURL('image/jpeg',quality);window.rendered=true;
})();
