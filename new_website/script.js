document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    const GRID_SIZE = 20;
    const SNAKE_SIZE = canvas.width / GRID_SIZE;
    
    let snake = [];
    let food = {};
    let direction = '';
    let nextDirection = '';
    let gameInterval;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameStarted = false;
    let gameOver = false;

    highScoreElement.textContent = highScore;

    function initGame() {
        snake = [
            { x: 5, y: 5 }
        ];
        score = 0;
        scoreElement.textContent = score;
        direction = 'right';
        nextDirection = 'right';
        gameOver = false;
        createFood();
    }

    function createFood() {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        // Make sure food doesn't appear on snake
        while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
            food = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
        }
    }

    function drawGame() {
        // Clear canvas
        ctx.fillStyle = '#0a0e17';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for(let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * SNAKE_SIZE, 0);
            ctx.lineTo(i * SNAKE_SIZE, canvas.height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i * SNAKE_SIZE);
            ctx.lineTo(canvas.width, i * SNAKE_SIZE);
            ctx.stroke();
        }

        // Draw snake
        snake.forEach((segment, index) => {
            const gradient = ctx.createLinearGradient(
                segment.x * SNAKE_SIZE,
                segment.y * SNAKE_SIZE,
                (segment.x + 1) * SNAKE_SIZE,
                (segment.y + 1) * SNAKE_SIZE
            );
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, '#00ffcc');
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = 'rgba(0, 255, 136, 0.5)';
            ctx.shadowBlur = 15;
            ctx.fillRect(
                segment.x * SNAKE_SIZE + 2,
                segment.y * SNAKE_SIZE + 2,
                SNAKE_SIZE - 4,
                SNAKE_SIZE - 4
            );
            
            // Add glow effect for head
            if(index === 0) {
                ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
                ctx.shadowBlur = 20;
                ctx.fillRect(
                    segment.x * SNAKE_SIZE + 2,
                    segment.y * SNAKE_SIZE + 2,
                    SNAKE_SIZE - 4,
                    SNAKE_SIZE - 4
                );
            }
            ctx.shadowBlur = 0;
        });

        // Draw food with pulsing effect
        const pulseAmount = Math.sin(Date.now() / 200) * 2;
        ctx.fillStyle = '#ff3366';
        ctx.shadowColor = 'rgba(255, 51, 102, 0.8)';
        ctx.shadowBlur = 20 + pulseAmount;
        ctx.fillRect(
            food.x * SNAKE_SIZE + 2,
            food.y * SNAKE_SIZE + 2,
            SNAKE_SIZE - 4,
            SNAKE_SIZE - 4
        );
        ctx.shadowBlur = 0;

        if (gameOver) {
            ctx.fillStyle = 'rgba(10, 14, 23, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#fff';
            ctx.shadowColor = 'rgba(0, 255, 136, 0.5)';
            ctx.shadowBlur = 10;
            ctx.font = 'bold 36px Poppins';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 20);
            
            ctx.font = '20px Poppins';
            ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
            ctx.shadowBlur = 0;
        }
    }

    function moveSnake() {
        if (gameOver) return;

        direction = nextDirection;
        const head = { ...snake[0] };

        switch(direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check collision with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            endGame();
            return;
        }

        // Check collision with self
        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            endGame();
            return;
        }

        snake.unshift(head);

        // Check if food is eaten
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            createFood();
        } else {
            snake.pop();
        }
    }

    function endGame() {
        gameOver = true;
        gameStarted = false;
        clearInterval(gameInterval);
        startBtn.style.display = 'none';
        restartBtn.style.display = 'block';
        drawGame();
    }

    function handleKeyPress(e) {
        if (!gameStarted) return;

        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    }

    function handleMobileControl(direction) {
        if (!gameStarted) return;
        
        switch(direction) {
            case 'up':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'down':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'left':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'right':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    }

    // Add touch event listeners
    upBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleMobileControl('up');
    });

    downBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleMobileControl('down');
    });

    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleMobileControl('left');
    });

    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleMobileControl('right');
    });

    // Add click event listeners for testing on desktop
    upBtn.addEventListener('click', () => handleMobileControl('up'));
    downBtn.addEventListener('click', () => handleMobileControl('down'));
    leftBtn.addEventListener('click', () => handleMobileControl('left'));
    rightBtn.addEventListener('click', () => handleMobileControl('right'));

    startBtn.addEventListener('click', () => {
        if (!gameStarted) {
            gameStarted = true;
            initGame();
            gameInterval = setInterval(() => {
                moveSnake();
                drawGame();
            }, 100);
            startBtn.style.display = 'none';
            restartBtn.style.display = 'none';
        }
    });

    restartBtn.addEventListener('click', () => {
        gameStarted = true;
        initGame();
        gameInterval = setInterval(() => {
            moveSnake();
            drawGame();
        }, 100);
        restartBtn.style.display = 'none';
    });

    document.addEventListener('keydown', handleKeyPress);
    
    // Initial draw
    drawGame();
});
