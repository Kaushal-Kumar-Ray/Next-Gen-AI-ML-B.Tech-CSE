document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.getElementsByClassName('cell');
    let currentPlayer = 'X';
    let moves = 0;
    let gameOver = false;

    // Load tap sound effect
    const tapSound = new Audio('tap.mp3');

    // Create the Tic-Tac-Toe grid
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
    }

    function handleCellClick(event) {
        if (gameOver) return;

        const clickedCell = event.target;

        // Check if the cell is already clicked
        if (clickedCell.textContent !== '') {
            alert('Cell already selected. Choose another cell.');
            return;
        }

        // Play tap sound
        tapSound.currentTime = 0; // Reset sound if it's played again quickly
        tapSound.play();

        // Update the cell with the current player's mark
        clickedCell.textContent = currentPlayer;

        // Check for a winner after each move
        if (checkForWinner()) {
            announceWinner();
            return;
        }

        // Switch to the other player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

        // Increment the moves counter
        moves++;

        // Check for a tie
        if (moves === 9) {
            announceDraw();
        }

        // Update the turn indicator
        updateTurnIndicator();
    }

    function checkForWinner() {
        // Define winning combinations
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            const cellA = cells[a].textContent;
            const cellB = cells[b].textContent;
            const cellC = cells[c].textContent;

            // Check if the cells in the combination are all filled with the same player's mark
            if (cellA !== '' && cellA === cellB && cellB === cellC) {
                return true;
            }
        }

        return false;
    }

    function announceWinner() {
        gameOver = true;
        const resultContainer = document.getElementById('result-container');
        const result = document.getElementById('result');
        result.textContent = `Player ${currentPlayer} wins!`;
        resultContainer.style.display = 'flex';
    }

    function announceDraw() {
        gameOver = true;
        const resultContainer = document.getElementById('result-container');
        const result = document.getElementById('result');
        result.textContent = 'It\'s a draw!';
        resultContainer.style.display = 'flex';
    }

    function resetGame() {
        // Clear the board
        for (const cell of cells) {
            cell.textContent = '';
        }

        // Reset game variables
        currentPlayer = 'X';
        moves = 0;
        gameOver = false;

        // Hide the result container
        document.getElementById('result-container').style.display = 'none';

        // Update the turn indicator
        updateTurnIndicator();
    }

    function updateTurnIndicator() {
        const turnIndicator = document.getElementById('turn-indicator');
        turnIndicator.textContent = `Player ${currentPlayer}'s turn`;
    }

    // New Game button click event
    document.getElementById('new-game-button').addEventListener('click', resetGame);
    document.getElementById('result-new-game-button').addEventListener('click', resetGame);

    // Initial update of the turn indicator
    updateTurnIndicator();

    // Optimize board for mobile
    board.style.display = 'grid';
    board.style.gridTemplateColumns = 'repeat(3, 1fr)';
    board.style.gridGap = '5px';
    board.style.maxWidth = '300px';
    board.style.width = '90vw';
    board.style.margin = 'auto';

    for (const cell of cells) {
        cell.style.width = '100%';
        cell.style.height = '80px';
        cell.style.fontSize = '20px';
    }

    // Responsive adjustments
    window.addEventListener('resize', () => {
        if (window.innerWidth < 500) {
            for (const cell of cells) {
                cell.style.height = '60px';
                cell.style.fontSize = '16px';
            }
        } else {
            for (const cell of cells) {
                cell.style.height = '80px';
                cell.style.fontSize = '20px';
            }
        }
    });
});
