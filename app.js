// Game Configuration
const gameConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    gravity: 0.8,
    jumpPower: -15,
    playerSpeed: 5,
    sprintDuration: 120000,
    totalLevels: 3,
    bugs: [
        {type: "common", points: 1, color: "#ff4444"},
        {type: "flying", points: 2, color: "#44ff44"},
        {type: "critical", points: 10, color: "#ffaa00"}
    ]
};

const colors = {
    background: "#1a0033",
    platforms: "#4a4a9f",
    falsePlatforms: "#9f4a4a",
    player: "#ffd700",
    uiText: "#ffffff",
    gate: "#00ff88"
};

// Level Data
const levelData = {
    level1: {
        name: "Спринт 1: Basic Debugging",
        difficulty: "Новичок",
        platforms: [
            {x: 0, y: 550, width: 200, height: 50, type: "solid"},
            {x: 250, y: 450, width: 100, height: 20, type: "solid"},
            {x: 400, y: 350, width: 80, height: 20, type: "false"},
            {x: 550, y: 300, width: 120, height: 20, type: "solid"},
            {x: 700, y: 200, width: 100, height: 20, type: "solid"}
        ],
        bugs: [
            {x: 100, y: 500, type: "common"},
            {x: 300, y: 400, type: "common"},
            {x: 450, y: 300, type: "flying"},
            {x: 600, y: 250, type: "common"},
            {x: 750, y: 150, type: "critical"}
        ],
        releaseGate: {x: 750, y: 120, width: 60, height: 80},
        playerStart: {x: 50, y: 500}
    },
    level2: {
        name: "Спринт 2: Integration Testing",
        difficulty: "Средний", 
        platforms: [
            {x: 0, y: 550, width: 150, height: 50, type: "solid"},
            {x: 200, y: 480, width: 80, height: 20, type: "false"},
            {x: 320, y: 420, width: 100, height: 20, type: "solid"},
            {x: 480, y: 360, width: 60, height: 20, type: "false"},
            {x: 580, y: 300, width: 80, height: 20, type: "false"},
            {x: 700, y: 240, width: 100, height: 20, type: "solid"},
            {x: 500, y: 180, width: 120, height: 20, type: "solid"},
            {x: 300, y: 120, width: 80, height: 20, type: "solid"}
        ],
        bugs: [
            {x: 75, y: 500, type: "common"},
            {x: 240, y: 430, type: "flying"},
            {x: 370, y: 370, type: "common"},
            {x: 520, y: 310, type: "flying"},
            {x: 620, y: 250, type: "critical"},
            {x: 750, y: 190, type: "common"},
            {x: 560, y: 130, type: "flying"},
            {x: 340, y: 70, type: "critical"}
        ],
        releaseGate: {x: 320, y: 40, width: 60, height: 80},
        playerStart: {x: 50, y: 500}
    },
    level3: {
        name: "Спринт 3: Production Hotfix",
        difficulty: "Эксперт",
        platforms: [
            {x: 0, y: 550, width: 120, height: 50, type: "solid"},
            {x: 160, y: 500, width: 60, height: 20, type: "false"},
            {x: 260, y: 450, width: 80, height: 20, type: "false"},
            {x: 380, y: 400, width: 100, height: 20, type: "solid"},
            {x: 520, y: 350, width: 60, height: 20, type: "false"},
            {x: 620, y: 300, width: 80, height: 20, type: "false"},
            {x: 720, y: 250, width: 80, height: 20, type: "solid"},
            {x: 600, y: 200, width: 70, height: 20, type: "false"},
            {x: 450, y: 150, width: 90, height: 20, type: "solid"},
            {x: 280, y: 100, width: 60, height: 20, type: "false"},
            {x: 100, y: 50, width: 120, height: 20, type: "solid"}
        ],
        bugs: [
            {x: 60, y: 500, type: "flying"},
            {x: 190, y: 450, type: "common"},
            {x: 300, y: 400, type: "flying"},
            {x: 430, y: 350, type: "critical"},
            {x: 550, y: 300, type: "flying"},
            {x: 650, y: 250, type: "common"},
            {x: 760, y: 200, type: "flying"},
            {x: 630, y: 150, type: "critical"},
            {x: 490, y: 100, type: "flying"},
            {x: 310, y: 50, type: "critical"},
            {x: 160, y: 0, type: "flying"}
        ],
        releaseGate: {x: 140, y: -30, width: 60, height: 80},
        playerStart: {x: 50, y: 500}
    }
};

// Game State
let gameState = 'menu';
let canvas, ctx;
let gameTime = 0;
let sprintTimeLeft = gameConfig.sprintDuration;
let score = 0;
let bugsCollected = 0;
let gameLoop;
let keys = {};
let currentLevel = 1;
let totalScore = 0;
let levelScores = [];

// Game Objects
let player = {
    x: 50,
    y: 500,
    width: 32,
    height: 32,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    animFrame: 0,
    animTime: 0
};

let platforms = [];
let bugs = [];
let releaseGate = {};
let particles = [];
let breakingPlatforms = [];

// Original level data for resetting
let originalPlatforms = [];
let originalBugs = [];

// DOM Elements
let screens = {};
let ui = {};

// Initialize game
function init() {
    // Get DOM elements
    screens.mainMenu = document.getElementById('mainMenu');
    screens.levelSelectScreen = document.getElementById('levelSelectScreen');
    screens.gameScreen = document.getElementById('gameScreen');
    screens.levelCompleteScreen = document.getElementById('levelCompleteScreen');
    screens.gameOverScreen = document.getElementById('gameOverScreen');
    screens.leaderboardScreen = document.getElementById('leaderboardScreen');
    screens.instructionsModal = document.getElementById('instructionsModal');
    screens.pauseOverlay = document.getElementById('pauseOverlay');

    ui.bugCount = document.getElementById('bugCount');
    ui.timeRemaining = document.getElementById('timeRemaining');
    ui.currentLevelDisplay = document.getElementById('currentLevelDisplay');
    ui.levelBugCount = document.getElementById('levelBugCount');
    ui.levelSpeedBonus = document.getElementById('levelSpeedBonus');
    ui.levelScore = document.getElementById('levelScore');
    ui.levelCompleteTitle = document.getElementById('levelCompleteTitle');
    ui.finalBugCount = document.getElementById('finalBugCount');
    ui.speedBonus = document.getElementById('speedBonus');
    ui.totalScore = document.getElementById('totalScore');
    ui.performanceRating = document.getElementById('performanceRating');
    ui.newHighScore = document.getElementById('newHighScore');
    ui.playerNameInput = document.getElementById('playerNameInput');
    ui.leaderboardList = document.getElementById('leaderboardList');
    ui.gameOverTitle = document.getElementById('gameOverTitle');

    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Set up event listeners
    setupEventListeners();
    
    // Initialize leaderboard and level progress
    loadLeaderboard();
    updateLeaderboardDisplay();
    updateLevelSelectDisplay();
    
    // Show main menu
    showScreen('mainMenu');
}

function setupEventListeners() {
    // Menu buttons
    document.getElementById('startGameBtn').addEventListener('click', () => startLevel(1));
    document.getElementById('levelSelectBtn').addEventListener('click', () => showScreen('levelSelectScreen'));
    document.getElementById('leaderboardBtn').addEventListener('click', () => showScreen('leaderboardScreen'));
    document.getElementById('instructionsBtn').addEventListener('click', () => showModal('instructions'));
    document.getElementById('closeInstructionsBtn').addEventListener('click', () => hideModal('instructions'));

    // Level selection
    document.getElementById('backFromLevelSelectBtn').addEventListener('click', () => showScreen('mainMenu'));
    
    // Level complete buttons
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
    document.getElementById('replayLevelBtn').addEventListener('click', () => startLevel(currentLevel));
    document.getElementById('backToLevelSelectBtn').addEventListener('click', () => showScreen('levelSelectScreen'));

    // Game over buttons
    document.getElementById('saveScoreBtn').addEventListener('click', saveScore);
    document.getElementById('playAgainBtn').addEventListener('click', () => startLevel(1));
    document.getElementById('backToMenuBtn').addEventListener('click', () => showScreen('mainMenu'));

    // Leaderboard buttons
    document.getElementById('backFromLeaderboardBtn').addEventListener('click', () => showScreen('mainMenu'));
    document.getElementById('clearScoresBtn').addEventListener('click', clearLeaderboard);

    // Pause buttons
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resumeBtn').addEventListener('click', togglePause);
    document.getElementById('restartLevelBtn').addEventListener('click', () => restartCurrentLevel());
    document.getElementById('restartPauseBtn').addEventListener('click', () => {
        screens.pauseOverlay.classList.add('hidden');
        restartCurrentLevel();
    });
    document.getElementById('quitBtn').addEventListener('click', quitToMenu);

    // Level card clicks
    document.addEventListener('click', (e) => {
        const levelCard = e.target.closest('.level-card');
        if (levelCard && !levelCard.classList.contains('locked')) {
            const level = parseInt(levelCard.dataset.level);
            startLevel(level);
        }
    });

    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Prevent default for game keys
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    });
}

function handleKeyDown(e) {
    keys[e.code] = true;
    keys[e.key] = true; // Also store by key name
    
    // Handle pause
    if (e.code === 'Escape' && gameState === 'playing') {
        togglePause();
    }
}

function handleKeyUp(e) {
    keys[e.code] = false;
    keys[e.key] = false; // Also store by key name
}

function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        if (screen && screen.classList) {
            screen.classList.add('hidden');
        }
    });
    
    // Show selected screen
    if (screens[screenName]) {
        screens[screenName].classList.remove('hidden');
    }
    
    // Update game state
    if (screenName === 'gameScreen') {
        gameState = 'playing';
    } else if (screenName === 'levelSelectScreen') {
        gameState = 'levelSelect';
    } else if (screenName === 'levelCompleteScreen') {
        gameState = 'levelComplete';
    } else if (screenName === 'gameOverScreen') {
        gameState = 'gameOver';
    } else if (screenName === 'leaderboardScreen') {
        gameState = 'leaderboard';
    } else {
        gameState = 'menu';
    }
}

function showModal(modalName) {
    if (modalName === 'instructions') {
        screens.instructionsModal.classList.remove('hidden');
    }
}

function hideModal(modalName) {
    if (modalName === 'instructions') {
        screens.instructionsModal.classList.add('hidden');
    }
}

function loadLevel(levelNum) {
    const levelKey = `level${levelNum}`;
    const level = levelData[levelKey];
    
    if (!level) return false;
    
    // Store original data for resetting (deep copy)
    originalPlatforms = level.platforms.map(p => ({...p}));
    originalBugs = level.bugs.map(b => ({...b, collected: false, animFrame: 0, floatOffset: 0}));
    
    // Load platforms
    platforms = originalPlatforms.map(p => ({...p, broken: false, breaking: false}));
    
    // Load bugs
    bugs = originalBugs.map(b => ({...b}));
    
    // Load release gate
    releaseGate = {...level.releaseGate};
    
    // Set player start position
    player.x = level.playerStart.x;
    player.y = level.playerStart.y;
    
    return true;
}

function startLevel(levelNum) {
    currentLevel = levelNum;
    
    if (!loadLevel(levelNum)) {
        console.error(`Level ${levelNum} not found`);
        return;
    }
    
    // Reset level-specific game state
    resetLevelState();
    
    // Update UI
    const level = levelData[`level${levelNum}`];
    ui.currentLevelDisplay.textContent = level.name.split(':')[0];
    
    // Show game screen and start the game
    showScreen('gameScreen');
    
    // Start game loop
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    gameLoop = requestAnimationFrame(update);
}

function resetLevelState() {
    // Reset player
    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround = false;
    player.animFrame = 0;
    player.animTime = 0;
    
    // Reset level variables
    gameTime = 0;
    sprintTimeLeft = gameConfig.sprintDuration;
    score = 0;
    bugsCollected = 0;
    
    // Reset platforms from original data (deep copy)
    platforms = originalPlatforms.map(p => ({...p, broken: false, breaking: false}));
    
    // Reset bugs from original data (deep copy)
    bugs = originalBugs.map(b => ({...b}));
    
    // Reset effects
    breakingPlatforms = [];
    particles = [];
    
    // Update UI
    updateUI();
}

function restartCurrentLevel() {
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    
    // Reload and restart the current level
    loadLevel(currentLevel);
    resetLevelState();
    
    gameState = 'playing';
    gameLoop = requestAnimationFrame(update);
}

function nextLevel() {
    if (currentLevel < gameConfig.totalLevels) {
        startLevel(currentLevel + 1);
    } else {
        // All levels completed
        endGame(true);
    }
}

function update(timestamp) {
    if (gameState !== 'playing') return;
    
    const deltaTime = timestamp - gameTime;
    gameTime = timestamp;
    
    // Update timer
    sprintTimeLeft -= deltaTime;
    
    // Check if time is up
    if (sprintTimeLeft <= 0) {
        endGame(false);
        return;
    }
    
    // Update game objects
    updatePlayer(deltaTime);
    updateBugs(deltaTime);
    updateParticles(deltaTime);
    updateBreakingPlatforms(deltaTime);
    
    // Check collisions
    checkCollisions();
    
    // Check win condition (but not immediately on level start)
    if (gameTime > 500 && checkWinCondition()) {
        completeLevel();
        return;
    }
    
    // Render
    render();
    
    // Update UI
    updateUI();
    
    // Continue loop
    gameLoop = requestAnimationFrame(update);
}

function updatePlayer(deltaTime) {
    // Handle input - multiple key formats
    let leftPressed = keys['KeyA'] || keys['ArrowLeft'] || keys['a'] || keys['A'];
    let rightPressed = keys['KeyD'] || keys['ArrowRight'] || keys['d'] || keys['D'];
    let jumpPressed = keys['KeyW'] || keys['ArrowUp'] || keys['Space'] || keys[' '] || keys['w'] || keys['W'];
    
    if (leftPressed) {
        player.velocityX = -gameConfig.playerSpeed;
    } else if (rightPressed) {
        player.velocityX = gameConfig.playerSpeed;
    } else {
        player.velocityX *= 0.8; // Friction
    }
    
    // Jump
    if (jumpPressed && player.onGround) {
        player.velocityY = gameConfig.jumpPower;
        player.onGround = false;
    }
    
    // Apply gravity
    player.velocityY += gameConfig.gravity;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    
    // Check if player fell off the screen
    if (player.y > canvas.height + 100) {
        endGame(false);
    }
    
    // Update animation
    player.animTime += deltaTime;
    if (player.animTime > 200) {
        player.animFrame = (player.animFrame + 1) % 4;
        player.animTime = 0;
    }
}

function updateBugs(deltaTime) {
    bugs.forEach(bug => {
        if (bug.collected) return;
        
        // Animate
        bug.animFrame += deltaTime * 0.01;
        
        // Flying bugs float
        if (bug.type === 'flying') {
            bug.floatOffset += deltaTime * 0.005;
        }
    });
}

function updateParticles(deltaTime) {
    particles = particles.filter(particle => {
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.life -= deltaTime;
        particle.velocityY += 0.2; // Gravity for particles
        return particle.life > 0;
    });
}

function updateBreakingPlatforms(deltaTime) {
    breakingPlatforms = breakingPlatforms.filter(platform => {
        platform.timer -= deltaTime;
        return platform.timer > 0;
    });
}

function checkCollisions() {
    player.onGround = false;
    
    // Platform collisions
    platforms.forEach((platform, index) => {
        if (platform.broken) return;
        
        if (isColliding(player, platform)) {
            // Check if landing on top (player's bottom edge is above platform's top edge)
            if (player.velocityY > 0 && player.y + player.height <= platform.y + 10) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
                
                // Handle false platforms - break them when player lands on top
                if (platform.type === 'false' && !platform.breaking) {
                    breakPlatform(platform, index);
                }
            }
            // Side collisions
            else {
                // Left side collision
                if (player.velocityX > 0 && player.x < platform.x) {
                    player.x = platform.x - player.width;
                    player.velocityX = 0;
                }
                // Right side collision
                else if (player.velocityX < 0 && player.x + player.width > platform.x + platform.width) {
                    player.x = platform.x + platform.width;
                    player.velocityX = 0;
                }
                // Bottom collision (hitting platform from below)
                else if (player.velocityY < 0 && player.y > platform.y + platform.height) {
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                }
            }
        }
    });
    
    // Bug collisions
    bugs.forEach(bug => {
        if (bug.collected) return;
        
        const bugHitbox = {x: bug.x, y: bug.y, width: 16, height: 16};
        if (isColliding(player, bugHitbox)) {
            collectBug(bug);
        }
    });
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function breakPlatform(platform, index) {
    if (platform.breaking || platform.broken) return;
    
    platform.breaking = true;
    
    // Add to breaking platforms list for visual effect
    breakingPlatforms.push({
        ...platform,
        timer: 500
    });
    
    // Remove platform after delay
    setTimeout(() => {
        platform.broken = true;
    }, 300);
    
    // Add particles
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: platform.x + Math.random() * platform.width,
            y: platform.y,
            velocityX: (Math.random() - 0.5) * 4,
            velocityY: Math.random() * -5,
            life: 1000,
            color: colors.falsePlatforms
        });
    }
}

function collectBug(bug) {
    if (bug.collected) return;
    
    bug.collected = true;
    bugsCollected++;
    
    const bugConfig = gameConfig.bugs.find(b => b.type === bug.type);
    score += bugConfig.points;
    
    // Add collection effect
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: bug.x + 8,
            y: bug.y + 8,
            velocityX: (Math.random() - 0.5) * 6,
            velocityY: Math.random() * -8,
            life: 800,
            color: bugConfig.color
        });
    }
}

function checkWinCondition() {
    return isColliding(player, releaseGate);
}

function completeLevel() {
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    
    // Calculate level score
    const timeBonus = Math.floor(sprintTimeLeft / 1000);
    const levelScore = score + timeBonus;
    
    // Store level score
    levelScores[currentLevel - 1] = levelScore;
    totalScore = levelScores.reduce((sum, score) => sum + (score || 0), 0);
    
    // CRITICAL FIX: Unlock next level immediately when current level is completed
    if (currentLevel < gameConfig.totalLevels) {
        unlockLevel(currentLevel + 1);
    }
    
    // Update level complete screen
    const level = levelData[`level${currentLevel}`];
    ui.levelCompleteTitle.textContent = `${level.name} завершён!`;
    ui.levelBugCount.textContent = bugsCollected;
    ui.levelSpeedBonus.textContent = timeBonus;
    ui.levelScore.textContent = levelScore;
    
    // Show/hide next level button
    const nextBtn = document.getElementById('nextLevelBtn');
    if (currentLevel < gameConfig.totalLevels) {
        nextBtn.textContent = `Спринт ${currentLevel + 1}`;
        nextBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'none';
    }
    
    showScreen('levelCompleteScreen');
}

function endGame(allCompleted) {
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    
    // Calculate final score
    const timeBonus = allCompleted ? Math.floor(sprintTimeLeft / 1000) : 0;
    const finalScore = totalScore + timeBonus;
    
    // Update game over screen
    ui.gameOverTitle.textContent = allCompleted ? 'Все спринты завершены!' : 'Время вышло!';
    ui.finalBugCount.textContent = bugsCollected;
    ui.speedBonus.textContent = timeBonus;
    ui.totalScore.textContent = finalScore;
    
    // Determine rating
    let rating = 'Новичок';
    if (finalScore >= 100) rating = 'Легенда';
    else if (finalScore >= 80) rating = 'Эксперт';
    else if (finalScore >= 60) rating = 'Профессионал';
    else if (finalScore >= 40) rating = 'Опытный';
    else if (finalScore >= 20) rating = 'Стажёр';
    
    ui.performanceRating.textContent = rating;
    
    // Check for high score
    const leaderboard = getLeaderboard();
    if (leaderboard.length < 10 || finalScore > leaderboard[leaderboard.length - 1].score) {
        ui.newHighScore.classList.remove('hidden');
        ui.playerNameInput.value = '';
        ui.playerNameInput.focus();
    } else {
        ui.newHighScore.classList.add('hidden');
    }
    
    showScreen('gameOverScreen');
}

function unlockLevel(levelNum) {
    if (levelNum <= gameConfig.totalLevels) {
        const unlockedLevels = getUnlockedLevels();
        if (!unlockedLevels.includes(levelNum)) {
            unlockedLevels.push(levelNum);
            localStorage.setItem('bugHuntUnlockedLevels', JSON.stringify(unlockedLevels));
            // Update the display immediately
            updateLevelSelectDisplay();
            console.log(`Level ${levelNum} unlocked!`); // Debug log
        }
    }
}

function getUnlockedLevels() {
    const stored = localStorage.getItem('bugHuntUnlockedLevels');
    return stored ? JSON.parse(stored) : [1];
}

function updateLevelSelectDisplay() {
    const unlockedLevels = getUnlockedLevels();
    console.log('Unlocked levels:', unlockedLevels); // Debug log
    
    // Update level 2 status
    const level2Status = document.getElementById('level2Status');
    const level2Card = document.querySelector('[data-level="2"]');
    if (level2Card && level2Status) {
        if (unlockedLevels.includes(2)) {
            level2Status.textContent = 'Доступен';
            level2Status.className = 'level-status unlocked';
            level2Card.classList.remove('locked');
            level2Card.classList.add('unlocked');
        } else {
            level2Status.textContent = 'Заблокирован';
            level2Status.className = 'level-status locked';
            level2Card.classList.add('locked');
            level2Card.classList.remove('unlocked');
        }
    }
    
    // Update level 3 status
    const level3Status = document.getElementById('level3Status');
    const level3Card = document.querySelector('[data-level="3"]');
    if (level3Card && level3Status) {
        if (unlockedLevels.includes(3)) {
            level3Status.textContent = 'Доступен';
            level3Status.className = 'level-status unlocked';
            level3Card.classList.remove('locked');
            level3Card.classList.add('unlocked');
        } else {
            level3Status.textContent = 'Заблокирован';
            level3Status.className = 'level-status locked';
            level3Card.classList.add('locked');
            level3Card.classList.remove('unlocked');
        }
    }
}

function render() {
    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background pattern
    drawBackground();
    
    // Draw platforms
    drawPlatforms();
    
    // Draw bugs
    drawBugs();
    
    // Draw release gate
    drawReleaseGate();
    
    // Draw player
    drawPlayer();
    
    // Draw particles
    drawParticles();
    
    // Draw breaking platform effects
    drawBreakingPlatforms();
}

function drawBackground() {
    // Draw simple grid pattern
    ctx.strokeStyle = 'rgba(74, 74, 159, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawPlatforms() {
    platforms.forEach(platform => {
        if (platform.broken) return;
        
        ctx.fillStyle = platform.type === 'false' ? colors.falsePlatforms : colors.platforms;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add pattern for false platforms
        if (platform.type === 'false') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            for (let x = platform.x; x < platform.x + platform.width; x += 8) {
                for (let y = platform.y; y < platform.y + platform.height; y += 8) {
                    if ((x + y) % 16 === 0) {
                        ctx.fillRect(x, y, 4, 4);
                    }
                }
            }
        }
    });
}

function drawBugs() {
    bugs.forEach(bug => {
        if (bug.collected) return;
        
        const bugConfig = gameConfig.bugs.find(b => b.type === bug.type);
        ctx.fillStyle = bugConfig.color;
        
        let drawY = bug.y;
        if (bug.type === 'flying') {
            drawY += Math.sin(bug.floatOffset) * 5;
        }
        
        // Draw bug body
        ctx.fillRect(bug.x + 4, drawY + 6, 8, 6);
        
        // Draw wings/details
        if (bug.type === 'flying') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillRect(bug.x + 2, drawY + 4, 4, 8);
            ctx.fillRect(bug.x + 10, drawY + 4, 4, 8);
        }
        
        // Draw eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bug.x + 5, drawY + 6, 2, 2);
        ctx.fillRect(bug.x + 9, drawY + 6, 2, 2);
        
        // Draw antennae for critical bugs
        if (bug.type === 'critical') {
            ctx.strokeStyle = bugConfig.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bug.x + 6, drawY + 6);
            ctx.lineTo(bug.x + 4, drawY + 2);
            ctx.moveTo(bug.x + 10, drawY + 6);
            ctx.lineTo(bug.x + 12, drawY + 2);
            ctx.stroke();
        }
    });
}

function drawReleaseGate() {
    // Draw gate frame
    ctx.fillStyle = colors.gate;
    ctx.fillRect(releaseGate.x, releaseGate.y, releaseGate.width, releaseGate.height);
    
    // Draw door pattern
    ctx.fillStyle = '#004422';
    ctx.fillRect(releaseGate.x + 5, releaseGate.y + 5, releaseGate.width - 10, releaseGate.height - 10);
    
    // Draw "DEPLOY" text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DEPLOY', releaseGate.x + releaseGate.width / 2, releaseGate.y - 10);
    
    // Draw handle
    ctx.fillStyle = colors.gate;
    ctx.fillRect(releaseGate.x + releaseGate.width - 8, releaseGate.y + 20, 4, 8);
}

function drawPlayer() {
    // Draw player body
    ctx.fillStyle = colors.player;
    ctx.fillRect(player.x + 6, player.y + 8, 20, 20);
    
    // Draw head
    ctx.fillStyle = '#ffcc88';
    ctx.fillRect(player.x + 8, player.y, 16, 16);
    
    // Draw mustache
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(player.x + 10, player.y + 10, 8, 3);
    
    // Draw laptop
    ctx.fillStyle = '#333333';
    ctx.fillRect(player.x + 2, player.y + 12, 12, 8);
    ctx.fillStyle = '#666666';
    ctx.fillRect(player.x + 3, player.y + 13, 10, 6);
    
    // Draw legs (simple animation)
    ctx.fillStyle = '#4444AA';
    if (Math.abs(player.velocityX) > 1) {
        const legOffset = Math.sin(player.animFrame) * 2;
        ctx.fillRect(player.x + 8, player.y + 28, 4, 4);
        ctx.fillRect(player.x + 16 + legOffset, player.y + 28, 4, 4);
    } else {
        ctx.fillRect(player.x + 8, player.y + 28, 4, 4);
        ctx.fillRect(player.x + 16, player.y + 28, 4, 4);
    }
}

function drawParticles() {
    particles.forEach(particle => {
        const alpha = particle.life / 1000;
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(particle.x, particle.y, 2, 2);
        ctx.globalAlpha = 1;
    });
}

function drawBreakingPlatforms() {
    breakingPlatforms.forEach(platform => {
        const alpha = platform.timer / 500;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = colors.falsePlatforms;
        
        // Add shake effect
        const shakeX = (Math.random() - 0.5) * 4;
        const shakeY = (Math.random() - 0.5) * 4;
        
        ctx.fillRect(platform.x + shakeX, platform.y + shakeY, platform.width, platform.height);
        ctx.globalAlpha = 1;
    });
}

function updateUI() {
    ui.bugCount.textContent = bugsCollected;
    
    const minutes = Math.floor(sprintTimeLeft / 60000);
    const seconds = Math.floor((sprintTimeLeft % 60000) / 1000);
    ui.timeRemaining.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        screens.pauseOverlay.classList.remove('hidden');
        if (gameLoop) {
            cancelAnimationFrame(gameLoop);
        }
    } else if (gameState === 'paused') {
        gameState = 'playing';
        screens.pauseOverlay.classList.add('hidden');
        gameLoop = requestAnimationFrame(update);
    }
}

function quitToMenu() {
    gameState = 'menu';
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    showScreen('mainMenu');
    
    // Reset game state
    totalScore = 0;
    levelScores = [];
    currentLevel = 1;
}

// Leaderboard functions
function getLeaderboard() {
    const stored = localStorage.getItem('bugHuntLeaderboard');
    return stored ? JSON.parse(stored) : [];
}

function saveLeaderboard(leaderboard) {
    localStorage.setItem('bugHuntLeaderboard', JSON.stringify(leaderboard));
}

function loadLeaderboard() {
    updateLeaderboardDisplay();
}

function saveScore() {
    const name = ui.playerNameInput.value.trim() || 'Аноним';
    const finalScore = parseInt(ui.totalScore.textContent);
    
    const leaderboard = getLeaderboard();
    leaderboard.push({
        name: name,
        score: finalScore,
        levels: currentLevel,
        date: new Date().toLocaleDateString('ru-RU')
    });
    
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(10); // Keep only top 10
    
    saveLeaderboard(leaderboard);
    updateLeaderboardDisplay();
    
    ui.newHighScore.classList.add('hidden');
}

function updateLeaderboardDisplay() {
    const leaderboard = getLeaderboard();
    const listElement = ui.leaderboardList;
    
    if (leaderboard.length === 0) {
        listElement.innerHTML = '<div class="empty-leaderboard">Пока нет результатов</div>';
        return;
    }
    
    listElement.innerHTML = leaderboard.map((entry, index) => `
        <div class="leaderboard-entry ${index < 3 ? 'top-3' : ''}">
            <span class="leaderboard-rank">${index + 1}.</span>
            <span class="leaderboard-name">${entry.name}</span>
            <span class="leaderboard-score">${entry.score}</span>
        </div>
    `).join('');
}

function clearLeaderboard() {
    if (confirm('Вы уверены, что хотите очистить таблицу лидеров?')) {
        localStorage.removeItem('bugHuntLeaderboard');
        updateLeaderboardDisplay();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', init);
