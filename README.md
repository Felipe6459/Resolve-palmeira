<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>Painel IPTV PRO MAX</title>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
body {
  margin:0;
  font-family:'Segoe UI', Arial;
  background:#0f172a;
  color:white;
}

.login {
  display:flex;
  justify-content:center;
  align-items:center;
  height:100vh;
  flex-direction:column;
}

input, button {
  padding:12px;
  margin:6px;
  border:none;
  border-radius:8px;
}

button {
  background:#3b82f6;
  color:white;
  cursor:pointer;
}

header {
  background:linear-gradient(90deg,#1e3a8a,#2563eb);
  padding:20px;
  text-align:center;
  font-weight:bold;
}

.container { padding:20px; }

.cards {
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(120px,1fr));
  gap:10px;
}

.box {
  background:#1e293b;
  padding:15px;
  border-radius:12px;
  text-align:center;
}

.card {
  background:#1e293b;
  padding:15px;
  margin-top:10px;
  border-radius:12px;
}

.ativo { border-left:5px solid #22c55e; }
.vencido { border-left:5px solid #ef4444; }
.aviso { border-left:5px solid #f59e0b; }

canvas {
  background:#1e293b;
  border-radius:15px;
  padding:15px;
  margin:20px auto;
  display:block;
  max-width:350px;
  max-height:350px;
}

.delete { background:#ef4444; }
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

<div id="alerta" style="display:none; padding:15px; border-radius:10px; text-align:center; margin-bottom:10px; font-weight:bold;">
🚨 EXISTEM CLIENTES VENCIDOS!
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

<!-- BOTÃO NOVO -->
<button onclick="cobrarVencidos()" style="background:#ef4444;">
💰 Cobrar todos vencidos
</button>

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

<script>
const client = supabase.createClient(
  "https://nghgqcgsuyyytrpfvfzh.supabase.co",
  "sb_publishable_fsnaUk2uQmlq0d5r7MwFnA_FoO-wYkf"
);

const USUARIO="admin";
const SENHA="1234";

let dadosClientes=[];
let editandoId=null;
let chart;

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
  dadosClientes = data || [];

  let t=0,a=0,v=0,av=0,r=0,rec=0,atr=0;
  let planosClientes={};
  let html="";

  dadosClientes.forEach(c=>{
    let status=statusCalc(c.vencimento);

    t++;
    if(status==="ativo") a++;
    if(status==="vencido") v++;
    if(status==="aviso") av++;

    r+=Number(c.valor||0);
    if(status!=="vencido") rec+=Number(c.valor||0);
    if(status==="vencido") atr+=Number(c.valor||0);

    planosClientes[c.plano]=(planosClientes[c.plano]||0)+1;

    html+=`
    <div class="card ${status}">
      <b>${c.nome}</b>
      <p>${c.plano} - R$ ${c.valor}</p>
      <p>Vence: ${c.vencimento}</p>

      <button onclick="editar(${c.id})">✏️</button>
      <button onclick="pago(${c.id})">✅</button>
      <button onclick="whats(${c.id})">📲</button>
      <button class="delete" onclick="del(${c.id})">🗑️</button>
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

  atualizarGrafico(planosClientes);
}

// GRAFICO
function atualizarGrafico(planosClientes){
  let labels=Object.keys(planosClientes);
  let dados=Object.values(planosClientes);

  if(chart) chart.destroy();

  chart=new Chart(document.getElementById("grafico"),{
    type:"doughnut",
    data:{
      labels:labels,
      datasets:[{
        data:dados,
        backgroundColor:[
          "#3b82f6","#22c55e","#f59e0b","#ef4444","#a855f7","#06b6d4"
        ]
      }]
    }
  });
}

// WHATS INDIVIDUAL INTELIGENTE
function whats(id){
  let c = dadosClientes.find(x => Number(x.id) === Number(id));
  if(!c) return;

  let numero = c.whatsapp.replace(/\D/g, "");
  let status = statusCalc(c.vencimento);

  let msg = "";

  if(status === "ativo"){
    msg = `Olá ${c.nome}, tudo certo?\nSeu plano está ativo até ${c.vencimento}.`;
  }

  if(status === "aviso"){
    msg = `Olá ${c.nome}, seu plano vence em breve (${c.vencimento}).`;
  }

  if(status === "vencido"){
    msg = `Olá ${c.nome}, seu plano está vencido desde ${c.vencimento}.`;
  }

  let link = `https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`;
  window.open(link, "_blank");
}

// COBRAR TODOS
function cobrarVencidos(){
  let vencidos = dadosClientes.filter(c => statusCalc(c.vencimento) === "vencido");

  if(vencidos.length === 0){
    alert("Nenhum cliente vencido");
    return;
  }

  vencidos.forEach((c, i) => {
    let numero = c.whatsapp.replace(/\D/g, "");
    let msg = `Olá ${c.nome}, seu plano está vencido.\nRegularize para continuar usando.`;

    let link = `https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`;

    setTimeout(() => window.open(link, "_blank"), i * 800);
  });
}

// SALVAR
async function salvar(){
  if(editandoId!==null){
    await client.from("Painel ftv").update({
      nome:nome.value,
      whatsapp:whatsapp.value,
      plano:plano.value,
      valor:parseFloat(valor.value)||0,
      data_de_inicio:inicio.value,
      vencimento:vencimento.value
    }).eq("id",editandoId);

    editandoId=null;
  } else {
    await client.from("Painel ftv").insert([{
      id:Date.now(),
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
  let c=dadosClientes.find(x=>Number(x.id)===Number(id));
  if(!c) return;

  nome.value=c.nome||"";
  whatsapp.value=c.whatsapp||"";
  plano.value=c.plano||"";
  valor.value=c.valor||"";
  inicio.value=c.data_de_inicio||"";
  vencimento.value=c.vencimento||"";

  editandoId=id;
  window.scrollTo({top:0,behavior:"smooth"});
}

// PAGO
async function pago(id){
  let c=dadosClientes.find(x=>Number(x.id)===Number(id));
  if(!c) return;

  let nova=new Date(c.vencimento);
  nova.setDate(nova.getDate()+30);

  let formatada=nova.toISOString().split("T")[0];

  await client.from("Painel ftv").update({vencimento:formatada}).eq("id",id);

  carregar();
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
