# Resolve-palmeira
Site para encontrar profissionais
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Resolve Palmeira</title>

<style>
body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #f5f5f5;
}

header {
    background: #0a58ca;
    color: white;
    padding: 15px;
    text-align: center;
    font-size: 22px;
    font-weight: bold;
}

.container {
    padding: 15px;
}

.card {
    background: white;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nome {
    font-size: 18px;
    font-weight: bold;
}

.servico {
    color: gray;
    margin-bottom: 10px;
}

.botao {
    display: inline-block;
    padding: 10px 15px;
    background: #25D366;
    color: white;
    border-radius: 8px;
    text-decoration: none;
}

.topo {
    text-align: center;
    margin-bottom: 20px;
}

.topo h2 {
    margin: 0;
}

.categoria {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    margin-bottom: 15px;
}

.cat {
    background: #0a58ca;
    color: white;
    padding: 8px 12px;
    border-radius: 20px;
    white-space: nowrap;
}
</style>

</head>

<body>

<header>Resolve Palmeira</header>

<div class="container">

<div class="topo">
<h2>Encontre profissionais em Palmeira dos Índios</h2>
</div>

<div class="categoria">
<div class="cat">Eletricista</div>
<div class="cat">Encanador</div>
<div class="cat">Pedreiro</div>
<div class="cat">Pintor</div>
</div>

<div class="card">
<div class="nome">João Silva</div>
<div class="servico">Eletricista ⭐⭐⭐⭐☆</div>
<a class="botao" href="https://wa.me/5582999999999">Chamar no WhatsApp</a>
</div>

<div class="card">
<div class="nome">Carlos Souza</div>
<div class="servico">Pedreiro ⭐⭐⭐⭐⭐</div>
<a class="botao" href="https://wa.me/5582998888888">Chamar no WhatsApp</a>
</div>

</div>

</body>
</html>
