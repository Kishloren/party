const gridSize = 5; // Taille de la grille
const pipes = [
    '↑↓', // Tuyau droit vertical
    '←→', // Tuyau droit horizontal
    '↖↘', // Tuyau coudé haut gauche
    '↗↙', // Tuyau coudé haut droit
    '↙↘', // Tuyau coudé bas gauche
    '↖↙', // Tuyau coudé bas droit
];

function createGrid() {
    const grid = document.getElementById('gameGrid');
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', rotatePipe);
        grid.appendChild(cell);
    }
    initializePipes();
}

function initializePipes() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const randomPipe = pipes[Math.floor(Math.random() * pipes.length)];
        cell.dataset.pipe = randomPipe;
        cell.innerHTML = `<div class="pipe">${randomPipe[0]}</div>`;
    });
}

function rotatePipe(event) {
    const cell = event.currentTarget;
    const currentPipe = cell.dataset.pipe;
    const currentIndex = pipes.indexOf(currentPipe);
    const newIndex = (currentIndex + 1) % pipes.length;
    const newPipe = pipes[newIndex];
    cell.dataset.pipe = newPipe;
    cell.innerHTML = `<div class="pipe">${newPipe[0]}</div>`;
    checkSolution();
}

function checkSolution() {
    const cells = document.querySelectorAll('.cell');
    const start = cells[0].dataset.pipe;
    const end = cells[cells.length - 1].dataset.pipe;
    if (start.includes('↓') && end.includes('↑')) {
        if (isPathValid()) {
            alert('Vous avez gagné!');
        }
    }
}

function isPathValid() {
    const cells = document.querySelectorAll('.cell');
    const visited = new Array(cells.length).fill(false);
    const stack = [0];

    while (stack.length > 0) {
        const current = stack.pop();
        if (visited[current]) continue;
        visited[current] = true;

        const cell = cells[current];
        const pipe = cell.dataset.pipe;
        const directions = getDirections(pipe);

        for (const dir of directions) {
            const next = current + dir;
            if (next >= 0 && next < cells.length && !visited[next]) {
                const nextCell = cells[next];
                const nextPipe = nextCell.dataset.pipe;
                if (isConnected(pipe, nextPipe, dir)) {
                    stack.push(next);
                }
            }
        }
    }

    return visited.every(v => v);
}

function getDirections(pipe) {
    switch (pipe) {
        case '↑↓': return [-gridSize, gridSize];
        case '←→': return [-1, 1];
        case '↖↘': return [-gridSize - 1, gridSize + 1];
        case '↗↙': return [-gridSize + 1, gridSize - 1];
        case '↙↘': return [gridSize - 1, gridSize + 1];
        case '↖↙': return [-gridSize - 1, -gridSize + 1];
    }
}

function isConnected(pipe1, pipe2, dir) {
    const connections = {
        '↑↓': ['↑↓', '↖↘', '↗↙'],
        '←→': ['←→', '↙↘', '↖↙'],
        '↖↘': ['↑↓', '←→', '↗↙', '↙↘'],
        '↗↙': ['↑↓', '←→', '↖↘', '↙↘'],
        '↙↘': ['←→', '↑↓', '↖↘', '↗↙'],
        '↖↙': ['←→', '↑↓', '↗↙', '↙↘']
    };
    const oppositeDir = dir === -gridSize ? gridSize : dir === gridSize ? -gridSize : dir === -1 ? 1 : -1;
    return connections[pipe1].includes(pipe2) && connections[pipe2].includes(pipe1[oppositeDir]);
}

function solvePuzzle() {
    const cells = document.querySelectorAll('.cell');
    const start = 0;
    const end = cells.length - 1;
    const directions = [-gridSize, gridSize, -1, 1];
    const stack = [start];
    const visited = new Array(cells.length).fill(false);

    while (stack.length > 0) {
        const current = stack.pop();
        if (visited[current]) continue;
        visited[current] = true;

        if (current === end) {
            break;
        }

        const cell = cells[current];
        const pipe = cell.dataset.pipe;
        const possibleDirections = getDirections(pipe);

        for (const dir of possibleDirections) {
            const next = current + dir;
            if (next >= 0 && next < cells.length && !visited[next]) {
                const nextCell = cells[next];
                const nextPipe = nextCell.dataset.pipe;
                if (isConnected(pipe, nextPipe, dir)) {
                    stack.push(next);
                }
            }
        }
    }

    if (visited.every(v => v)) {
        alert('Puzzle résolu!');
    } else {
        alert('Impossible de résoudre le puzzle.');
    }
}

document.getElementById('solveButton').addEventListener('click', solvePuzzle);

createGrid();
