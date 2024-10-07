const GRID_ROWS = 20;
const GRID_COLS = 24;
const NUM_MINES = 99;
let board = [];
let gameOver = false;
let firstClick = true;

const gameBoard = document.getElementById('game-board');
const gameOverScreen = document.getElementById('game-over');
const message = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');

restartBtn.addEventListener('click', restartGame);

function createBoard() {
    gameBoard.innerHTML = '';
    board = [];
    for (let i = 0; i < GRID_ROWS; i++) {
        board[i] = [];
        for (let j = 0; j < GRID_COLS; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', revealCell);
            cell.addEventListener('contextmenu', flagCell);
            gameBoard.appendChild(cell);
            board[i][j] = { revealed: false, mine: false, flagged: false, adjacentMines: 0, element: cell };
        }
    }
}

function placeMines(excludeRow, excludeCol) {
    let minePositions = new Set();
    while (minePositions.size < NUM_MINES) {
        const position = Math.floor(Math.random() * GRID_ROWS * GRID_COLS);
        const row = Math.floor(position / GRID_COLS);
        const col = position % GRID_COLS;

        // Ensure that mines are not placed near the first clicked cell
        if (Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1) continue;

        minePositions.add(position);
    }

    for (let position of minePositions) {
        const row = Math.floor(position / GRID_COLS);
        const col = position % GRID_COLS;
        board[row][col].mine = true;
    }
}

function calculateAdjacentMines() {
    for (let i = 0; i < GRID_ROWS; i++) {
        for (let j = 0; j < GRID_COLS; j++) {
            if (board[i][j].mine) continue;

            let mineCount = 0;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    const r = i + x;
                    const c = j + y;
                    if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS && board[r][c].mine) {
                        mineCount++;
                    }
                }
            }
            board[i][j].adjacentMines = mineCount;
        }
    }
}

function revealCell(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cell = board[row][col];

    if (gameOver || cell.revealed || cell.flagged) return;

    if (firstClick) {
        placeMines(row, col);
        calculateAdjacentMines();
        firstClick = false;
    }

    revealCellRecursive(row, col);

    if (checkWin()) {
        endGame(true);
    }
}

function revealCellRecursive(row, col) {
    const cell = board[row][col];

    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    cell.element.classList.add('revealed');
    if (cell.mine) {
        cell.element.innerHTML = '💣';
        endGame(false);
        return;
    }

    cell.element.textContent = cell.adjacentMines > 0 ? cell.adjacentMines : '';

    // If the cell has no adjacent mines, reveal all surrounding cells
    if (cell.adjacentMines === 0) {
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                const r = row + x;
                const c = col + y;
                if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
                    revealCellRecursive(r, c);
                }
            }
        }
    }
}

function flagCell(e) {
    e.preventDefault();
    if (gameOver || firstClick) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cell = board[row][col];

    if (cell.revealed) return;

    cell.flagged = !cell.flagged;
    cell.element.innerHTML = cell.flagged ? '🚩' : '';
}

function checkWin() {
    let correctFlags = 0;
    let flaggedCells = 0;

    for (let i = 0; i < GRID_ROWS; i++) {
        for (let j = 0; j < GRID_COLS; j++) {
            const cell = board[i][j];
            if (cell.flagged) {
                flaggedCells++;
                if (cell.mine) {
                    correctFlags++;
                }
            }
        }
    }

    return correctFlags === NUM_MINES && flaggedCells === NUM_MINES;
}

function endGame(won) {
    gameOver = true;

    if (won) {
        message.textContent = 'Вы выиграли!';
    } else {
        message.textContent = 'Вы проиграли!';
        revealAllMines();
    }

    gameOverScreen.classList.remove('hidden');
}

function revealAllMines() {
    for (let i = 0; i < GRID_ROWS; i++) {
        for (let j = 0; j < GRID_COLS; j++) {
            const cell = board[i][j];
            if (cell.mine) {
                cell.element.innerHTML = '💣';
                cell.element.classList.add('mine');
            }
        }
    }
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    gameOver = false;
    firstClick = true;
    createBoard();
}

createBoard();
