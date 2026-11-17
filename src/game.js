import pl0 from './assets/planes/comum.png'
import pl1 from './assets/planes/raro.png'
import pl2 from './assets/planes/epico.png'
import pl3 from './assets/planes/lendario.png'
import boss1 from './assets/bosses/chefe1.png'
import bg1 from './assets/backgrounds/fase1.jpg'
import bg2 from './assets/backgrounds/fase2.jpg'
import bg3 from './assets/backgrounds/fase3.jpg'
import bg4 from './assets/backgrounds/fase4.jpg'
import bg5 from './assets/backgrounds/fase5.jpg'
import bg6 from './assets/backgrounds/fase6.jpg'
import bg7 from './assets/backgrounds/fase7.jpg'
import { cloud, submitRun, chooseCloudPlane } from './cloud.js'
const PL_URLS=[pl0,pl1,pl2,pl3],BOSS_URLS=[boss1],BG_URLS=[bg1,bg2,bg3,bg4,bg5,bg6,bg7]
const C=document.getElementById('c'),X=C.getContext('2d'),W=480,H=854;C.width=W*2;C.height=H*2;
let sc=1;function fit(){sc=Math.min(innerWidth/W,innerHeight/H);C.style.width=W*sc+'px';C.style.height=H*sc+'px'}
addEventListener('resize',fit);fit();
let hi=0;try{hi=+localStorage.getItem('tf_hi')||0}catch(e){}
const keys={};let mode='title',S,P,bgY=0,E=[],PB=[],EB=[],PU=[],PT=[];
const clouds=Array.from({length:7},()=>({x:Math.random()*W,y:Math.random()*H,s:30+Math.random()*50}));
const ld=s=>{const i=new Image();i.src=s;return i};
const PLIMG=PL_URLS.map(ld),BOSSIMG=BOSS_URLS.map(ld);
const PLANES=[{id:'comum',nome:'Comum',cor:'#9aa5b1',bc:'#ffe066',cost:0,lives:3,dmg:1,cd:.13,spd:300},{id:'raro',nome:'Raro',cor:'#3a8dff',bc:'#8fc8ff',cost:500,lives:3,dmg:1.3,cd:.115,spd:310},{id:'epico',nome:'Épico',cor:'#e0453a',bc:'#ff9a8a',cost:1500,lives:4,dmg:1.7,cd:.105,spd:320},{id:'lendario',nome:'Lendário',cor:'#ffc400',bc:'#7fe6ff',cost:4000,lives:5,dmg:2.2,cd:.09,spd:330}];
let SAVE={coins:0,owned:['comum'],sel:0};try{const s=JSON.parse(localStorage.getItem('tf_save'));if(s&&Array.isArray(s.owned))SAVE=Object.assign(SAVE,s)}catch(e){}
if(!(SAVE.sel>=0&&SAVE.sel<PLANES.length))SAVE.sel=0;
function persist(){try{localStorage.setItem('tf_save',JSON.stringify(SAVE))}catch(e){}}
let bi=SAVE.sel,toast='',toastT=0;
let playIdx=SAVE.sel;
const logged=()=>!!(cloud.user&&cloud.state);
const coinsNow=()=>logged()?cloud.state.coins:SAVE.coins;
const ownsId=id=>logged()?cloud.state.owned.includes(id):SAVE.owned.includes(id);
const selId=()=>logged()?cloud.state.selected:PLANES[SAVE.sel].id;
const bestNow=()=>logged()?((cloud.state.best||{}).historia||0):hi;
const errMsg=e=>e&&e.includes('too_fast')?'Aguarde alguns segundos entre as partidas.':e&&e.includes('implausible')?'O servidor recusou esta pontuação.':'Verifique a conexão e tente de novo.';
addEventListener('tf-cloud',()=>{const i=PLANES.findIndex(p=>p.id===selId());bi=i>=0?i:0});
function reset(){S={t:0,score:0,stage:1,sp:1,sm:6,bt:40,boss:null,tr:{t:2.8,done:true},t0:performance.now(),sync:''};const pl=PLANES[playIdx];P={x:W/2,y:H-110,lives:pl.lives,inv:2,cd:0,level:1,pl};E=[];PB=[];EB=[];PU=[];PT=[]}
function plane(x,y,s,c1,c2,down){X.save();X.translate(x,y);if(down)X.scale(1,-1);X.scale(s,s);
X.fillStyle=c2;X.beginPath();X.moveTo(0,-14);X.lineTo(22,6);X.lineTo(22,11);X.lineTo(0,5);X.lineTo(-22,11);X.lineTo(-22,6);X.closePath();X.fill();
X.fillRect(-9,12,18,3);X.fillStyle=c1;X.beginPath();X.ellipse(0,0,5,16,0,0,7);X.fill();
X.fillStyle='#bfe6ff';X.beginPath();X.ellipse(0,-3,2.5,4,0,0,7);X.fill();X.restore()}
function bomber(x,y,s,f){X.save();X.translate(x,y);X.scale(s,-s);
X.fillStyle=f?'#fff':'#7a8a4a';X.fillRect(-52,-8,104,22);
X.fillStyle=f?'#fff':'#5d6b38';X.beginPath();X.ellipse(0,0,10,42,0,0,7);X.fill();
X.fillRect(-18,30,36,6);
X.fillStyle=f?'#fff':'#c0392b';X.beginPath();X.arc(-38,3,5,0,7);X.arc(38,3,5,0,7);X.fill();
X.fillStyle=f?'#fff':'#333';X.fillRect(-30,-14,8,10);X.fillRect(22,-14,8,10);
X.fillStyle='#bfe6ff';X.beginPath();X.ellipse(0,-22,4,7,0,0,7);X.fill();X.restore()}
function boom(x,y,n,c){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=40+Math.random()*180;PT.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.4+Math.random()*.4,c:c||(Math.random()<.5?'#ffb000':'#ff4a1c')})}}
function shoot(){const o={1:[[0,0]],2:[[-8,0],[8,0]],3:[[0,0],[-10,-90],[10,90]],4:[[-8,0],[8,0],[-14,-110],[14,110]],5:[[0,0],[-10,-70],[10,70],[-16,-160],[16,160]]}[P.level];
o.forEach(a=>PB.push({x:P.x+a[0],y:P.y-18,vx:a[1],vy:-640,d:P.pl.dmg}))}
function addE(k,x,y,ph){const d={0:{hp:1,r:14,vy:90+S.stage*8,vx:70},1:{hp:10+S.stage*2,r:32,vy:55,vx:0},2:{hp:140+S.stage*40,r:75,vy:50,vx:0}}[k];
const e={k,x,y,ph:ph||0,hp:d.hp,max:d.hp,r:d.r,vy:d.vy,vx:d.vx,cd:1+Math.random()*2,f:0};E.push(e);return e}
function aim(e,sp){const a=Math.atan2(P.y-e.y,P.x-e.x);EB.push({x:e.x,y:e.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp})}
function ring(e,n,sp,off){for(let i=0;i<n;i++){const a=off+i*6.283/n;EB.push({x:e.x,y:e.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp})}}
function kill(e){boom(e.x,e.y,e.k?50:14);S.score+=[100,500,3000][e.k];
if(e.k||Math.random()<.07)PU.push({x:e.x,y:e.y});if(e.k==2){PU.push({x:e.x-40,y:e.y});PU.push({x:e.x+40,y:e.y});S.boss=null;S.tr={t:0,done:false};EB=[]}
E.splice(E.indexOf(e),1)}
function hurt(){if(P.inv>0)return;boom(P.x,P.y,40,'#9fd8ff');P.lives--;P.inv=2;P.level=Math.max(1,P.level-1);EB=[];
if(P.lives<=0){mode='over';S.ot=0;if(logged()){S.sync='saving';S.earned=0;submitRun('historia',S.score,S.stage,Math.max((performance.now()-S.t0)/1000,S.t)).then(r=>{if(r&&!r.error){S.earned=r.coins_earned;S.record=r.is_record;S.sync='ok'}else{S.sync='err';S.err=(r&&r.error)||''}})}else{S.earned=Math.floor(S.score/10);SAVE.coins+=S.earned;persist()}if(S.score>hi){hi=S.score;try{localStorage.setItem('tf_hi',hi)}catch(e){}}}}
function update(dt){S.t+=dt;bgY+=60*dt;
if(S.tr){const T=S.tr;T.t+=dt;if(T.t>=2.8&&!T.done){T.done=true;S.stage++;S.bt=40;E=[];PB=[];EB=[];PU=[];PT=[];P.x=W/2;P.y=H-110}if(T.t>=4.2)S.tr=null}
const dx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0),dy=(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);
P.x=Math.max(20,Math.min(W-20,P.x+dx*P.pl.spd*dt));P.y=Math.max(40,Math.min(H-30,P.y+dy*P.pl.spd*dt));
P.inv-=dt;P.cd-=dt;if(S.tr)P.inv=Math.max(P.inv,.1);if(P.cd<=0&&!(S.tr&&S.tr.t>2)){shoot();P.cd=P.pl.cd}
S.sp-=dt;if(S.sp<=0&&!S.boss&&!S.tr){S.sp=Math.max(1.3,3-S.stage*.25);const x0=70+Math.random()*(W-140),n=5,ph=Math.random()*6;
for(let i=0;i<n;i++)addE(0,x0+(i-2)*38,-20-Math.abs(i-2)*34,ph)}
S.sm-=dt;if(S.sm<=0&&!S.boss&&!S.tr){S.sm=Math.max(4,8-S.stage);addE(1,70+Math.random()*(W-140),-50)}
S.bt-=dt;if(S.bt<=0&&!S.boss&&!S.tr){S.boss=addE(2,W/2,-120)}
for(const e of E.slice()){e.f-=dt;e.cd-=dt;
if(e.k==0){e.y+=e.vy*dt;e.x+=Math.sin(S.t*2+e.ph)*e.vx*dt;if(e.cd<=0&&e.y>0&&e.y<H*.6){aim(e,170);e.cd=3+Math.random()*3}}
else if(e.k==1){if(e.y<150)e.y+=e.vy*dt;else{e.x+=Math.sin(S.t+e.ph)*50*dt;e.y+=12*dt}
if(e.cd<=0&&e.y>0){for(let i=-1;i<=1;i++){const a=Math.atan2(P.y-e.y,P.x-e.x)+i*.25;EB.push({x:e.x,y:e.y,vx:Math.cos(a)*190,vy:Math.sin(a)*190})}e.cd=1.7}}
else{if(e.y<165)e.y+=e.vy*dt;else{e.x=W/2+Math.sin(S.t*.8)*80;
if(e.cd<=0){if(Math.random()<.5)ring(e,14,150,S.t);else for(let i=-3;i<=3;i++){const a=Math.atan2(P.y-e.y,P.x-e.x)+i*.18;EB.push({x:e.x,y:e.y,vx:Math.cos(a)*220,vy:Math.sin(a)*220})}e.cd=1.2}}}
if(e.y>H+90)E.splice(E.indexOf(e),1)}
for(const b of PB){b.x+=b.vx*dt;b.y+=b.vy*dt}PB=PB.filter(b=>b.y>-20&&b.x>-20&&b.x<W+20);
for(const b of PB.slice()){for(const e of E){if(Math.hypot(b.x-e.x,b.y-e.y)<e.r+4){e.hp-=b.d||1;e.f=.06;PB.splice(PB.indexOf(b),1);if(e.hp<=0)kill(e);break}}}
for(const b of EB){b.x+=b.vx*dt;b.y+=b.vy*dt}EB=EB.filter(b=>b.y>-20&&b.y<H+20&&b.x>-20&&b.x<W+20);
for(const b of EB)if(Math.hypot(b.x-P.x,b.y-P.y)<9){hurt();break}
for(const e of E)if(Math.hypot(e.x-P.x,e.y-P.y)<e.r*.8+8){hurt();break}
for(const p of PU){p.y+=70*dt;if(Math.hypot(p.x-P.x,p.y-P.y)<24){p.y=H+99;P.level=Math.min(5,P.level+1);S.score+=100}}
PU=PU.filter(p=>p.y<H+30);
for(const p of PT){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt}PT=PT.filter(p=>p.l>0)}
function txt(t,x,y,s,c,a){X.font='bold '+s+'px system-ui,sans-serif';X.textAlign=a||'center';X.fillStyle=c||'#fff';X.fillText(t,x,y)}
const BGS=BG_URLS.map(s=>{const i=new Image();i.src=s;return i});
function drawBG(){const im=BGS[(S.stage-1)%BGS.length];if(im.complete&&im.naturalWidth){const Th=W*im.naturalHeight/im.naturalWidth,y0=bgY%Th;for(let i=-1;i<=1;i++)X.drawImage(im,0,y0+i*Th,W,Th+1);X.fillStyle='rgba(0,0,0,.12)';X.fillRect(0,0,W,H)}else{X.fillStyle='#0d4fa8';X.fillRect(0,0,W,H)}}
function draw(){X.setTransform(2,0,0,2,0,0);drawBG();
for(const p of PU){X.fillStyle='#ffd23f';X.beginPath();X.arc(p.x,p.y,13,0,7);X.fill();txt('P',p.x,p.y+6,16,'#7a3b00')}
for(const e of E){if(e.k==0)plane(e.x,e.y,.9,e.f>0?'#fff':'#2e8b57',e.f>0?'#fff':'#1d6a40',true);else if(e.k==2&&BOSSIMG[S.stage-1]&&BOSSIMG[S.stage-1].naturalWidth){const im=BOSSIMG[S.stage-1],w=250,h=w*im.naturalHeight/im.naturalWidth;X.save();X.translate(e.x,e.y);X.rotate(Math.PI);if(e.f>0)X.globalAlpha=.6;X.drawImage(im,-w/2,-h/2,w,h);X.restore()}else bomber(e.x,e.y,e.k==2?1.7:.75,e.f>0);
if(e.k==2){X.fillStyle='#0008';X.fillRect(60,76,W-120,8);X.fillStyle='#ff4a1c';X.fillRect(60,76,(W-120)*e.hp/e.max,8)}}
X.fillStyle=P.pl.bc;for(const b of PB)X.fillRect(b.x-2,b.y-9,4,16);
for(const b of EB){X.fillStyle='#ff5a36';X.beginPath();X.arc(b.x,b.y,5,0,7);X.fill();X.fillStyle='#fff';X.beginPath();X.arc(b.x,b.y,2,0,7);X.fill()}
if(mode!='over'&&(P.inv<=0||Math.floor(S.t*12)%2)){const im=PLIMG[playIdx];if(im.naturalWidth){const w=68,h=w*im.naturalHeight/im.naturalWidth;X.drawImage(im,P.x-w/2,P.y-h/2,w,h)}}
for(const p of PT){X.globalAlpha=Math.min(1,p.l*2.5);X.fillStyle=p.c;X.fillRect(p.x-2,p.y-2,4,4)}X.globalAlpha=1;
txt('PONTOS '+S.score,14,30,20,'#fff','left');txt('RECORDE '+Math.max(hi,S.score),W-14,30,14,'#cfe3ff','right');
txt('FASE '+S.stage+'   ARMA '+P.level,14,52,13,'#cfe3ff','left');for(let i=0;i<P.lives;i++){const im=PLIMG[playIdx];if(im.naturalWidth)X.drawImage(im,W-32-i*26,44,22,22*im.naturalHeight/im.naturalWidth)}
if(S.tr&&mode=='play'){const T=S.tr.t;let r=490;if(T>2&&T<2.8)r=490*(1-(T-2)/.8);else if(T>=2.8&&T<3.3)r=0;else if(T>=3.3)r=490*Math.min(1,(T-3.3)/.9);
if(r<490){X.fillStyle='#000';X.beginPath();X.rect(0,0,W,H);X.arc(W/2,H/2,Math.max(r,0),0,7);X.fill('evenodd')}
if(T>.2&&T<2)txt('FASE CONCLUÍDA!',W/2,H/2,34,'#ffe066');
if(T>=2.8&&T<4.0){X.globalAlpha=T<3.6?1:(4-T)/.4;txt('FASE '+S.stage,W/2,H/2,48,'#fff');X.globalAlpha=1}}}
function screen(a,b,c){X.fillStyle='#000a';X.fillRect(0,0,W,H);txt(a,W/2,H/2-60,44);txt(b,W/2,H/2-10,20,'#ffe066');txt(c,W/2,H/2+40,15,'#cfe3ff')}
let last=0;function loop(t){if(document.body.dataset.mode!==mode)document.body.dataset.mode=mode;const dt=Math.min(.033,(t-last)/1000||0);last=t;
if(mode=='over')S.ot+=dt;if(mode=='play')update(dt);else if(S){bgY+=40*dt}
if(mode=='title'){X.setTransform(2,0,0,2,0,0);drawBG();drawHangar()}else draw();if(mode=='over')drawOver();
requestAnimationFrame(loop)}
function start(){reset();mode='play'}
function goTitle(){reset();mode='title'}
function drawHangar(){const p=PLANES[bi],own=ownsId(p.id),t=performance.now()/1000;
X.fillStyle='rgba(2,10,30,.72)';X.fillRect(0,0,W,H);
txt('THUNDERFRONT',W/2,92,38);txt('AIR COMBAT  •  HANGAR',W/2,120,14,'#9fc4ff');txt('MOEDAS  '+coinsNow(),W/2,152,20,'#ffd23f');txt(logged()?'Conta conectada  •  progresso salvo na nuvem':'Visitante  •  progresso só neste aparelho',W/2,176,12,'#9fc4ff');
const im=PLIMG[bi];if(im.naturalWidth){const w=230,h=w*im.naturalHeight/im.naturalWidth;X.globalAlpha=own?1:.35;X.drawImage(im,W/2-w/2,330-h/2+Math.sin(t*2)*6,w,h);X.globalAlpha=1}
if(!own)txt('BLOQUEADO',W/2,340,26,'#fff');
txt('◀',44,340,40,'#9fc4ff');txt('▶',W-44,340,40,'#9fc4ff');
txt(p.nome.toUpperCase(),W/2,470,32,p.cor);txt((bi+1)+' / '+PLANES.length+(selId()==p.id&&own?'  •  EM USO':''),W/2,494,13,'#cfe3ff');
[['VIDAS',p.lives/5],['DANO',p.dmg/2.2],['CADÊNCIA',.13/p.cd/1.5]].forEach((r,i)=>{const y=530+i*28;txt(r[0],70,y+9,13,'#cfe3ff','left');X.fillStyle='#fff3';X.fillRect(180,y,230,10);X.fillStyle=p.cor;X.fillRect(180,y,230*Math.min(1,r[1]),10)});
const can=own||(!logged()&&SAVE.coins>=p.cost);X.fillStyle=can?p.cor:'#555';X.fillRect(W/2-140,640,280,56);
txt(own?'JOGAR':(logged()?'COMPRA EM BREVE':(can?'COMPRAR  '+p.cost:'FALTAM '+(p.cost-SAVE.coins)+' MOEDAS')),W/2,676,22,can?'#111':'#ccc');
txt('Toque nas laterais ou use ← → para trocar de avião',W/2,740,13,'#9fc4ff');txt('Recorde: '+bestNow(),W/2,766,14,'#cfe3ff');
if(performance.now()<toastT)txt(toast,W/2,616,20,'#7CFC9A')}
function drawOver(){X.fillStyle='#000b';X.fillRect(0,0,W,H);txt('FIM DE JOGO',W/2,H/2-80,44);txt('Pontos: '+S.score,W/2,H/2-30,22,'#ffe066');
if(logged()){if(S.sync=='saving')txt('Salvando na conta...',W/2,H/2+10,18,'#9fc4ff');else if(S.sync=='ok'){txt('+'+S.earned+' moedas'+(S.record?'  •  NOVO RECORDE!':''),W/2,H/2+10,22,'#ffd23f');txt('Total: '+cloud.state.coins+' moedas',W/2,H/2+40,15,'#cfe3ff')}else{txt('Não foi possível salvar esta partida.',W/2,H/2+10,16,'#ff8a7a');txt(errMsg(S.err),W/2,H/2+34,13,'#cfe3ff')}}
else{txt('+'+S.earned+' moedas',W/2,H/2+10,22,'#ffd23f');txt('Total: '+SAVE.coins+' moedas',W/2,H/2+40,15,'#cfe3ff')}
if(S.ot>.8&&S.sync!='saving')txt('Toque para voltar ao hangar',W/2,H/2+100,16,'#9fc4ff')}
function hangarBtn(){const p=PLANES[bi];
if(ownsId(p.id)){playIdx=bi;if(logged()){chooseCloudPlane(p.id);start()}else{SAVE.sel=bi;persist();start()}}
else if(logged()){toast='A compra de aviões chega na próxima etapa.';toastT=performance.now()+2200}
else if(SAVE.coins>=p.cost){SAVE.coins-=p.cost;SAVE.owned.push(p.id);SAVE.sel=bi;persist();toast='Avião desbloqueado!';toastT=performance.now()+1800}}
function act(k){if(mode=='title'){if(k=='ArrowLeft')bi=(bi+PLANES.length-1)%PLANES.length;else if(k=='ArrowRight')bi=(bi+1)%PLANES.length;else if(k=='Enter'||k==' ')hangarBtn()}else if(mode=='over'&&S.ot>.8&&S.sync!='saving'&&(k=='Enter'||k==' '))goTitle()}

reset();requestAnimationFrame(loop);
addEventListener('keydown',e=>{if(e.target&&e.target.closest&&e.target.closest('#auth'))return;keys[e.key]=1;act(e.key);if(e.key.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>keys[e.key]=0);
let drag=null;C.addEventListener('pointerdown',e=>{const r=C.getBoundingClientRect(),lx=(e.clientX-r.left)/r.width*W,ly=(e.clientY-r.top)/r.height*H;
if(mode=='play'){drag={x:e.clientX,y:e.clientY};C.setPointerCapture(e.pointerId)}
else if(mode=='title'){if(ly>630&&ly<706&&Math.abs(lx-W/2)<150)hangarBtn();else if(ly>180&&ly<600)act(lx<W/2?'ArrowLeft':'ArrowRight')}
else if(mode=='over'&&S.ot>.8&&S.sync!='saving')goTitle()});
C.addEventListener('pointermove',e=>{if(!drag||mode!='play')return;P.x=Math.max(20,Math.min(W-20,P.x+(e.clientX-drag.x)/sc*1.3));P.y=Math.max(40,Math.min(H-30,P.y+(e.clientY-drag.y)/sc*1.3));drag={x:e.clientX,y:e.clientY}});
C.addEventListener('pointerup',()=>drag=null);C.addEventListener('pointercancel',()=>drag=null);
