var rows = 6;
var cols = 5;
var solution;
var startTime;
var timer;
var maxTimer;
var car = 3;
var nbRotations = 0;
const STATE_TITRE = 1;
const STATE_CHRONO = 2;
const STATE_JEU = 3;
const STATE_FINI = 4;
const gameData = {};
gameData.state = STATE_TITRE;
var resultat = {};

// Directions pour construire le chemin
const directions = [
  { dx: 0, dy: -1, name: "top" },
  { dx: 1, dy: 0, name: "right" },
  { dx: 0, dy: 1, name: "bottom" },
  { dx: -1, dy: 0, name: "left" },
];

// RNG basique pour seed
function createRNG(seed) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return function () {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

// Retourne type+rotation pour un tableau de connexions (2 directions max)
function getTileTypeFromConnections(conns) {
  if (conns.length !== 2) return { type: "empty", rot: 0 };

  const sorted = conns.slice().sort();
  const key = sorted.join("-");

  const map = {
    "bottom-top": { type: "straight", rot: 0 },
    "left-right": { type: "straight", rot: 90 },
    "right-top": { type: "curve", rot: 0 },
    "bottom-right": { type: "curve", rot: 90 },
    "bottom-left": { type: "curve", rot: 180 },
    "left-top": { type: "curve", rot: 270 }
  };

  return map[key] || { type: "empty", rot: 0 };
}

// Classe Tile : pour SVG et stockage
class Tile {
  constructor(x, y, type, rot) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.rot = rot; // en degrés : 0, 90, 180, 270
  }

  symbol() {
    if (this.type === "straight") {
      return `
      <svg viewBox="0 0 100 100" >
        <rect x="45" y="0" width="10" height="100" fill="#006064"/>
      </svg>`;
    }
    if (this.type === "curve") {
      return `
      <svg viewBox="0 0 100 100" >
        <path d="M 50 0 L 50 50 L 100 50" stroke="#006064" stroke-width="10" fill="none" stroke-linejoin="round" />
      </svg>`;
    }
    return "";
  }
}

// Génération du puzzle : chemin Hamiltonien avec 2 connexions par case, sans T ni croix
function generatePuzzle(rows, cols, seed) {

  const rng = createRNG(seed);
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const connections = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => [])
  );

  const grid = document.getElementById("grid");
  grid.style.gridTemplateRows = `repeat(4, 60px)`;
  grid.style.gridTemplateColumns = `repeat(4, 60px)`;

  const path = [];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function dfs(x, y, count) {
    if (count === rows * cols) return true;

    visited[y][x] = true;
    path.push({ x, y });

    const dirs = shuffle([...directions]);

    for (const { dx, dy, name } of dirs) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < cols &&
        ny < rows &&
        !visited[ny][nx]
      ) {
        // Connexions bidirectionnelles
        connections[y][x].push(name);
        const opposite = directions.find(d => d.dx === -dx && d.dy === -dy).name;
        connections[ny][nx].push(opposite);

        if (dfs(nx, ny, count + 1)) {
          return true;
        }

        // Backtrack
        connections[y][x].pop();
        connections[ny][nx].pop();
      }
    }

    visited[y][x] = false;
    path.pop();
    return false;
  }

  dfs(0, 0, 1);

  const tiles = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const conns = connections[y][x];
      const { type, rot } = getTileTypeFromConnections(conns);
      tiles.push({ x, y, type, rot });
    }
  }

  return {
    tiles,
    start: path[0],
    end: path[path.length - 1]
  };
}

// Applique une rotation aléatoire multiple de 90° à chaque tuile au démarrage
function randomizeRotations(tiles, rng) {
  for (const tile of tiles) {
    const steps = Math.floor(rng() * 4); // 0,1,2,3
    tile.rot = (tile.rot + steps * 90) % 360;
  }
}

// Vérifie que toutes les tuiles sont dans la bonne orientation (celle générée)
function checkSolution(currentTiles, solutionTiles) {
  for (let i = 0; i < currentTiles.length; i++) {
    if(currentTiles[i].type=='curve' && currentTiles[i].rot%360 !== solutionTiles[i].rot%360) {
      return false;
    }    
    if(currentTiles[i].type=='straight' && currentTiles[i].rot%180 !== solutionTiles[i].rot%180) {
      return false;
    }
  }
  return true;
}

// Affichage de la grille et gestion des clics
function drawGrid(puzzle) {
  const { tiles, start, end } = puzzle;
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${cols}, 60px)`;

  for (const tile of tiles) {
    const el = document.createElement("div");
    el.className = "tile";
    el.innerHTML = new Tile(tile.x, tile.y, tile.type, tile.rot).symbol();
    el.style.transform = `rotate(${tile.rot}deg)`;

    if (tile.x === start.x && tile.y === start.y) el.classList.add("start");
    if (tile.type === 'empty' & (tile.x != start.x || tile.y != start.y)) el.classList.add("end");

    el.addEventListener("pointerdown", () => {
      nbRotations++;
      tile.rot = (tile.rot + 90);
      el.style.transform = `rotate(${tile.rot}deg)`;

      if (checkSolution(puzzle.tiles, solution.tiles)) {
        setTimeout(messageFin, 200);
      }
    });

    grid.appendChild(el);
  }
}

function messageFin() {
  clearInterval(timer);

  resultat.gagne = true;
  resultat.actions = nbRotations;
  resultat.temps = G('chrono').innerHTML;
  G('body').classList.add('gagne');
  clearTimeout(maxTimer);
  finCoup();
}

function finCoup() {
  gameData.state = STATE_FINI;

  document.querySelectorAll(".tile").forEach(tileEl => {
    tileEl.replaceWith(tileEl.cloneNode(true));
  });
  parent.partieTerminee(resultat);
}
// --- Initialisation ---
function prepare(data) {
  gameData.maxDuration = data.maxDuration;
  const seed = data.seed;
  const rng = createRNG(seed);
  rows = data.nbRows;
  cols = data.nbCols;

  solution = generatePuzzle(data.nbRows, data.nbCols, seed);

  // Cloner les tiles pour la partie en cours (rotation modifiable)
  const puzzle = {
    tiles: solution.tiles.map(t => ({ ...t })),
    start: solution.start,
    end: solution.end
  };

  randomizeRotations(puzzle.tiles, rng);

  drawGrid(puzzle);

  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('touchstart', e => e.preventDefault(), { passive: false });

  if(gameData.state == STATE_TITRE) {
    gameData.state = STATE_CHRONO;
    hide('rules');
    hide('titre');
    show('chrono');
  }
}

function demarre() {
  if(gameData.state == STATE_CHRONO) {
    gameData.state = STATE_JEU;
    show('rebours');
    setTimeout(decrementeCAR, 1000);
  }
}

function decrementeCAR() {
  if(car == 1) {
    lanceJeu();
  } else {
    W('rebours', --car);
    setTimeout(decrementeCAR, 1000);
  }
}

function lanceJeu() {
  hide('rebours');
  show('grid');
  startTime = Date.now();

  timer = setInterval(() => {
    const duree = Math.floor((Date.now() - startTime) / 100);
    W('chrono', duree / 10.);
  }, 100);
  
  maxTimer = setTimeout(finForcee, gameData.maxDuration);
}

function finForcee() {
  G('body').classList.add('perdu');
  clearInterval(timer);
  resultat.gagne = false;
  resultat.actions = nbRotations;
  resultat.temps = G('chrono').innerHTML;
  parent.partieTerminee(resultat);
  document.querySelectorAll(".tile").forEach(tileEl => {
    tileEl.replaceWith(tileEl.cloneNode(true));
  });
}

document.addEventListener("DOMContentLoaded", () => {
// const seed = 12345;
// const rng = createRNG(seed);

// solution = generatePuzzle(rows, cols, seed);

// // Cloner les tiles pour la partie en cours (rotation modifiable)
// const puzzle = {
//   tiles: solution.tiles.map(t => ({ ...t })),
//   start: solution.start,
//   end: solution.end
// };

// randomizeRotations(puzzle.tiles, rng);

// drawGrid(puzzle);

// document.addEventListener('gesturestart', e => e.preventDefault());
// document.addEventListener('dblclick', e => e.preventDefault());
// document.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
});

