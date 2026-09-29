const $=id=>document.getElementById(id);
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
const today=()=>new Date().toISOString().slice(0,10);
let user=JSON.parse(localStorage.getItem('cp_user')||'null');
let rides=JSON.parse(localStorage.getItem('cp_rides')||'[]');
let settings=JSON.parse(localStorage.getItem('cp_settings')||'null')||{
 consumption:12,fuel:4.90,maintenance:0.25,insurance:257,ipva:530,tires:100,other:0,monthlyKm:3000
};

function toast(msg){$('toast').textContent=msg;$('toast').className='show';setTimeout(()=>$('toast').className='',2500)}
function showRegister(){$('loginBox').classList.add('hidden');$('registerBox').classList.remove('hidden')}
function showLogin(){$('registerBox').classList.add('hidden');$('loginBox').classList.remove('hidden')}
function register(){
 const name=$('regName').value.trim(),email=$('regEmail').value.trim().toLowerCase(),pass=$('regPass').value;
 if(!name||!email||pass.length<4)return toast('Preencha nome, e-mail e senha de 4+ caracteres.');
 localStorage.setItem('cp_user',JSON.stringify({name,email,pass}));
 user={name,email,pass}; enterApp();toast('Conta criada com sucesso!');
}
function login(){
 const email=$('loginEmail').value.trim().toLowerCase(),pass=$('loginPass').value;
 const saved=JSON.parse(localStorage.getItem('cp_user')||'null');
 if(!saved||saved.email!==email||saved.pass!==pass)return toast('E-mail ou senha incorretos.');
 user=saved;enterApp();
}
function logout(){user=null;$('app').classList.add('hidden');$('auth').classList.remove('hidden')}
function enterApp(){
 $('auth').classList.add('hidden');$('app').classList.remove('hidden');$('hello').textContent='Olá, '+user.name.split(' ')[0];loadSettings();render();go('home');
}
function go(page){
 document.querySelectorAll('.page').forEach(x=>x.classList.add('hidden'));
 $('page-'+page).classList.remove('hidden');
 document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
 if(page==='home')renderHome();if(page==='rides')renderRides();if(page==='calculator'){calculate();renderCosts()}
}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>go(b.dataset.page));

function costPerKm(){
 const fuel=settings.fuel/settings.consumption;
 const fixed=(settings.insurance+settings.ipva/12+settings.tires+settings.other)/Math.max(settings.monthlyKm,1);
 return fuel+settings.maintenance+fixed;
}
function rideCost(km){return km*costPerKm()}
function render(){
 renderHome();renderRides();renderCosts();
}
function renderHome(){
 const upcoming=rides.filter(r=>r.status==='agendada').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 $('statRides').textContent=upcoming.length;
 const rev=upcoming.reduce((s,r)=>s+Number(r.value||0),0);
 const km=upcoming.reduce((s,r)=>s+Number(r.km||0),0);
 $('statRevenue').textContent=money(rev);$('statKm').textContent=km.toFixed(1)+' km';$('statProfit').textContent=money(rev-rideCost(km));
 $('nextRides').innerHTML=upcoming.slice(0,5).map(rideHTML).join('')||'<p class="muted">Nenhuma corrida agendada.</p>';
}
function rideHTML(r){
 const d=new Date(r.date+'T'+(r.time||'00:00'));const ds=d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
 return `<div class="ride"><div><strong>${esc(r.passenger)}</strong><div class="route">📍 ${esc(r.pickup)} → ${esc(r.destination)}</div><div class="meta">📅 ${ds} às ${r.time||'--:--'} · ${r.km} km</div><span class="badge">${r.status}</span></div><div class="money">${money(r.value)}<br><button class="linkbtn" onclick="toggleStatus('${r.id}')">${r.status==='agendada'?'Concluir':'Reabrir'}</button> <button class="linkbtn" onclick="deleteRide('${r.id}')">Excluir</button></div></div>`;
}
function renderRides(){renderRidesFiltered('all')}
function renderRidesFiltered(filter){
 let list=rides.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 if(filter!=='all')list=list.filter(r=>r.status===filter);
 $('ridesList').innerHTML=list.map(rideHTML).join('')||'<div class="panel"><p class="muted">Nenhuma corrida encontrada.</p></div>';
}
function filterRides(f,btn){document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderRidesFiltered(f)}
function openRide(){
 ['rPassenger','rPhone','rPickup','rDestination','rKm','rValue','rNotes'].forEach(id=>$(id).value='');
 $('rDate').value=today();$('rTime').value='';$('rideModal').classList.remove('hidden');
}
function closeRide(){$('rideModal').classList.add('hidden')}
function saveRide(){
 const r={id:Date.now().toString(),passenger:$('rPassenger').value.trim()||'Passageiro',phone:$('rPhone').value.trim(),date:$('rDate').value,time:$('rTime').value,pickup:$('rPickup').value.trim(),destination:$('rDestination').value.trim(),km:Number($('rKm').value)||0,value:Number($('rValue').value)||0,notes:$('rNotes').value.trim(),status:'agendada'};
 if(!r.date||!r.time||!r.pickup||!r.destination)return toast('Preencha data, horário, embarque e destino.');
 rides.push(r);saveRides();closeRide();render();toast('Corrida agendada!');
}
function toggleStatus(id){const r=rides.find(x=>x.id===id);if(r){r.status=r.status==='agendada'?'concluida':'agendada';saveRides();render()}}
function deleteRide(id){if(confirm('Excluir esta corrida?')){rides=rides.filter(r=>r.id!==id);saveRides();render();toast('Corrida excluída.')}}
function saveRides(){localStorage.setItem('cp_rides',JSON.stringify(rides))}
function calculate(){
 const rev=Number($('cRevenue').value)||0,km=Number($('cKm').value)||0,cost=rideCost(km),profit=rev-cost;
 $('calcProfit').textContent=money(profit);$('calcCost').textContent=money(cost);$('calcPerKm').textContent=money(km?cost/km:0);$('calcProfitKm').textContent=money(km?profit/km:0);$('calcMargin').textContent=(rev?(profit/rev*100):0).toFixed(1)+'%';
}
function renderCosts(){
 const vals=[['Combustível',settings.fuel/settings.consumption],['Manutenção',settings.maintenance],['Fixos rateados',(settings.insurance+settings.ipva/12+settings.tires+settings.other)/Math.max(settings.monthlyKm,1)]];
 $('costSummary').innerHTML=vals.map(x=>`<div><span>${x[0]} / km</span><b>${money(x[1])}</b></div>`).join('')+`<div><span>Custo total / km</span><b>${money(costPerKm())}</b></div>`;
}
function loadSettings(){
 $('sConsumption').value=settings.consumption;$('sFuel').value=settings.fuel;$('sMaintenance').value=settings.maintenance;$('sInsurance').value=settings.insurance;$('sIpva').value=settings.ipva;$('sTires').value=settings.tires;$('sOther').value=settings.other;$('sMonthlyKm').value=settings.monthlyKm;
 $('profileText').textContent=`Usuário: ${user.name} · ${user.email}`;
}
function saveSettings(){
 settings={consumption:Number($('sConsumption').value)||1,fuel:Number($('sFuel').value)||0,maintenance:Number($('sMaintenance').value)||0,insurance:Number($('sInsurance').value)||0,ipva:Number($('sIpva').value)||0,tires:Number($('sTires').value)||0,other:Number($('sOther').value)||0,monthlyKm:Number($('sMonthlyKm').value)||1};
 localStorage.setItem('cp_settings',JSON.stringify(settings));renderCosts();calculate();toast('Configurações salvas!');
}
function clearData(){if(confirm('Isso apagará conta, corridas e configurações deste aparelho. Continuar?')){localStorage.clear();location.reload()}}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
if(user)enterApp();
