<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>Painel IPTV PRO MAX</title>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
body { margin:0; font-family:Arial; background:#0f172a; color:white; }

.login { display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; }

input, button {
  padding:10px;
  margin:5px;
  border:none;
  border-radius:5px;
}

button { background:#2563eb; color:white; cursor:pointer; }

header { background:#1e3a8a; padding:20px; text-align:center; }

.container { padding:20px; }

.cards { display:flex; flex-wrap:wrap; gap:10px; }

.box {
  background:#1e293b;
  padding:15px;
  border-radius:10px;
  flex:1;
  text-align:center;
}

.card {
  background:#1e293b;
  padding:15px;
  margin-top:10px;
  border-radius:10px;
}

.ativo { border-left:5px solid green; }
.vencido { border-left:5px solid red; }
.aviso { border-left:5px solid orange; }

.cobrar { background:green; }
.delete { background:red; }

@keyframes piscar {
  0% { background:red; }
  50% { background:darkred; }
  100% { background:red; }
}
</style>
</head>

<body>

<div id="login" class="login">
  <h2>Login</h2>
  <input id="user" placeholder="Usuário">
  <input id="pass" type="password" placeholder="Senha">
  <button onclick="entrar()">Entrar</button>
</div>

<div id="painel" style="display:none">

<header>
Painel IPTV PRO MAX
<button onclick="sair()">Sair</button>
</header>

<div class="container">

<div id="alerta" style="display:none; padding:15px; border-radius:10px; text-align:center; margin-bottom:10px; font-weight:bold; animation: piscar 1s infinite;">
🚨 CLIENTES EM ATRASO!
</div>

<div class="cards">
  <div class="box">Total<br><span id="total">0</span></div>
  <div class="box">Ativos<br><span id="ativos">0</span></div>
  <div class="box">Vencendo<br><span id="aviso">0</span></div>
  <div class="box">Vencidos<br><span id="vencidos">0</span></div>
  <div class="box">💰 Receita<br>R$ <span id="receita">0</span></div>
  <div class="box">📅 A Receber<br>R$ <span id="receber">0</span></div>
  <div class="box">💸 Em atraso<br>R$ <span id="atrasado">0</span></div>
</div>

<canvas id="grafico"></canvas>

<br>

<button onclick="cobrarTodos()">📲 Cobrar Todos</button>
<button onclick="cobrarAtrasados()">💸 Cobrar Atrasados</button>

<br>

<button onclick="filtro='todos'; carregar()">Todos</button>
<button onclick="filtro='ativo'; carregar()">Ativos</button>
<button onclick="filtro='aviso'; carregar()">Vencendo</button>
<button onclick="filtro='vencido'; carregar()">Vencidos</button>

<h3>Cadastro</h3>

<input id="nome" placeholder="Nome">
<input id="whatsapp" placeholder="WhatsApp">
<input id="plano" placeholder="Plano">
<input id="valor" type="number" placeholder="Valor">
<br>
<input type="date" id="inicio">
<input type="date" id="vencimento">

<button onclick="salvar()">Salvar</button>

<div id="lista"></div>

</div>
</div>

<audio id="alertaSom" src="https://www.soundjay.com/buttons/sounds/beep-01a.mp3"></audio>

<script>
const client = supabase.createClient(
  "https://nghgqcgsuyyytrpfvfzh.supabase.co",
  "sb_publishable_fsnaUk2uQmlq0d5r7MwFnA_FoO-wYkf"
);

const USUARIO = "admin";
const SENHA = "1234";

let dadosClientes = [];
let chart;
let filtro = "todos";
let tocou = false;
let editandoId = null;

// LOGIN
function entrar(){
  if(user.value===USUARIO && pass.value===SENHA){
    localStorage.setItem("logado","sim");
    mostrar();
  } else alert("Login inválido");
}

function sair(){
  localStorage.removeItem("logado");
  location.reload();
}

function mostrar(){
  login.style.display="none";
  painel.style.display="block";
  carregar();
}

if(localStorage.getItem("logado")==="sim") mostrar();

// STATUS
function statusCalc(v){
  let hoje=new Date();
  let d=new Date(v);
  let diff=Math.ceil((d-hoje)/(1000*60*60*24));

  if(diff<0) return "vencido";
  if(diff<=2) return "aviso";
  return "ativo";
}

// CARREGAR
async function carregar(){
  const { data } = await client.from("Painel ftv").select("*");
  dadosClientes=data;

  data.sort((a,b)=> new Date(a.vencimento)-new Date(b.vencimento));

  let t=0,a=0,v=0,av=0,r=0,rec=0,atr=0;
  let planos={};
  let html="";

  data.forEach(c=>{
    let status=statusCalc(c.vencimento);

    if(filtro!=="todos" && status!==filtro) return;

    t++;
    if(status==="ativo") a++;
    if(status==="vencido") v++;
    if(status==="aviso") av++;

    r+=Number(c.valor||0);
    if(status!=="vencido") rec+=Number(c.valor||0);
    if(status==="vencido") atr+=Number(c.valor||0);

    planos[c.plano]=(planos[c.plano]||0)+1;

    html+=`
    <div class="card ${status}">
      <b>${c.nome}</b>
      <p>${c.plano} - R$ ${c.valor}</p>
      <p>Início: ${c.data_de_inicio || '-'}</p>
      <p>Vence: ${c.vencimento}</p>

      <button onclick="editar(${c.id})">✏️ Editar</button>
      <button onclick="pago(${c.id})">✅ Pago</button>
      <button class="delete" onclick="del(${c.id})">Excluir</button>
      <button class="cobrar" onclick="cobrar('${c.whatsapp}','${c.nome}','${c.vencimento}')">Cobrar</button>
    </div>`;
  });

  total.innerText=t;
  ativos.innerText=a;
  vencidos.innerText=v;
  aviso.innerText=av;
  receita.innerText=r.toFixed(2);
  receber.innerText=rec.toFixed(2);
  atrasado.innerText=atr.toFixed(2);

  lista.innerHTML=html;

  // ALERTA + SOM
  if(atr>0){
    alerta.style.display="block";

    if(!tocou){
      alertaSom.play().catch(()=>{});
      tocou=true;
    }
  } else {
    alerta.style.display="none";
    tocou=false;
  }

  // GRAFICO
  if(chart) chart.destroy();

  chart=new Chart(document.getElementById("grafico"),{
    type:"bar",
    data:{
      labels:Object.keys(planos),
      datasets:[{
        data:Object.values(planos),
        backgroundColor:["#22c55e","#3b82f6","#f59e0b","#ef4444","#a855f7"]
      }]
    }
  });
}

// SALVAR / EDITAR
async function salvar(){

  if(editandoId){
    await client.from("Painel ftv")
    .update({
      nome:nome.value,
      whatsapp:whatsapp.value,
      plano:plano.value,
      valor:parseFloat(valor.value)||0,
      data_de_inicio:inicio.value,
      vencimento:vencimento.value
    })
    .eq("id", editandoId);

    editandoId=null;

  } else {
    await client.from("Painel ftv").insert([{
      id: Date.now(),
      nome:nome.value,
      whatsapp:whatsapp.value,
      plano:plano.value,
      valor:parseFloat(valor.value)||0,
      data_de_inicio:inicio.value,
      vencimento:vencimento.value
    }]);
  }

  limpar();
  carregar();
}

// EDITAR
function editar(id){
  let c = dadosClientes.find(x=>x.id==id);

  nome.value=c.nome;
  whatsapp.value=c.whatsapp;
  plano.value=c.plano;
  valor.value=c.valor;
  inicio.value=c.data_de_inicio;
  vencimento.value=c.vencimento;

  editandoId=id;
}

// PAGO (RENOVA +30 DIAS)
async function pago(id){
  let c = dadosClientes.find(x=>x.id==id);

  let novaData = new Date(c.vencimento);
  novaData.setDate(novaData.getDate()+30);

  let formatada = novaData.toISOString().split("T")[0];

  await client.from("Painel ftv")
  .update({ vencimento: formatada })
  .eq("id", id);

  carregar();
}

// COBRANÇA
function cobrar(whatsapp,nome,vencimento){
  let hoje=new Date();
  let v=new Date(vencimento);
  let diff=Math.ceil((v-hoje)/(1000*60*60*24));

  let msg="";
  if(diff<0) msg=`🚨 ${nome}, seu plano venceu (${vencimento}).`;
  else if(diff===0) msg=`⚠️ ${nome}, vence hoje!`;
  else if(diff<=2) msg=`🔔 ${nome}, está para vencer.`;
  else msg=`🙂 ${nome}, lembrete.`;

  let num=whatsapp.replace(/\D/g,'');
  window.open(`https://wa.me/55${num}?text=${encodeURIComponent(msg)}`);
}

// COBRAR TODOS
function cobrarTodos(){
  let i=0;
  function enviar(){
    if(i>=dadosClientes.length) return;
    let c=dadosClientes[i];
    cobrar(c.whatsapp,c.nome,c.vencimento);
    i++;
    setTimeout(enviar,1500);
  }
  enviar();
}

// COBRAR ATRASADOS
function cobrarAtrasados(){
  let lista = dadosClientes.filter(c=>statusCalc(c.vencimento)==="vencido");
  let i=0;

  function enviar(){
    if(i>=lista.length) return;
    let c=lista[i];
    cobrar(c.whatsapp,c.nome,c.vencimento);
    i++;
    setTimeout(enviar,1500);
  }
  enviar();
}

// EXCLUIR
async function del(id){
  await client.from("Painel ftv").delete().eq("id",id);
  carregar();
}

// LIMPAR
function limpar(){
  nome.value="";
  whatsapp.value="";
  plano.value="";
  valor.value="";
  inicio.value="";
  vencimento.value="";
}
</script>

</body>
</html>
