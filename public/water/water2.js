const gridSize = 5;
const grid = document.getElementById("grid");
let seed = Date.now().toString().slice(-6);
let rng = mulberry32(hashCode(seed));

let solutionGrid = []; // solution correcte : type et angle
let currentGrid = [];  // état actuel affiché

function restartGame() {
  //
  seed = Date.now().toString().slice(-6);
  // seed = prompt("Entrez une seed ou laissez vide pour aléatoire:", seed) || Date.now().toString().slice(-6);
  rng = mulberry32(hashCode(seed));
  generatePuzzle();
}

function getDirection(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx === 1) return 'E';
  if (dx === -1) return 'W';
  if (dy === 1) return 'S';
  if (dy === -1) return 'N';

  return null;
}

function generatePuzzle() {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;

  solutionGrid = [];
  currentGrid = [];

  const path = generatePath();

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const index = y * gridSize + x;
      const cell = document.createElement("div");
      cell.className = "cell pipe";
      cell.dataset.index = index;

      let type = "straight";
      let correctAngle = 0;

      const inPath = path.find(p => p.x === x && p.y === y);
      if (inPath) {
        const { prev, next } = inPath;

        const d1 = getDirection(prev, inPath);
        const d2 = getDirection(inPath, next);

        // Mapping directions to type + angle
        const key = `${d1}${d2}`;

        const pipeMap = {
          'NS': { type: 'straight', angle: 0 },
          'SN': { type: 'straight', angle: 0 },
          'EW': { type: 'straight', angle: 95 },
          'WE': { type: 'straight', angle: 95 },

          'NE': { type: 'curve', angle: 0 },
          'ES': { type: 'curve', angle: 90 },
          'SW': { type: 'curve', angle: 180 },
          'WN': { type: 'curve', angle: 270 },

          'EN': { type: 'curve', angle: 270 },
          'SE': { type: 'curve', angle: 0 },
          'WS': { type: 'curve', angle: 90 },
          'NW': { type: 'curve', angle: 180 },
        };

        const match = pipeMap[key];

        if (match) {
          type = match.type;
          correctAngle = match.angle;
        } else {
          // fallback
          type = "straight";
          correctAngle = 0;
        }

        solutionGrid[index] = { type, angle: correctAngle };
      } else {
        // Cell not in path: random pipe
        type = rng() > 0.5 ? "straight" : "curve";
        correctAngle = Math.floor(rng() * 4) * 90;
        solutionGrid[index] = { type, angle: correctAngle };
      }

      // User scrambled angle
      const currentAngle = (solutionGrid[index].angle + Math.floor(rng() * 4) * 90) % 360;
      currentGrid[index] = currentAngle;

      cell.dataset.type = type;
      cell.dataset.angle = currentAngle;
      cell.style.transform = `rotate(${currentAngle}deg)`;

      if (index === 0) cell.classList.add("start");
      if (index === gridSize * gridSize - 1) cell.classList.add("end");

      const svg = createPipeSVG(type);
      cell.appendChild(svg);

      cell.addEventListener("click", () => {
        currentGrid[index] = (parseInt(currentGrid[index]) + 90) % 360;
        cell.dataset.angle = currentGrid[index];
        cell.style.transform = `rotate(${currentGrid[index]}deg)`;
      });

      grid.appendChild(cell);
    }
  }
}



function createPipeSVG(type) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#01579b");
  path.setAttribute("stroke-width", "20");
  path.setAttribute("stroke-linecap", "round");

  if (type === "straight") {
    // Tuyau droit vertical par défaut
    path.setAttribute("d", "M 0 50 L 100 50");
  } else if (type === "curve") {
    // Tuyau courbe : gauche -> centre -> haut (segments droits)
    path.setAttribute("d", "M 0 50 L 50 50 L 50 0");
    
  }

  svg.appendChild(path);
  return svg;
}


function showSolution() {
  for (let i = 0; i < solutionGrid.length; i++) {
    const cell = grid.children[i];
    const solution = solutionGrid[i];
    cell.style.transform = `rotate(${solution.angle}deg)`;
    cell.dataset.angle = solution.angle;
    currentGrid[i] = solution.angle;
  }
}

function generatePath() {
  const path = [];
  let x = 0, y = 0;
  path.push({ x, y });

  while (x !== gridSize - 1 || y !== gridSize - 1) {
    const directions = [];
    if (x < gridSize - 1) directions.push({ x: x + 1, y });
    if (y < gridSize - 1) directions.push({ x, y: y + 1 });

    const next = directions[Math.floor(rng() * directions.length)];
    path.push({ ...next });
    x = next.x;
    y = next.y;
  }

  for (let i = 0; i < path.length; i++) {
    path[i].prev = path[i - 1] || path[i];
    path[i].next = path[i + 1] || path[i];
  }

  //debugger;
  //document.getElementById('debug').innerHTML = path;
  return path;
}

function getCurveRotation(dir1, dir2) {
  const dirs = [dir1, dir2].sort(); // assure un ordre stable
  if (dirs.includes(0) && dirs.includes(3)) return 0;   // OUEST-NORD
  if (dirs.includes(0) && dirs.includes(1)) return 90;  // NORD-EST
  if (dirs.includes(1) && dirs.includes(2)) return 180; // EST-SUD
  if (dirs.includes(2) && dirs.includes(3)) return 270; // SUD-OUEST
  return 0; // fallback
}

// Seed-based PRNG
function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

restartGame();
