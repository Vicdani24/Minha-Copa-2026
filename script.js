let selecoesRequestId = 0;
let CACHE_TABELA = {};
let CACHE_JOGOS = {};

const selecoesCopa = [
  // HOSTS
  "United States", "Canada", "Mexico",

  // CONMEBOL
  "Argentina", "Brazil", "Uruguay", "Colombia", "Ecuador", "Paraguay",

  // UEFA
  "France", "Spain", "Germany", "England", "Portugal", "Netherlands",
  "Belgium", "Croatia", "Switzerland", "Scotland",
  "Austria", "Turkey", "Czechia",

  // CONCACAF
  "Costa Rica", "Panama", "Haiti", "Curacao",

  // AFC
  "Japan", "South Korea", "Iran", "Australia", "Saudi Arabia", "Qatar",
  "Uzbekistan", "Jordan",

  // CAF
  "Morocco", "Senegal", "Nigeria", "Egypt", "Algeria",
  "South Africa", "Tunisia", "Ghana",

  // OFC
  "New Zealand"
];

function abrirInicio(){

document.getElementById("conteudo").innerHTML = `
<div class="card intro">
  <h2>👋 Bem-vindo ao simulador da Copa!</h2>

<p style="font-size:20px; font-family:Rubik Bubbles;">
Aqui você pode acompanhar grupos, jogos, classificações e ver como seria sua Copa do Mundo de forma simulada ⚽🔥
</p>

<p style="font-size:20px; font-family:Rubik Bubbles;">
Escolha um menu acima pra começar:
    ver os grupos, conferir os jogos ou acompanhar quem está se classificando 🏆
</p>

<p style="font-size:20px; font-family:Rubik Bubbles;">
Tudo é atualizado automaticamente conforme os resultados vão acontecendo.
    Se prepara… a disputa vai ser pesada! 😄
</p>
</div>

`;

}

/* =========================
   GRUPOS (TABELA)
========================= */

async function abrirGrupos() {

  try {

    const res = await fetch("dados/grupos.json");
    const gruposOriginais = await res.json();

    // garante que a classificação existe
    const tabela = gerarTabelaClassificacao();

    let html = "";

    for (const grupo in gruposOriginais) {

      html += `
        <div class="card">
          <h2>🏆 Grupo ${grupo}</h2>

          <table class="tabela-grupo">
            <tr>
              <th>Seleção</th>
              <th>P</th>
              <th>J</th>
              <th>V</th>
              <th>E</th>
              <th>D</th>
              <th>GP</th>
              <th>GC</th>
            </tr>
      `;

      const times = tabela[grupo];

      if (times) {
        Object.entries(times).forEach(([nome, t]) => {

          html += `
            <tr>
              <td>${nome}</td>
              <td>${t.pontos}</td>
              <td>${t.jogos}</td>
              <td>${t.vitorias}</td>
              <td>${t.empates}</td>
              <td>${t.derrotas}</td>
              <td>${t.golsPro}</td>
              <td>${t.golsContra}</td>
            </tr>
          `;

        });
      }

      html += `
          </table>
        </div>
      `;
    }

    document.getElementById("conteudo").innerHTML = html;

  } catch (erro) {
    console.log(erro);

    document.getElementById("conteudo").innerHTML = `
      <div class="card">
        <h2>Erro ao carregar grupos</h2>
        <p>${erro}</p>
      </div>
    `;
  }
}

/* =========================
   JOGOS (INPUT DE RESULTADO)
========================= */

async function abrirJogos(){

const resposta = await fetch("dados/jogos.json");
const jogos = await resposta.json();

// 🔥 carrega do localStorage se existir
const salvo = localStorage.getItem("copa2026_jogos");

CACHE_JOGOS = salvo ? JSON.parse(salvo) : jogos;

let html = "";

html += `
<div class="card">
<center>  <button onclick="limparTodosJogos()" 
  style="padding:10px 15px;font-size:14px;">
  <center>🧹 Limpar todos</center>
  </button></center>
</div>
`;

Object.keys(CACHE_JOGOS).forEach(id => {

const jogo = CACHE_JOGOS[id];

html += `
<div class="card">

<h3>🏆 Grupo ${jogo.grupo}</h3>

<div style="display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:nowrap;margin-top:10px;">

<span>${jogo.timeA}</span>

<input type="number"
id="a_${id}"
value="${jogo.golsA ?? ""}"
style="width:40px;text-align:center;font-size:14px;"
oninput="autoSalvar('${id}')">

<strong>X</strong>

<input type="number"
id="b_${id}"
value="${jogo.golsB ?? ""}"
style="width:40px;text-align:center;font-size:14px;"
oninput="autoSalvar('${id}')">

<span>${jogo.timeB}</span>

</div>

<p>📅 ${jogo.data}</p>

<button onclick="limparJogo('${id}')" 
style="margin-top:8px;padding:5px 10px;">
🗑️ 
</button>

</div>
`;
});

document.getElementById("conteudo").innerHTML = html;
}

/* =========================
   SALVAR JOGO (LOCAL)
========================= */

function salvarJogo(id){

fetch("dados/jogos.json")
.then(res => res.json())
.then(jogos => {

jogos[id].golsA = parseInt(document.getElementById("a_"+id).value || 0);
jogos[id].golsB = parseInt(document.getElementById("b_"+id).value || 0);

alert("Resultado salvo (local)");

console.log(jogos[id]);

});

}

/* =========================
   SELEÇÕES
========================= */

function abrirSelecoes() {

  document.getElementById("conteudo").innerHTML = `
    <div class="card">
      <h2>⚽ Seleções da Copa</h2>
      <div id="selecoes">Carregando...</div>
    </div>
  `;

  // IMPORTANTE: espera o DOM existir
  setTimeout(() => {
    carregarSelecoes();
  }, 50);
}

function carregarSelecoes() {

  const container = document.getElementById("selecoes");

  if (!container) return;

  container.innerHTML = "";

  // 🔥 controla versão da requisição
  const requestId = ++selecoesRequestId;

  selecoesCopa.forEach(nome => {

    fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${nome}`)
      .then(res => res.json())
      .then(data => {

        // ⚠️ IGNORA RESPOSTA ANTIGA
        if (requestId !== selecoesRequestId) return;

        if (!container) return;

        if (data && data.teams && data.teams.length > 0) {

          const time = data.teams[0];

          const div = document.createElement("div");
          div.classList.add("linha-time");

          let linkEscalacao = "";

          if (nome === "Brazil") {
            linkEscalacao = "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/teams/brazil";
          }

          div.innerHTML = `
            <a href="${linkEscalacao}" target="_blank">
              <img class="escudo" src="${time.strBadge}">
            </a>
            <span>${time.strTeam}</span>
          `;

          container.appendChild(div);
        }

      })
      .catch(err => {
        console.log("Erro:", nome, err);
      });

  });

}

function abrirEscalacao(nomeTime) {

  document.getElementById("conteudo").innerHTML = `
    <div class="card">
      <h2>⚽ Elenco: ${nomeTime}</h2>
      <div id="elenco">Carregando jogadores...</div>
    </div>
  `;

  fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?t=${nomeTime}`)
    .then(res => res.json())
    .then(data => {

      const container = document.getElementById("elenco");
      container.innerHTML = "";

      if (!data.player) {
        container.innerHTML = "Nenhum jogador encontrado";
        return;
      }

      data.player.forEach(jogador => {

        const div = document.createElement("div");
        div.classList.add("linha-time");

        div.innerHTML = `
          <img class="escudo" src="${jogador.strCutout || jogador.strThumb}">
          <span>${jogador.strPlayer}</span>
        `;

        container.appendChild(div);
      });

    })
    .catch(err => {
      console.log("Erro API:", err);
    });

}


function autoSalvar(id){

const jogo = CACHE_JOGOS[id];

const golsA = document.getElementById("a_"+id).value;
const golsB = document.getElementById("b_"+id).value;

jogo.golsA = golsA === "" ? null : Number(golsA);
jogo.golsB = golsB === "" ? null : Number(golsB);

localStorage.setItem("copa2026_jogos", JSON.stringify(CACHE_JOGOS));

// 🔥 AQUI A MÁGICA
atualizarClassificacao();
}

function limparJogo(id){

const jogo = CACHE_JOGOS[id];

// limpa os dados
jogo.golsA = null;
jogo.golsB = null;

// limpa inputs da tela
document.getElementById("a_"+id).value = "";
document.getElementById("b_"+id).value = "";

// salva no localStorage
localStorage.setItem("copa2026_jogos", JSON.stringify(CACHE_JOGOS));

console.log("Jogo limpo:", id);
}

function limparTodosJogos(){

Object.keys(CACHE_JOGOS).forEach(id => {

CACHE_JOGOS[id].golsA = null;
CACHE_JOGOS[id].golsB = null;

});

// salva no localStorage
localStorage.setItem("copa2026_jogos", JSON.stringify(CACHE_JOGOS));

// recarrega a tela de jogos
abrirJogos();

console.log("Todos os jogos foram limpos");
}

function atualizarClassificacao() {
  const tabela = {};

  Object.values(CACHE_JOGOS).forEach(jogo => {

    if (!tabela[jogo.grupo]) tabela[jogo.grupo] = {};

    const A = jogo.timeA;
    const B = jogo.timeB;

    if (!tabela[jogo.grupo][A]) tabela[jogo.grupo][A] = criarTime();
    if (!tabela[jogo.grupo][B]) tabela[jogo.grupo][B] = criarTime();

    if (jogo.golsA == null || jogo.golsB == null) return;

    tabela[jogo.grupo][A].jogos++;
    tabela[jogo.grupo][B].jogos++;

    tabela[jogo.grupo][A].golsPro += jogo.golsA;
    tabela[jogo.grupo][A].golsContra += jogo.golsB;

    tabela[jogo.grupo][B].golsPro += jogo.golsB;
    tabela[jogo.grupo][B].golsContra += jogo.golsA;

    if (jogo.golsA > jogo.golsB) {
      tabela[jogo.grupo][A].pontos += 3;
      tabela[jogo.grupo][A].vitorias++;
      tabela[jogo.grupo][B].derrotas++;
    } 
    else if (jogo.golsB > jogo.golsA) {
      tabela[jogo.grupo][B].pontos += 3;
      tabela[jogo.grupo][B].vitorias++;
      tabela[jogo.grupo][A].derrotas++;
    } 
    else {
      tabela[jogo.grupo][A].pontos += 1;
      tabela[jogo.grupo][B].pontos += 1;
      tabela[jogo.grupo][A].empates++;
      tabela[jogo.grupo][B].empates++;
    }
  });

  CACHE_TABELA = tabela || {};
}

function criarTime() {
  return {
    pontos: 0,
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    golsPro: 0,
    golsContra: 0
  };
}

function gerarTabelaClassificacao() {

  const tabela = {};

  Object.values(CACHE_JOGOS).forEach(jogo => {

    if (!tabela[jogo.grupo]) tabela[jogo.grupo] = {};

    const A = jogo.timeA;
    const B = jogo.timeB;

    if (!tabela[jogo.grupo][A]) tabela[jogo.grupo][A] = criarTime();
    if (!tabela[jogo.grupo][B]) tabela[jogo.grupo][B] = criarTime();

    if (jogo.golsA == null || jogo.golsB == null) return;

    tabela[jogo.grupo][A].jogos++;
    tabela[jogo.grupo][B].jogos++;

    tabela[jogo.grupo][A].golsPro += jogo.golsA;
    tabela[jogo.grupo][A].golsContra += jogo.golsB;

    tabela[jogo.grupo][B].golsPro += jogo.golsB;
    tabela[jogo.grupo][B].golsContra += jogo.golsA;

    if (jogo.golsA > jogo.golsB) {
      tabela[jogo.grupo][A].pontos += 3;
      tabela[jogo.grupo][A].vitorias++;
      tabela[jogo.grupo][B].derrotas++;
    } else if (jogo.golsB > jogo.golsA) {
      tabela[jogo.grupo][B].pontos += 3;
      tabela[jogo.grupo][B].vitorias++;
      tabela[jogo.grupo][A].derrotas++;
    } else {
      tabela[jogo.grupo][A].pontos += 1;
      tabela[jogo.grupo][B].pontos += 1;
      tabela[jogo.grupo][A].empates++;
      tabela[jogo.grupo][B].empates++;
    }

  });

  return tabela;
}

/* =========================
   INICIAL
========================= */

abrirInicio();
