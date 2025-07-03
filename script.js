/* ========= Dados ========= */
const Q = [
  { country: "Alemanha", answer: "Axis" },
  { country: "Japão", answer: "Axis" },
  { country: "Itália", answer: "Axis" },
  { country: "Estados Unidos", answer: "Allies" },
  { country: "Reino Unido", answer: "Allies" },
  { country: "União Soviética", answer: "Allies" },
  { country: "França", answer: "Allies" },
  { country: "Canadá", answer: "Allies" },
  { country: "China (Republicana)", answer: "Allies" },
  { country: "Hungria", answer: "Axis" },
  { country: "Romênia", answer: "Axis" },
  { country: "Finlândia", answer: "Axis" }
];

/* ========= Estado ========= */
const gridEl = document.getElementById("grid");
const questionDialog = document.getElementById("questionDialog");
const questionText = document.getElementById("questionText");
const questionForm = document.getElementById("questionForm");
const gameOverDialog = document.getElementById("gameOverDialog");
const gameOverMsg = document.getElementById("gameOverMsg");
const restartBtn = document.getElementById("restartBtn");

let gridData, currentTile, teams = [];

/* ========= Equipes ========= */
const teamsDiv = document.getElementById("teams");
const addTeamBtn = document.getElementById("addTeamBtn");

function addTeam(name = "") {
  const wrapper = document.createElement("div");
  wrapper.className = "team";

  const input = document.createElement("input");
  input.placeholder = "Nome do grupo";
  input.value = name;

  const score = document.createElement("span");
  score.className = "score";
  score.textContent = 0;

  wrapper.append(input, score);
  teamsDiv.append(wrapper);
  teams.push({ input, scoreEl: score, points: 0 });
}

addTeamBtn.addEventListener("click", () => addTeam());

/* ========= Grade ========= */
function makeGrid() {
  gridEl.innerHTML = "";
  gridData = [];

  // 8x8 = 64 células | 12 bombas
  const total = 64, bombs = 12;
  const bombIndexes = new Set();
  while (bombIndexes.size < bombs) bombIndexes.add(Math.floor(Math.random() * total));

  for (let i = 0; i < total; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.index = i;
    gridEl.append(tile);

    gridData[i] = {
      bomb: bombIndexes.has(i),
      revealed: false
    };
  }
}

function handleTileClick(e) {
  const tile = e.target;
  if (!tile.classList.contains("tile") || tile.classList.contains("revealed")) return;

  currentTile = tile;
  const { bomb } = gridData[tile.dataset.index];

  if (bomb) {
    revealBomb(tile);
    endGame(false);
  } else {
    askQuestion(tile);
  }
}

/* ========= Perguntas ========= */
function askQuestion(tile) {
  // Sorteia pergunta ainda não usada
  const remaining = Q.filter(q => !q.used);
  const q = remaining[Math.floor(Math.random() * remaining.length)];
  q.used = true;

  questionText.textContent = `${q.country} fazia parte dos Aliados ou do Eixo?`;
  questionDialog.showModal();

  questionForm.onsubmit = ev => {
    ev.preventDefault();
    const guess = ev.submitter.value;
    questionDialog.close();

    if (guess === q.answer) {
      revealSafe(tile, q.answer);
      checkWinCondition();
    } else {
      revealBomb(tile);
      endGame(false);
    }
  };
}

function revealSafe(tile, alliance) {
  tile.classList.add("revealed", "safe");
  tile.textContent = alliance === "Allies" ? "✓" : "";
  updateTeamScore(1);
}

function revealBomb(tile) {
  tile.classList.add("revealed", "bomb");
  tile.textContent = "💥";
}

function updateTeamScore(pts) {
  // Primeiro time é o atual (professor pode clicar na ordem dos grupos)
  if (teams.length === 0) return;
  const team = teams[0];
  team.points += pts;
  team.scoreEl.textContent = team.points;
  // Move time para o fim da fila (próximo grupo joga)
  teams.push(teams.shift());
}

/* ========= Fim de jogo ========= */
function checkWinCondition() {
  const remainingSafe = gridData.filter((d, i) => !d.bomb && !gridEl.children[i].classList.contains("revealed")).length;
  if (remainingSafe === 0) endGame(true);
}

function endGame(victory) {
  gameOverMsg.textContent = victory ? "Parabéns! Todas as casas seguras foram reveladas!" :
                                      "Ops! Explodiu uma mina histórica.";
  gameOverDialog.showModal();
}

/* ========= Reinício ========= */
restartBtn.addEventListener("click", () => {
  gameOverDialog.close();
  Q.forEach(q => delete q.used);
  makeGrid();
});

/* ========= Init ========= */
window.addEventListener("DOMContentLoaded", () => {
  addTeam("Grupo 1");
  makeGrid();
  gridEl.addEventListener("click", handleTileClick);
});
