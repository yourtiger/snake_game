// 游戏常量
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const CELL_COUNT = CANVAS_SIZE / GRID_SIZE;
const INITIAL_SPEED = 150; // 初始速度（毫秒）
const SPEED_INCREMENT = 5; // 每次加速的毫秒数

// 游戏状态
let canvas, ctx;
let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = 0;
let speed = INITIAL_SPEED;
let gameRunning = false;
let gamePaused = false;
let gameLoop = null;

// 初始化游戏
function initGame() {
    // 获取画布和上下文
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 加载最高分
    loadHighScore();
    
    // 初始化蛇
    resetSnake();
    
    // 生成食物
    generateFood();
    
    // 绘制初始游戏画面
    drawGame();
    
    // 添加事件监听
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.addEventListener('keydown', handleKeyPress);
}

// 重置蛇
function resetSnake() {
    snake = [];
    // 初始化蛇的长度为3
    for (let i = 2; i >= 0; i--) {
        snake.push({ x: i, y: 10 });
    }
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
}

// 生成食物
function generateFood() {
    let newFood;
    // 确保食物不会生成在蛇身上
    do {
        newFood = {
            x: Math.floor(Math.random() * CELL_COUNT),
            y: Math.floor(Math.random() * CELL_COUNT)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // 绘制网格（可选）
    drawGrid();
    
    // 绘制食物
    drawFood();
    
    // 绘制蛇
    drawSnake();
    
    // 如果游戏暂停，显示暂停信息
    if (gamePaused) {
        drawPauseMessage();
    }
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= CELL_COUNT; i++) {
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
        ctx.stroke();
    }
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 绘制蛇
function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        
        // 头部颜色不同
        if (i === 0) {
            ctx.fillStyle = '#4CAF50';
        } else {
            ctx.fillStyle = '#8BC34A';
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
        
        // 蛇的边框
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
    }
}

// 绘制暂停信息
function drawPauseMessage() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    ctx.fillStyle = 'white';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏暂停', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
}

// 更新游戏状态
function updateGame() {
    if (gamePaused) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 计算新头部位置
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 将新头部添加到蛇的前面
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        generateFood();
        // 增加游戏速度
        speed = Math.max(speed - SPEED_INCREMENT, 50);
        // 重新设置游戏循环速度
        clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, speed);
    } else {
        // 移除蛇尾
        snake.pop();
    }
    
    // 重新绘制游戏
    drawGame();
}

// 检查碰撞
function checkCollision(head) {
    // 边界碰撞
    if (head.x < 0 || head.x >= CELL_COUNT || head.y < 0 || head.y >= CELL_COUNT) {
        return true;
    }
    
    // 自身碰撞
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameLoop);
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        saveHighScore();
        updateHighScore();
    }
    
    // 显示游戏结束信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    ctx.fillStyle = 'white';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 40);
    
    ctx.font = '24px Arial';
    ctx.fillText(`最终分数: ${score}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    ctx.fillText('按开始按钮重新游戏', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 40);
}

// 处理键盘输入
function handleKeyPress(e) {
    // 防止方向键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
    }
    
    // 根据按键更新方向
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y === 0) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x === 0) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x === 0) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
        case ' ':
            // 空格键暂停/继续游戏
            if (gameRunning) {
                togglePause();
            }
            break;
    }
}

// 更新分数
function updateScore() {
    document.getElementById('score').textContent = score;
}

// 更新最高分
function updateHighScore() {
    document.getElementById('high-score').textContent = highScore;
}

// 保存最高分
function saveHighScore() {
    localStorage.setItem('snakeHighScore', highScore.toString());
}

// 加载最高分
function loadHighScore() {
    const savedScore = localStorage.getItem('snakeHighScore');
    if (savedScore) {
        highScore = parseInt(savedScore);
        updateHighScore();
    }
}

// 开始游戏
function startGame() {
    if (!gameRunning) {
        score = 0;
        updateScore();
        speed = INITIAL_SPEED;
        resetSnake();
        generateFood();
        gameRunning = true;
        gamePaused = false;
        
        // 开始游戏循环
        gameLoop = setInterval(updateGame, speed);
    }
}

// 切换暂停状态
function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        if (!gamePaused) {
            // 如果从暂停恢复，立即更新一次游戏
            updateGame();
        }
    }
}

// 重置游戏
function resetGame() {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameLoop);
    score = 0;
    updateScore();
    speed = INITIAL_SPEED;
    resetSnake();
    generateFood();
    drawGame();
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', initGame);