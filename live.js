/* Live-Ideen: Das Publikum schreibt auf dem Handy Ideen in eine pix·el-Präsentation (pix-el.de/interactive), hier erscheinen sie live als Bubbles auf der Folie.
   Datenquelle ist die Firebase Realtime Database von pix·el, gelesen per REST und Server-Sent Events (EventSource) ohne SDK; geschrieben wird nur die Folie, die das Publikum sieht.
   Gezeichnet wird alles hier, in der Gestaltung des Vortrags: Farben aus der Folie (currentColor), Schrift aus --sans, QR-Code mit uqr (assets/uqr.js, aus tools/vendor beim Bauen erzeugt).
   Die Physik ist an das Bubble-Board von pix·el angelehnt, aber ruhiger. Sie läuft nur auf der aktuellen Folie; bei pausierter Bewegung (Taste M, Editor) und bei reduzierter Bewegung
   steht sie still und setzt neue Bubbles sofort an ihren Platz. Diese Folie braucht Internet, der Rest des Vortrags nicht. */
window.addEventListener('DOMContentLoaded',()=>{
 const E=DeckEditor,$=s=>document.querySelector(s),container=$('.slides');let deck=null;
 const DB='https://impuls-6ccd3-default-rtdb.europe-west1.firebasedatabase.app',SITE='https://pix-el.de/interactive/',SHOWN='pix-el.de/interactive/';
 const TEMPLATE='<div class="eyebrow">live · eure ideen</div><h2>Was nehmt ihr mit?</h2><div class="live-board" aria-live="polite" aria-label="Ideen des Publikums"></div>';
 const SAMPLE=['Pilot mit echtem Fachverfahren','Internes GitLab','Datenbank als Dienst','Review-Regeln festlegen','Schulung für die Fachbereiche','Datenschutz früh klären','Kleine Schritte, schnelle Freigabe','Wer übernimmt den Betrieb?','Pilot mit echtem Fachverfahren'];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const running=()=>!reduced.matches&&!document.documentElement.classList.contains('motion-paused')&&document.visibilityState!=='hidden',editing=()=>document.body.classList.contains('editing');
 function config(){const s=E.state();s.studio||={};s.studio.live||={};return s.studio.live}
 const setting=id=>({slug:'',qr:true,...config()[id]});
 /* Kurzname der pix·el-Präsentation, auch aus einer eingefügten Adresse (pix-el.de/interactive/<slug>/…) */
 const slugOf=v=>String(v||'').trim().toLowerCase().replace(/^https?:\/\/[^/]+\//,'').replace(/^interactive\//,'').replace(/[?#].*$/,'').split('/')[0].replace(/[^a-z0-9-]/g,'');
 const large=()=>document.documentElement.dataset.typeScale==='large';
 /* Größe aus Textlänge und Mehrfachnennung; die Schrift wird so gewählt, dass der Text in den Kreis passt, lange Texte bekommen größere Kreise und kleinere Schrift */
 const radius=(len,count)=>{const f=large()?1.1:1;return Math.round(clamp((44+10.5*Math.sqrt(Math.max(1,len))+Math.min(36,(count-1)*9))*f,50*f,150*f))};
 const fontSize=(r,len)=>Math.round(clamp(Math.min(.24*r,1.45*r/Math.sqrt(Math.max(1,len))),large()?22:16,large()?30:27));
 const getJSON=async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('pix·el antwortet nicht ('+r.status+')');return r.json()};
 const putJSON=(url,value)=>fetch(url,{method:'PUT',body:JSON.stringify(value)}).then(r=>r.ok,()=>false);
 const boards=new Map();const currentSection=()=>deck?.getCurrentSlide()||container.querySelector(':scope>section.present');
 function create(section){const el=section.querySelector('.live-board');el.replaceChildren();section.querySelectorAll('.live-join').forEach(n=>n.remove());
  const join=document.createElement('div');join.className='live-join';join.dataset.liveRuntime='';join.hidden=true;section.append(join);
  const b={section,el,join,bubbles:new Map(),ideas:new Map(),obstacles:[],size:{W:1420,H:600},state:'idle',info:'',title:'',presId:null,key:null,index:0,stream:null,run:0,retry:0,timer:0,waitTimer:0,raf:0,lastT:0,dirty:false,demo:false,announced:null,id:()=>section.dataset.slideId,cfg:()=>setting(section.dataset.slideId),active:()=>section.isConnected&&section.classList.contains('present')};
  join.addEventListener('click',()=>{if(!editing())toggleLarge(b)});new ResizeObserver(()=>{measure(b);refresh(b)}).observe(el);boards.set(section,b);renderJoin(b);hint(b);return b}
 /* Fläche in Folienpixeln und die QR-Karte als Hindernis, damit keine Bubble den Code verdeckt */
 function measure(b){const W=b.el.offsetWidth||1420,H=b.el.offsetHeight||600;if(W!==b.size.W||H!==b.size.H)b.dirty=true;b.size={W,H};const s=deck?.getScale()||1,br=b.el.getBoundingClientRect(),jr=b.join.hidden?null:b.join.getBoundingClientRect();
  b.obstacles=jr&&jr.width&&br.width?[{x:((jr.left+jr.right)/2-br.left)/s,y:((jr.top+jr.bottom)/2-br.top)/s,r:Math.hypot(jr.width,jr.height)/2/s+10}]:[]}
 function qrSVG(text){const u=window.uqr;if(!u)return '';const {data,size}=u.encode(text,{ecc:'M',border:0});let d='';data.forEach((row,y)=>{for(let x=0;x<size;){if(!row[x]){x++;continue}let w=1;while(x+w<size&&row[x+w])w++;d+=`M${x} ${y}h${w}v1h-${w}z`;x+=w}});return `<svg class="live-code" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="QR-Code: ${esc(text)}"><path d="${d}"/></svg>`}
 function renderJoin(b){const c=b.cfg(),show=!!(c.slug&&c.qr!==false);b.join.hidden=!show;if(!show){b.join.replaceChildren();delete b.join.dataset.url;b.section.classList.remove('join-large');measure(b);return}
  const url=SITE+c.slug;if(b.join.dataset.url!==url){b.join.dataset.url=url;b.join.innerHTML=`${qrSVG(url)}<span class="live-title">Mitmachen</span><span class="live-url">${esc(SHOWN)}<wbr><b style="--n:${c.slug.length}">${esc(c.slug)}</b></span><span class="live-state" role="status"></span>`}
  b.join.querySelector('.live-state').textContent=b.state==='demo'?'Vorschau':b.state==='connecting'?'verbinde …':b.state==='wait'||b.state==='error'?'offline · neuer Versuch':'';measure(b)}
 function hint(b){const n=b.bubbles.size;b.el.dataset.state=b.state;b.el.dataset.liveCount=n;b.el.dataset.hint=n?'':b.state==='idle'?(editing()?'Live-Ideen · rechts den pix·el-Slug eintragen':''):b.state==='live'?'Noch keine Ideen · Code scannen und loslegen':b.state==='connecting'?'Verbinde mit pix·el …':b.state==='wait'?'Verbindung unterbrochen · neuer Versuch …':b.state==='error'?b.info:''}
 function statusText(b){const n=b.bubbles.size;switch(b.state){case 'demo':return 'Vorschau mit Beispielideen · keine Verbindung zu pix·el';case 'connecting':return 'Verbinde mit pix·el …';case 'live':return `Verbunden · ${n} ${n===1?'Idee':'Ideen'}`+(b.title?` · „${b.title}“`:'');case 'wait':return 'Verbindung unterbrochen · neuer Versuch …';case 'error':return b.info+' · neuer Versuch folgt';default:return b.cfg().slug?'Noch nicht verbunden · die Folie verbindet sich beim Aufruf':'Kein pix·el-Slug · die Bubbles bleiben leer'}}
 function setState(b,state,info=''){b.state=state;b.info=info;hint(b);renderJoin(b);if(editing())renderInspector()}
 /* Verbindung: Slug → Präsentation → Schlüssel der Ideen-Folie → Stream der Ideen */
 function disconnect(b){b.run++;clearTimeout(b.timer);clearTimeout(b.waitTimer);b.stream?.close();b.stream=null}
 function connect(b){disconnect(b);const slug=b.cfg().slug;if(b.demo||!slug){setState(b,b.demo?'demo':'idle');return}const run=b.run;setState(b,'connecting');
  (async()=>{const presId=await getJSON(`${DB}/slugs/${encodeURIComponent(slug)}.json`);if(run!==b.run)return;if(typeof presId!=='string')throw Error(`pix·el kennt keine Präsentation „${slug}“`);
   const [raw,title]=await Promise.all([getJSON(`${DB}/presentations/${presId}/slides.json`),getJSON(`${DB}/presentations/${presId}/title.json`).catch(()=>null)]);if(run!==b.run)return;
   let slides=[];try{slides=typeof raw==='string'?JSON.parse(raw):Array.isArray(raw)?raw:[]}catch{}const index=slides.findIndex(s=>s?.interaction==='ideas-fullscreen');if(index<0)throw Error('Die pix·el-Präsentation hat keine Folie „Ideen-Board“');
   const slide=slides[index];b.presId=presId;b.index=index;b.key=slide.ideas||slide.ideaCollection||`ideas-${index}`;b.title=typeof title==='string'?title:'';b.announced=null;open(b,run)})()
  .catch(e=>{if(run!==b.run)return;setState(b,'error',/^(pix·el|Die pix·el)/.test(e.message)?e.message:'Keine Verbindung zu pix·el');later(b)})}
 function open(b,run){const es=new EventSource(`${DB}/sessions/${b.presId}/ideas/${encodeURIComponent(b.key)}.json`);b.stream=es;
  es.addEventListener('put',e=>{if(run===b.run)apply(b,JSON.parse(e.data),true)});es.addEventListener('patch',e=>{if(run===b.run)apply(b,JSON.parse(e.data),false)});
  es.addEventListener('cancel',()=>{if(run!==b.run)return;disconnect(b);setState(b,'error','pix·el verweigert den Zugriff');later(b)});es.addEventListener('auth_revoked',()=>{if(run!==b.run)return;disconnect(b);later(b)});
  es.onopen=()=>{if(run!==b.run)return;clearTimeout(b.waitTimer);b.retry=0;setState(b,'live');if(b.active()&&!editing())announce(b)};
  /* Kurze Aussetzer überbrückt der Browser selbst; erst nach vier Sekunden ohne Verbindung zeigt die Folie „offline“ */
  es.onerror=()=>{if(run!==b.run)return;if(es.readyState===EventSource.CLOSED){disconnect(b);setState(b,'wait');later(b)}else{clearTimeout(b.waitTimer);b.waitTimer=setTimeout(()=>{if(run===b.run&&es.readyState!==EventSource.OPEN)setState(b,'wait')},4000)}}}
 function later(b){clearTimeout(b.timer);b.retry=Math.min(5,b.retry+1);b.timer=setTimeout(()=>connect(b),1500*2**b.retry)}
 /* Beim Vorführen schaltet die Folie das Publikum in pix·el auf das Ideen-Board, damit die Eingabe auf dem Handy offen ist (einmal je Aufruf, ohne Rückmeldung) */
 function announce(b){const mark=b.presId+'/'+b.index;if(b.presId==null||b.announced===mark)return;b.announced=mark;putJSON(`${DB}/sessions/${b.presId}/currentSlide.json`,b.index)}
 function apply(b,{path,data},replace){const segs=String(path||'/').split('/').filter(Boolean),ok=v=>v&&typeof v.text==='string';
  if(!segs.length){if(replace)b.ideas.clear();for(const[id,v]of Object.entries(data||{}))if(v==null)b.ideas.delete(id);else if(ok(v))b.ideas.set(id,v)}
  else if(segs.length===1){const id=segs[0];if(data==null)b.ideas.delete(id);else{const v=replace?data:{...b.ideas.get(id),...data};if(ok(v))b.ideas.set(id,v)}}
  else{const cur={...b.ideas.get(segs[0])};cur[segs[1]]=data;if(ok(cur))b.ideas.set(segs[0],cur)}sync(b)}
 /* Gleiche Texte werden eine Bubble mit Zähler; die älteste Nennung bestimmt die Identität, damit sie an ihrem Platz bleibt und nur wächst */
 const norm=t=>String(t||'').toLowerCase().replace(/\s+/g,' ').trim();
 function sync(b){const groups=new Map();for(const[id,v]of b.ideas){const key=norm(v.text);if(!key)continue;const g=groups.get(key),ts=Number(v.ts)||0;if(!g)groups.set(key,{id,text:String(v.text).trim(),ts,count:1});else{g.count++;if(ts<g.ts){g.ts=ts;g.id=id;g.text=String(v.text).trim()}}}
  const merged=[...groups.values()].sort((a,c)=>c.ts-a.ts),keep=new Set(merged.map(m=>m.id)),now=performance.now(),first=b.bubbles.size===0;
  for(const[id,x]of b.bubbles)if(!keep.has(id))x.gone=true;merged.forEach((m,i)=>{const x=b.bubbles.get(m.id);if(x){x.gone=false;update(x,m)}else spawn(b,m,i,now,first?i*70:0)});
  b.dirty=true;hint(b);refresh(b);if(editing())renderInspector()}
 function spawn(b,m,i,now,delay){const {W,H}=b.size,cx=W/2,cy=H/2,r=radius(m.text.length,m.count);let x,y;
  if(delay||i){const a=i*2.399963,ring=Math.floor(i/6),d=Math.min(60+ring*58+(i%6)*14,Math.min(W,H)*.38);x=cx+Math.cos(a)*d;y=cy+Math.sin(a)*d}else{const a=Math.random()*Math.PI*2;x=cx+Math.cos(a)*22;y=cy+Math.sin(a)*22}
  const node=document.createElement('div');node.className='live-bubble is-fresh';node.dataset.liveRuntime='';node.lang='de';const span=document.createElement('span');node.append(span);b.el.append(node);
  const bb={id:m.id,node,span,x:clamp(x,r+8,W-r-8),y:clamp(y,r+8,H-r-8),vx:0,vy:0,r:0,baseR:r,boxR:r,text:'',count:0,phase:Math.random()*Math.PI*2,born:now+delay,gone:false};
  b.bubbles.set(m.id,bb);update(bb,m);place(bb);setTimeout(()=>node.classList.remove('is-fresh'),2600+delay);return bb}
 function update(x,m){if(x.text===m.text&&x.count===m.count)return;const grew=x.count>0&&m.count>x.count;x.text=m.text;x.count=m.count;x.baseR=x.boxR=radius(m.text.length,m.count);x.span.textContent=m.text;x.span.style.fontSize=fontSize(x.baseR,m.text.length)+'px';x.node.style.width=x.node.style.height=x.baseR*2+'px';x.node.dataset.times=m.count>1?'×'+m.count:'';if(grew){x.node.classList.add('is-fresh');setTimeout(()=>x.node.classList.remove('is-fresh'),2600)}}
 function place(x){x.node.style.transform=`translate3d(${(x.x-x.boxR).toFixed(1)}px,${(x.y-x.boxR).toFixed(1)}px,0) scale(${(x.r/x.boxR).toFixed(3)})`}
 /* Ein Schritt der Simulation: sanfter Zug zur Mitte, leises Treiben, weiche Abstoßung untereinander und von der QR-Karte, Wände als Federn, Dämpfung. calm: ohne Treiben, Größe sofort */
 function step(b,now,k,calm){const {W,H}=b.size,cx=W/2,cy=H/2,list=[];for(const x of b.bubbles.values())if(calm||x.born<=now)list.push(x);
  for(const a of list){const target=a.gone?0:a.baseR;a.r=calm?target:a.r+(target-a.r)*Math.min(1,.12*k);const dx=cx-a.x,dy=cy-a.y,d=Math.hypot(dx,dy)||1;a.vx+=dx/d*.06*k;a.vy+=dy/d*.06*k;if(!calm&&!reduced.matches){a.vx+=Math.cos(now*.0006+a.phase)*.014*k;a.vy+=Math.sin(now*.0008+a.phase*1.7)*.014*k}}
  for(let i=0;i<list.length;i++){const a=list[i];for(let j=i+1;j<list.length;j++){const c=list[j],dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy)||1,min=a.r+c.r+7;if(d<min){const f=(min-d)*.11*k,nx=dx/d,ny=dy/d;a.vx-=nx*f;a.vy-=ny*f;c.vx+=nx*f;c.vy+=ny*f}}
   for(const o of b.obstacles){const dx=o.x-a.x,dy=o.y-a.y,d=Math.hypot(dx,dy)||1,min=a.r+o.r+8;if(d<min){const f=(min-d)*.2*k;a.vx-=dx/d*f;a.vy-=dy/d*f}}
   const p=8;if(a.x-a.r<p)a.vx+=(p-(a.x-a.r))*.16*k;if(a.x+a.r>W-p)a.vx-=((a.x+a.r)-(W-p))*.16*k;if(a.y-a.r<p)a.vy+=(p-(a.y-a.r))*.16*k;if(a.y+a.r>H-p)a.vy-=((a.y+a.r)-(H-p))*.16*k;
   const damp=Math.pow(.88,k);a.vx*=damp;a.vy*=damp;if(Math.abs(a.vx)<.015)a.vx=0;if(Math.abs(a.vy)<.015)a.vy=0;a.x+=a.vx*k;a.y+=a.vy*k;const m=a.r+2;a.x=clamp(a.x,Math.min(m,W/2),Math.max(W-m,W/2));a.y=clamp(a.y,Math.min(m,H/2),Math.max(H-m,H/2))}
  for(const a of list){place(a);if(a.gone&&a.r<1.5){a.node.remove();b.bubbles.delete(a.id)}}}
 function loop(b){if(b.raf)return;const frame=now=>{b.raf=0;if(!b.active()||!running()){b.lastT=0;return}const k=b.lastT?clamp((now-b.lastT)/16.7,.5,2.5):1;b.lastT=now;step(b,now,k,false);b.dirty=false;if(b.bubbles.size)b.raf=requestAnimationFrame(frame);else b.lastT=0};b.raf=requestAnimationFrame(frame)}
 /* Steht die Bewegung, werden Änderungen in einem Zug zu Ende gerechnet: neue Bubbles landen sofort an ihrem Platz, nichts springt beim Pausieren */
 function settle(b){if(!b.dirty)return;const now=performance.now();for(const x of b.bubbles.values())x.born=Math.min(x.born,now);for(let i=0;i<180;i++)step(b,now,1,true);b.dirty=false}
 function refresh(b){if(b.active()&&running())loop(b);else settle(b)}
 function toggleLarge(b,on=!b.section.classList.contains('join-large')){if(b.join.hidden)return;b.section.classList.toggle('join-large',on);measure(b);setTimeout(()=>{measure(b);refresh(b)},520);if(editing())renderInspector()}
 function toggleDemo(b,on=!b.demo){b.demo=on;disconnect(b);b.ideas.clear();if(on){const t=Date.now();SAMPLE.forEach((text,i)=>b.ideas.set('demo-'+i,{text,ts:t+i}));b.state='demo';b.info=''}else b.state='idle';sync(b);renderJoin(b);if(!on)connect(b);if(editing())renderInspector()}
 function activate(b){if(b.cfg().slug&&!b.stream&&b.state!=='connecting'&&!b.demo)connect(b);else if(b.state==='live'&&!editing())announce(b);hint(b)}
 function onSlide(){const i=deck?.getIndices().h??0,secs=[...container.querySelectorAll(':scope>section')];
  for(const b of boards.values()){const at=secs.indexOf(b.section);measure(b);if(b.active()){refresh(b);activate(b)}else{b.announced=null;if(b.section.classList.contains('join-large'))toggleLarge(b,false);if(at===i+1&&b.cfg().slug&&!b.stream&&b.state!=='connecting'&&!b.demo)connect(b)}}}
 /* Folien kommen und gehen über den Editor (neu, Kopie, Rückgängig): Boards entstehen, sobald eine Folie mit .live-board im Dokument steht */
 let scanTimer=0;const schedule=()=>{if(!scanTimer)scanTimer=setTimeout(()=>{scanTimer=0;scan()},0)};
 function scan(){let made=false;for(const s of container.querySelectorAll(':scope>section'))if(s.querySelector('.live-board')&&!boards.has(s)){create(s);made=true}for(const b of boards.values()){if(!b.section.isConnected){if(b.stream||b.timer){disconnect(b);b.state=b.demo?'demo':'idle'}}else if(b.active())activate(b)}if(made&&editing())renderInspector()}
 new MutationObserver(schedule).observe(container,{childList:true,subtree:true});
 new MutationObserver(()=>boards.forEach(refresh)).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 let wasEditing=editing();new MutationObserver(()=>{const now=editing();if(now===wasEditing)return;wasEditing=now;for(const b of boards.values()){if(!now&&b.demo)toggleDemo(b,false);hint(b);if(b.active())activate(b)}if(now)renderInspector()}).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>boards.forEach(refresh));reduced.addEventListener?.('change',()=>boards.forEach(b=>{b.dirty=true;refresh(b)}));
 /* Inspektor: Abschnitt im Tab „Folie“, nur auf Folien mit Bubble-Board */
 const panel=$('#live-properties');if(panel)panel.innerHTML=`<div class="studio-kicker">LIVE-IDEEN · PIX·EL</div><label>pix·el-Slug<input id="live-slug" aria-label="Kurzname der pix·el-Präsentation" placeholder="z. B. ideen-lvm" autocomplete="off" spellcheck="false"><span class="studio-help">Kurzname aus der Adresse der pix·el-Präsentation, pix-el.de/interactive/‹slug›. Sie braucht eine Folie „Ideen-Board“.</span></label><div id="live-status" class="studio-help" role="status"></div><label class="studio-checkbox"><input id="live-qr" type="checkbox"> QR-Code und Adresse auf der Folie</label><div class="studio-button-pair"><button type="button" id="live-demo" aria-pressed="false">Beispielideen</button><button type="button" id="live-large" aria-pressed="false">QR groß · Q</button></div><div class="studio-button-pair"><button type="button" id="live-open">pix·el-Presenter</button><button type="button" id="live-clear" class="subtle">Ideen löschen</button></div><p class="studio-help">Das Publikum scannt den Code und schreibt, die Bubbles erscheinen hier live; gleiche Ideen werden eine Bubble mit Zähler. Beim Aufruf der Folie wird das Publikum in pix·el auf das Ideen-Board geschaltet. Clustern und Abstimmen bleibt im pix·el-Presenter, parallel zu dieser Folie. Diese Folie braucht Internet, alles andere bleibt offline.</p><div class="studio-rule"></div>`;
 const here=()=>boards.get(currentSection());
 function renderInspector(){if(!panel)return;const b=here();panel.hidden=!b;if(!b)return;const c=b.cfg(),slug=$('#live-slug');if(document.activeElement!==slug)slug.value=c.slug;$('#live-qr').checked=c.qr!==false;$('#live-demo').setAttribute('aria-pressed',String(b.demo));$('#live-large').setAttribute('aria-pressed',String(b.section.classList.contains('join-large')));$('#live-large').disabled=b.join.hidden;$('#live-open').disabled=!c.slug;$('#live-clear').disabled=!(b.presId&&b.key&&b.state==='live');$('#live-status').textContent=statusText(b)}
 if(panel){$('#live-slug').onchange=e=>{const b=here();if(!b)return;const slug=slugOf(e.target.value);e.target.value=slug;config()[b.id()]={...setting(b.id()),slug};if(b.demo){b.demo=false;b.ideas.clear();sync(b)}E.commit();renderJoin(b);connect(b);E.status(slug?'pix·el-Slug „'+slug+'“ · die Folie verbindet sich':'pix·el-Slug entfernt')};
  $('#live-qr').onchange=e=>{const b=here();if(!b)return;config()[b.id()]={...setting(b.id()),qr:e.target.checked};E.commit();renderJoin(b);refresh(b);renderInspector()};
  $('#live-demo').onclick=()=>{const b=here();if(b)toggleDemo(b)};$('#live-large').onclick=()=>{const b=here();if(b)toggleLarge(b)};
  $('#live-open').onclick=()=>{const b=here();if(b?.cfg().slug)window.open(SITE+b.cfg().slug+'/presenter','_blank','noopener')};
  $('#live-clear').onclick=async()=>{const b=here();if(!b?.presId||!b.key)return;if(!confirm('Alle Ideen dieser pix·el-Folie löschen? Das Publikum sieht danach ein leeres Board.'))return;const ok=await putJSON(`${DB}/sessions/${b.presId}/ideas/${encodeURIComponent(b.key)}.json`,null);E.status(ok?'Ideen in pix·el gelöscht':'pix·el hat das Löschen abgelehnt')}}
 function toggleJoin(){const b=here();if(!b||b.join.hidden){window.DeckControls?.toast('Kein QR-Code auf dieser Folie');return}toggleLarge(b)}
 window.VibeLive={template:TEMPLATE,connect(d){deck=d;deck.on('slidechanged',onSlide);deck.on('resize',()=>boards.forEach(b=>{measure(b);refresh(b)}));scan();onSlide()},renderInspector,toggleJoin,sync:scan,boards:()=>[...boards.values()].map(b=>({id:b.id(),state:b.state,count:b.bubbles.size,size:b.size,obstacles:b.obstacles}))};
 scan();
});
