<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cineplay TV</title>

<style>
*{margin:0;padding:0;box-sizing:border-box;max-width:100%}
html,body{overflow-x:hidden;font-family:Arial;background:#0b0b0b;color:#fff;text-align:center}

.header{background:#7b2cff;padding:12px;font-weight:bold}

.banner{
background:url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1200&auto=format&fit=crop') center/cover no-repeat;
padding:70px 20px;
}

.overlay{background:rgba(0,0,0,0.7);padding:30px;border-radius:10px}

.container{padding:20px}

.btn{
display:block;margin:12px auto;padding:15px;background:#ff2d2d;color:#fff;
text-decoration:none;border-radius:12px;width:90%;max-width:320px;
font-weight:bold;animation:pulsar 1.2s infinite;
}

.card{background:#1a1a1a;margin:15px auto;padding:20px;border-radius:15px;max-width:350px}

.highlight{border:2px solid #7b2cff}

.price{font-size:22px;color:#7b2cff;margin:10px 0}

.review{
background:#111;padding:15px;margin:10px auto;border-radius:10px;
max-width:320px;display:flex;align-items:center;gap:10px
}

.review img{width:40px;height:40px;border-radius:50%}

.footer{margin-top:30px;padding:20px;font-size:14px;color:#aaa}

.popup{
position:fixed;bottom:10px;left:10px;background:#111;padding:10px 15px;
border-radius:10px;font-size:13px;display:none
}

.whatsapp-float{
position:fixed;bottom:20px;right:20px;
}

.instagram-float{
position:fixed;bottom:90px;right:20px;
}

@keyframes pulsar{
0%{transform:scale(1)}
50%{transform:scale(1.08)}
100%{transform:scale(1)}
}
</style>
</head>

<body>

<div class="header">
🔥 OFERTA TERMINA EM <span id="timer"></span>
<p style="color:red;">⚠️ Restam poucas vagas hoje</p>
</div>

<div class="banner">
<div class="overlay">

<h1>🎬 Cineplay TV</h1>

<!-- VIDEO -->
<div style="margin-top:20px;">
<iframe width="100%" height="220"
src="https://www.youtube.com/embed/K3QLrvM39fw"
frameborder="0" allowfullscreen style="border-radius:10px;">
</iframe>
</div>

<h2 style="color:#ff4444;">
🔥 Cancele Netflix e pague mais barato
</h2>

<p>
🎬 +100 MIL conteúdos<br>
📺 Canais ao vivo<br>
⚡ Sem travar
</p>

<a class="btn" onclick="abrirCaptura()">
🎁 LIBERAR TESTE GRÁTIS
</a>

<p style="color:#00ff88;">
🚀 Acesso liberado em poucos minutos<br>
👥 <span id="online">12</span> pessoas vendo agora
</p>

<p style="color:#ff4444;font-weight:bold;">
⚠️ Restam apenas <span id="vagas">7</span> vagas hoje
</p>

</div>
</div>

<div class="container">

<h2>📺 Compatibilidade</h2>
<a class="btn" href="compatibilidade.html">
VER SUA TV
</a>

<h2>⭐ Avaliações</h2>

<div class="review">
<img src="https://randomuser.me/api/portraits/men/32.jpg">
<p>Top demais</p>
</div>

<div class="review">
<img src="https://randomuser.me/api/portraits/women/45.jpg">
<p>Melhor que Netflix</p>
</div>

<h2>💰 Planos</h2>

<div class="card">
<h3>1 Tela</h3>
<div class="price">R$ 24,90</div>
</div>

<div class="card highlight">
<h3>2 Telas</h3>
<div class="price">R$ 34,90</div>
</div>

<h2>❓ Dúvidas</h2>

<div class="card">
<p><b>Vai travar?</b></p>
<p>Não!</p>
</div>

<div class="card">
<p><b>Funciona na TV?</b></p>
<p>Sim, todas!</p>
</div>

<h2>🔥 Ative agora</h2>

<a class="btn" href="https://wa.me/5582996062108">
🚀 ATIVAR AGORA
</a>

</div>

<div class="footer">© Cineplay TV</div>

<!-- WHATSAPP -->
<a class="whatsapp-float" href="https://wa.me/5582996062108">
<img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="50">
</a>

<!-- INSTAGRAM -->
<a class="instagram-float" href="https://www.instagram.com/cineplayofc64" target="_blank">
<img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" width="50">
</a>

<!-- POPUP CAPTURA -->
<div id="captura" style="display:none;position:fixed;top:50%;left:50%;
transform:translate(-50%,-50%);background:#111;padding:20px;border-radius:15px;z-index:9999;">

<h3>🎁 Libere seu teste</h3>

<input type="text" id="numero" placeholder="Seu WhatsApp">

<br><br>

<button onclick="enviarWhats()">ATIVAR</button>

<br><br>

<button onclick="fecharCaptura()">Fechar</button>

</div>

<script>

function abrirCaptura(){
document.getElementById("captura").style.display = "block";
}

function fecharCaptura(){
document.getElementById("captura").style.display = "none";
}

function enviarWhats(){
let numero = document.getElementById("numero").value;
window.location.href = "https://wa.me/5582996062108?text=Quero teste - " + numero;
}

// TIMER
let time=600;
setInterval(()=>{
let m=Math.floor(time/60);
let s=time%60;
document.getElementById('timer').innerHTML=m+":"+(s<10?'0':'')+s;
time--;
if(time<0) time=600;
},1000);

// ONLINE
setInterval(()=>{
document.getElementById("online").innerHTML = Math.floor(Math.random()*10)+10;
},3000);

// VAGAS
let vagas=7;
setInterval(()=>{
if(vagas>3){
vagas--;
document.getElementById("vagas").innerHTML=vagas;
}
},8000);

</script>

</body>
</html>
