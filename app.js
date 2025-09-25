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

const mobileConfig = {
    controlSize: 80,
    controlOpacity: 0.7,
    controlMargin: 20,
    minScreenWidth: 320,
    maxCanvasScale: 0.9
};

const colors = {
    background: "#1a0033",
    platforms: "#4a4a9f",
    falsePlatforms: "#9f4a4a",
    player: "#ffd700",
    uiText: "#ffffff",
    gate: "#00ff88",
    controls: "#4a4a9f",
    controlsPressed: "#6a6abf"
};

// Level Data
const levels = {
    1: {
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
    2: {
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
    3: {
        name: "Спринт 3: Production Hotfix",
        difficulty: "Продвинутый",
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
let lastTime = 0;
let sprintTimeLeft = gameConfig.sprintDuration;
let score = 0;
let bugsCollected = 0;
let currentLevel = 1;
let gameLoop;
let keys = {};
let isMobile = false;
let touchControls = {};

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

// DOM Elements
let screens = {};
let ui = {};
let mobileControlsElement;

// Mobile touch state
let touchState = {
    left: false,
    right: false,
    jump: false
};

// Initialize game
function init() {
    // Detect mobile device
    detectMobile();
    
    // Get DOM elements
    screens.mainMenu = document.getElementById('mainMenu');
    screens.gameScreen = document.getElementById('gameScreen');
    screens.gameOverScreen = document.getElementById('gameOverScreen');
    screens.leaderboardScreen = document.getElementById('leaderboardScreen');
    screens.instructionsModal = document.getElementById('instructionsModal');
    screens.pauseOverlay = document.getElementById('pauseOverlay');

    ui.bugCount = document.getElementById('bugCount');
    ui.timeRemaining = document.getElementById('timeRemaining');
    ui.levelDisplay = document.getElementById('levelDisplay');
    ui.finalBugCount = document.getElementById('finalBugCount');
    ui.speedBonus = document.getElementById('speedBonus');
    ui.totalScore = document.getElementById('totalScore');
    ui.performanceRating = document.getElementById('performanceRating');
    ui.newHighScore = document.getElementById('newHighScore');
    ui.playerNameInput = document.getElementById('playerNameInput');
    ui.leaderboardList = document.getElementById('leaderboardList');
    ui.gameOverTitle = document.getElementById('gameOverTitle');

    mobileControlsElement = document.getElementById('mobileControls');

    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Set up event listeners
    setupEventListeners();
    
    // Setup mobile controls if needed
    setupMobileControls();
    
    // Initialize canvas size
    resizeCanvas();
    
    // Initialize leaderboard
    loadLeaderboard();
    updateLeaderboardDisplay();
    
    // Show main menu
    showScreen('mainMenu');
    
    console.log('Game initialized. Mobile:', isMobile);
}

function detectMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    isMobile = isTouchDevice || isSmallScreen || 
               /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    console.log('Mobile detection:', {
        isTouchDevice,
        isSmallScreen,
        userAgent: userAgent.includes('mobile') || userAgent.includes('android'),
        finalIsMobile: isMobile
    });
    
    if (isMobile) {
        document.body.classList.add('mobile-device');
    }
}

function setupEventListeners() {
    // Menu buttons
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    document.getElementById('leaderboardBtn').addEventListener('click', () => showScreen('leaderboard'));
    document.getElementById('instructionsBtn').addEventListener('click', () => showModal('instructions'));
    document.getElementById('closeInstructionsBtn').addEventListener('click', () => hideModal('instructions'));

    // Game over buttons
    document.getElementById('saveScoreBtn').addEventListener('click', saveScore);
    document.getElementById('playAgainBtn').addEventListener('click', restartGame);
    document.getElementById('backToMenuBtn').addEventListener('click', () => showScreen('mainMenu'));

    // Leaderboard buttons
    document.getElementById('backFromLeaderboardBtn').addEventListener('click', () => showScreen('mainMenu'));
    document.getElementById('clearScoresBtn').addEventListener('click', clearLeaderboard);

    // Pause buttons
    const pauseBtn = document.getElementById('pauseBtn');
    const mobilePauseBtn = document.getElementById('mobilePauseBtn');
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
    if (mobilePauseBtn) mobilePauseBtn.addEventListener('click', togglePause);
    document.getElementById('resumeBtn').addEventListener('click', togglePause);
    document.getElementById('quitBtn').addEventListener('click', quitToMenu);

    // Keyboard controls - always set up for testing
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Window resize
    window.addEventListener('resize', () => {
        detectMobile();
        resizeCanvas();
        setupMobileControls();
    });
    
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            detectMobile();
            resizeCanvas();
            setupMobileControls();
        }, 100);
    });

    // Prevent default for game keys
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.key) || 
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
            e.preventDefault();
        }
    });

    // Prevent scroll and zoom on mobile
    if (isMobile) {
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.mobile-controls') || e.target.closest('#gameCanvas')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.mobile-controls')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

function setupMobileControls() {
    if (!mobileControlsElement) return;
    
    // Always show mobile controls on mobile devices or small screens
    if (isMobile || window.innerWidth <= 768) {
        mobileControlsElement.classList.remove('hidden');
        
        // Setup touch events for each control
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const jumpBtn = document.getElementById('jumpBtn');
        
        if (leftBtn) setupTouchControl(leftBtn, 'left');
        if (rightBtn) setupTouchControl(rightBtn, 'right');
        if (jumpBtn) setupTouchControl(jumpBtn, 'jump');
        
        console.log('Mobile controls set up');
    } else {
        mobileControlsElement.classList.add('hidden');
    }
}

function setupTouchControl(element, action) {
    if (!element) return;
    
    // Remove existing listeners
    element.ontouchstart = null;
    element.ontouchend = null;
    element.ontouchcancel = null;
    element.onmousedown = null;
    element.onmouseup = null;
    element.onmouseleave = null;
    
    const startTouch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        touchState[action] = true;
        element.classList.add('pressed');
        
        // Add haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        console.log(`${action} control activated`);
    };
    
    const endTouch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        touchState[action] = false;
        element.classList.remove('pressed');
        
        console.log(`${action} control deactivated`);
    };
    
    // Touch events
    element.addEventListener('touchstart', startTouch, { passive: false });
    element.addEventListener('touchend', endTouch, { passive: false });
    element.addEventListener('touchcancel', endTouch, { passive: false });
    
    // Mouse events for testing on desktop
    element.addEventListener('mousedown', startTouch);
    element.addEventListener('mouseup', endTouch);
    element.addEventListener('mouseleave', endTouch);
    
    // Prevent context menu
    element.addEventListener('contextmenu', (e) => e.preventDefault());
}

function resizeCanvas() {
    if (!canvas) return;
    
    if (isMobile || window.innerWidth <= 768) {
        // Mobile scaling
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const aspectRatio = gameConfig.canvasWidth / gameConfig.canvasHeight;
        
        let canvasWidth = viewportWidth - 4;
        let canvasHeight = (viewportWidth - 4) / aspectRatio;
        
        const maxHeight = viewportHeight - 60 - 40;
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * aspectRatio;
        }
        
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
    } else {
        // Desktop - maintain original size
        canvas.style.width = gameConfig.canvasWidth + 'px';
        canvas.style.height = gameConfig.canvasHeight + 'px';
    }
}

function handleKeyDown(e) {
    keys[e.code] = true;
    
    // Handle pause
    if (e.code === 'Escape' && gameState === 'playing') {
        togglePause();
    }
    
    console.log('Key down:', e.code);
}

function handleKeyUp(e) {
    keys[e.code] = false;
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
    
    gameState = screenName === 'gameScreen' ? 'playing' : screenName;
    
    // Handle mobile controls visibility
    if (mobileControlsElement) {
        if (screenName === 'gameScreen' && (isMobile || window.innerWidth <= 768)) {
            mobileControlsElement.classList.remove('hidden');
        } else {
            mobileControlsElement.classList.add('hidden');
        }
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

function startGame() {
    currentLevel = 1;
    score = 0;
    bugsCollected = 0;
    resetGame();
    showScreen('gameScreen');
    gameState = 'playing';
    lastTime = performance.now();
    gameLoop = requestAnimationFrame(update);
}

function restartGame() {
    // Reset everything and start from level 1
    currentLevel = 1;
    score = 0;
    bugsCollected = 0;
    resetGame();
    showScreen('gameScreen');
    gameState = 'playing';
    lastTime = performance.now();
    gameLoop = requestAnimationFrame(update);
}

function resetGame() {
    const levelData = levels[currentLevel];
    
    // Reset player
    player.x = levelData.playerStart.x;
    player.y = levelData.playerStart.y;
    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround = false;
    
    // Reset timer
    sprintTimeLeft = gameConfig.sprintDuration;
    
    // Load level data
    platforms = levelData.platforms.map(p => ({...p, broken: false, breaking: false}));
    bugs = levelData.bugs.map(b => ({
        ...b,
        collected: false,
        animFrame: 0,
        floatOffset: Math.random() * Math.PI * 2
    }));
    releaseGate = {...levelData.releaseGate};
    
    // Reset effects
    breakingPlatforms = [];
    particles = [];
    
    // Reset touch state
    touchState = { left: false, right: false, jump: false };
    
    updateUI();
    updateLevelDisplay();
    
    console.log(`Level ${currentLevel} reset. Bugs count:`, bugs.length);
}

function updateLevelDisplay() {
    const levelData = levels[currentLevel];
    if (ui.levelDisplay) {
        ui.levelDisplay.textContent = `Спринт ${currentLevel}`;
    }
}

function update(timestamp) {
    if (gameState !== 'playing') {
        gameLoop = requestAnimationFrame(update);
        return;
    }
    
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
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
    
    // Check win condition
    if (checkWinCondition()) {
        if (currentLevel < gameConfig.totalLevels) {
            advanceToNextLevel();
        } else {
            endGame(true);
        }
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
    // Handle input (keyboard or touch)
    const leftPressed = keys['KeyA'] || keys['ArrowLeft'] || touchState.left;
    const rightPressed = keys['KeyD'] || keys['ArrowRight'] || touchState.right;
    const jumpPressed = keys['KeyW'] || keys['ArrowUp'] || keys['Space'] || touchState.jump;
    
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
    if (player.x > gameConfig.canvasWidth - player.width) player.x = gameConfig.canvasWidth - player.width;
    
    // Check if player fell off the screen
    if (player.y > gameConfig.canvasHeight + 100) {
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
        particle.velocityY += 0.2;
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
            // Check if landing on top
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
                
                // Handle false platforms
                if (platform.type === 'false') {
                    breakPlatform(platform, index);
                }
            }
            // Side collisions
            else if (player.x + player.width > platform.x && player.x < platform.x + platform.width) {
                if (player.x < platform.x) {
                    player.x = platform.x - player.width;
                } else {
                    player.x = platform.x + platform.width;
                }
                player.velocityX = 0;
            }
        }
    });
    
    // Bug collisions
    bugs.forEach((bug, index) => {
        if (bug.collected) return;
        
        const bugHitbox = {
            x: bug.x, 
            y: bug.type === 'flying' ? bug.y + Math.sin(bug.floatOffset) * 5 : bug.y, 
            width: 16, 
            height: 16
        };
        
        if (isColliding(player, bugHitbox)) {
            collectBug(bug, index);
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
    if (platform.breaking) return;
    
    platform.breaking = true;
    
    breakingPlatforms.push({
        ...platform,
        timer: 500
    });
    
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

function collectBug(bug, index) {
    if (bug.collected) return;
    
    bug.collected = true;
    bugsCollected++;
    
    const bugConfig = gameConfig.bugs.find(b => b.type === bug.type);
    score += bugConfig.points;
    
    console.log(`Bug collected! Total: ${bugsCollected}, Score: ${score}`);
    
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
    
    // Haptic feedback on mobile
    if (isMobile && navigator.vibrate) {
        navigator.vibrate(100);
    }
}

function advanceToNextLevel() {
    currentLevel++;
    
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    
    setTimeout(() => {
        resetGame();
        lastTime = performance.now();
        gameLoop = requestAnimationFrame(update);
    }, 1000);
}

function checkWinCondition() {
    return isColliding(player, releaseGate);
}

function endGame(victory) {
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    
    gameState = 'gameOver';
    
    // Calculate final score
    const timeBonus = victory ? Math.floor(sprintTimeLeft / 1000) : 0;
    const levelBonus = victory ? (currentLevel * 10) : 0;
    const finalScore = score + timeBonus + levelBonus;
    
    // Update game over screen
    const levelComplete = victory && currentLevel === gameConfig.totalLevels;
    ui.gameOverTitle.textContent = levelComplete ? 'Все спринты пройдены!' : 
                                    victory ? `Спринт ${currentLevel} завершён!` : 'Время вышло!';
    
    ui.finalBugCount.textContent = bugsCollected;
    ui.speedBonus.textContent = timeBonus + levelBonus;
    ui.totalScore.textContent = finalScore;
    
    // Determine rating
    let rating = 'Новичок';
    if (finalScore >= 100) rating = 'Эксперт';
    else if (finalScore >= 70) rating = 'Профессионал';
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

function render() {
    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, gameConfig.canvasWidth, gameConfig.canvasHeight);
    
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
    ctx.strokeStyle = 'rgba(74, 74, 159, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < gameConfig.canvasWidth; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gameConfig.canvasHeight);
        ctx.stroke();
    }
    
    for (let y = 0; y < gameConfig.canvasHeight; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gameConfig.canvasWidth, y);
        ctx.stroke();
    }
}

function drawPlatforms() {
    platforms.forEach(platform => {
        if (platform.broken) return;
        
        ctx.fillStyle = platform.type === 'false' ? colors.falsePlatforms : colors.platforms;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        
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
        
        // Draw wings for flying bugs
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
    ctx.fillStyle = colors.gate;
    ctx.fillRect(releaseGate.x, releaseGate.y, releaseGate.width, releaseGate.height);
    
    ctx.fillStyle = '#004422';
    ctx.fillRect(releaseGate.x + 5, releaseGate.y + 5, releaseGate.width - 10, releaseGate.height - 10);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DEPLOY', releaseGate.x + releaseGate.width / 2, releaseGate.y - 10);
    
    ctx.fillStyle = colors.gate;
    ctx.fillRect(releaseGate.x + releaseGate.width - 8, releaseGate.y + 20, 4, 8);
}

function drawPlayer() {
    ctx.fillStyle = colors.player;
    ctx.fillRect(player.x + 6, player.y + 8, 20, 20);
    
    ctx.fillStyle = '#ffcc88';
    ctx.fillRect(player.x + 8, player.y, 16, 16);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(player.x + 10, player.y + 10, 8, 3);
    
    ctx.fillStyle = '#333333';
    ctx.fillRect(player.x + 2, player.y + 12, 12, 8);
    ctx.fillStyle = '#666666';
    ctx.fillRect(player.x + 3, player.y + 13, 10, 6);
    
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
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 2, 2);
    });
    ctx.globalAlpha = 1;
}

function drawBreakingPlatforms() {
    breakingPlatforms.forEach(platform => {
        const alpha = platform.timer / 500;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = colors.falsePlatforms;
        
        const shakeX = (Math.random() - 0.5) * 4;
        const shakeY = (Math.random() - 0.5) * 4;
        
        ctx.fillRect(platform.x + shakeX, platform.y + shakeY, platform.width, platform.height);
    });
    ctx.globalAlpha = 1;
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
        lastTime = performance.now();
        gameLoop = requestAnimationFrame(update);
    }
}

function quitToMenu() {
    gameState = 'menu';
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    showScreen('mainMenu');
}

// Leaderboard functions
function getLeaderboard() {
    try {
        const stored = localStorage.getItem('bugHuntLeaderboard');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function saveLeaderboard(leaderboard) {
    try {
        localStorage.setItem('bugHuntLeaderboard', JSON.stringify(leaderboard));
    } catch (e) {
        console.error('Could not save leaderboard');
    }
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
        bugs: bugsCollected,
        level: currentLevel,
        date: new Date().toLocaleDateString('ru-RU')
    });
    
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(10);
    
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
        try {
            localStorage.removeItem('bugHuntLeaderboard');
            updateLeaderboardDisplay();
        } catch (e) {
            console.error('Could not clear leaderboard');
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', init);
