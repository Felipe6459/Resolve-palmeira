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

@keyframes piscar {
  0% { background:#ef4444; }
  50% { background:#7f1d1d; }
  100% { background:#ef4444; }
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

<div id="alerta" style="display:none; padding:15px; border-radius:10px; text-align:center; margin-bottom:10px; font-weight:bold; animation: piscar 1s infinite;">
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

const USUARIO="admin";
const SENHA="1234";

let dadosClientes=[];
let editandoId=null;
let chart;
let tocou=false;

let modoGrafico="clientes";
let intervaloGrafico;

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

// RESTO DO CÓDIGO (igual ao seu original)
</script>

</body>
</html>
