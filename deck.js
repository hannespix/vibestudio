window.addEventListener('DOMContentLoaded',()=>{
 const qs=s=>document.querySelector(s);let timer=null,auto=false,uiTimer;
 const deck=new Reveal({width:1600,height:900,margin:0,minScale:.1,maxScale:2,center:false,controls:false,progress:true,hash:true,history:true,transition:'fade',transitionSpeed:'slow',backgroundTransition:'fade',overview:true,keyboard:true,touch:true,help:false,autoAnimate:false,scrollActivationWidth:null});
 window.deck=deck;
 function toast(text){qs('#toast').textContent=text;qs('#toast').classList.add('visible');setTimeout(()=>qs('#toast').classList.remove('visible'),2100)}
 function update(){const i=deck.getIndices().h,n=deck.getTotalSlides();qs('#counter').textContent=String(i+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');qs('#prev').disabled=i===0;qs('#next').disabled=i===n-1;qs('#note-title').textContent=deck.getCurrentSlide().dataset.name;qs('#note-content').textContent=deck.getCurrentSlide().querySelector('aside.notes')?.textContent||'';DeckMotion.sync();if(auto)schedule()}
 function schedule(){clearTimeout(timer);timer=setTimeout(()=>{if(deck.isLastSlide()){auto=false;toast('Durchlauf beendet');return}deck.next()},Number(deck.getCurrentSlide().dataset.duration||14000))}
 function stopAuto(){auto=false;clearTimeout(timer)}
 function toggleAuto(){auto=!auto;if(auto){schedule();toast('Automatischer Durchlauf')}else{clearTimeout(timer);toast('Durchlauf pausiert')}}
 function toggleMotion(){const paused=DeckMotion.toggle();qs('#motion').setAttribute('aria-label',paused?'Hintergrundbewegung starten':'Hintergrundbewegung pausieren');toast(paused?'Bewegung pausiert':'Bewegung läuft')}
 function openDialog(id){const d=qs(id);d.open?d.close():d.showModal()}
 const fullscreenElement=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
 function toggleFullscreen(){const root=document.documentElement;if(fullscreenElement()){(document.exitFullscreen||document.webkitExitFullscreen)?.call(document);return}const request=root.requestFullscreen||root.webkitRequestFullscreen;if(!request){toast('Vollbild wird in diesem Browser nicht unterstützt');return}try{const result=request.call(root);if(result?.catch)result.catch(()=>toast('Vollbild nicht möglich'))}catch{toast('Vollbild nicht möglich')}}
 function updateFullscreen(){const on=!!fullscreenElement(),button=qs('#fullscreen');button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'Vollbild beenden':'Vollbild');button.title=(on?'Vollbild beenden':'Vollbild')+' · F'}
 if(!document.fullscreenEnabled&&!document.webkitFullscreenEnabled)qs('#fullscreen').hidden=true;document.addEventListener('fullscreenchange',updateFullscreen);document.addEventListener('webkitfullscreenchange',updateFullscreen);
 window.DeckControls={stopAuto,toast,update};
 deck.initialize().then(()=>{DeckEditor.connect(deck);update()});deck.on('slidechanged',update);deck.on('overviewshown',()=>DeckMotion.sync());deck.on('overviewhidden',()=>DeckMotion.sync());
 qs('#prev').onclick=()=>deck.prev();qs('#next').onclick=()=>deck.next();qs('#motion').onclick=toggleMotion;qs('#fullscreen').onclick=toggleFullscreen;qs('#notes').onclick=()=>openDialog('#notes-dialog');qs('#help').onclick=()=>openDialog('#help-dialog');qs('#edit').onclick=()=>DeckEditor.toggle();
 document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d)d.close()})});
 deck.addKeyBinding({keyCode:78,key:'N',description:'Sprechernotizen'},()=>openDialog('#notes-dialog'));deck.addKeyBinding({keyCode:77,key:'M',description:'Bewegung'},toggleMotion);deck.addKeyBinding({keyCode:80,key:'P',description:'Durchlauf'},toggleAuto);deck.addKeyBinding({keyCode:79,key:'O',description:'Übersicht'},()=>deck.toggleOverview());
 const showUI=()=>{document.body.classList.add('show-ui');clearTimeout(uiTimer);uiTimer=setTimeout(()=>document.body.classList.remove('show-ui'),2300)};document.addEventListener('pointermove',showUI);document.addEventListener('touchstart',showUI,{passive:true});showUI();
});
