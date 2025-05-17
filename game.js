// ADHD Simulator Game Logic - Enhanced Version
document.addEventListener('DOMContentLoaded', function() {
    // Debug logging
    const DEBUG = true;
    function debug(message, data) {
        if (DEBUG) {
            if (data) {
                console.log(`[DEBUG] ${message}`, data);
            } else {
                console.log(`[DEBUG] ${message}`);
            }
        }
    }

    // DOM Elements
    let startButton = document.getElementById('start-button');
    const introScreen = document.getElementById('intro-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const workButton = document.getElementById('work-button');
    const distractionButton = document.getElementById('distraction-button');
    const monsterButton = document.getElementById('monster-button');
    const eventPopup = document.getElementById('event-popup');
    const eventButton = document.getElementById('event-button');
    const restartButton = document.getElementById('restart-button');
    const emailText = document.getElementById('email-text');
    const gameLog = document.getElementById('game-log');
    const cursor = document.getElementById('cursor');
    debug("Cursor element found: " + (cursor !== null));
    const moodIndicator = document.getElementById('mood-indicator');
    const monsterCooldown = document.getElementById('monster-cooldown');
    
    // Game state
    const gameState = {
        emailProgress: 0,
        timeSpent: 0,
        maxTime: 30,
        overwhelm: 0,
        focusStreak: 0,
        xp: 0,
        monsterActive: false,
        monsterEffectTurns: 0,
        monsterUsesRemaining: 3,
        distractionCount: 0,
        actionHistory: [],
        gameOver: false,
        usedDistractions: new Set(),
        achievements: {}
    };
    
    // Email content that will progressively be revealed
    gameState.emailText = `Hi Boss,

I wanted to provide an update on the project we discussed last week.

We've made significant progress on the key deliverables and are on track to meet our deadlines. The team has been working hard to address the challenges we identified earlier.

I'll have a detailed report ready by Friday with all the metrics you requested.

Let me know if you need any specific information before then.

Best regards,
Your Name`;
    
    // Random events
    gameState.events = [
        {
            title: "Phone Call Interruption!",
            message: "Your phone rings with an unknown number. You answered it anyway because... what if it's important?",
            effect: function() {
                gameState.timeSpent += 3;
                gameState.overwhelm += 1;
                return "Lost 3 minutes and gained +1 overwhelm.";
            }
        },
        {
            title: "Colleague stops by!",
            message: "A coworker just had to tell you about their weekend right now.",
            effect: function() {
                gameState.timeSpent += 2;
                return "Lost 2 minutes of precious time.";
            }
        },
        {
            title: "Brain Boost!",
            message: "Something clicks and your brain is suddenly firing on all cylinders!",
            effect: function() {
                gameState.emailProgress += 15;
                return "Gained +15% email progress!";
            }
        },
        {
            title: "Hunger Strike!",
            message: "Your stomach growls loudly. Maybe a quick snack would help concentration?",
            effect: function() {
                gameState.timeSpent += 4;
                gameState.overwhelm -= 1;
                return "Lost 4 minutes but reduced overwhelm by 1.";
            }
        },
        {
            title: "Perfect Song!",
            message: "You just remembered that perfect song that would help you focus!",
            effect: function() {
                gameState.focusStreak += 1;
                return "Gained +1 to focus streak!";
            }
        }
    ];
    
    // Distractions
    gameState.distractions = [
        "You checked your phone for 'important' notifications.",
        "Suddenly remembered you need to organize your digital photos.",
        "Started researching the perfect vacation spot for next year.",
        "Spent time color-coding your calendar events.",
        "Fell into a Wikipedia rabbit hole about ancient Mesopotamia.",
        "Reorganized your desk drawer for 'better productivity'.",
        "Spent time finding the perfect playlist to work to.",
        "Got distracted watching dog videos on social media.",
        "Started researching a new hobby you 'might' take up.",
        "Remembered you need to check on that package delivery."
    ];
    
    // Add Lightning animation for Monster Energy
    function addLightningStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes lightning-effect {
                0%, 100% {
                    filter: brightness(1);
                    transform: scale(1);
                }
                5%, 25%, 45%, 65%, 85% {
                    filter: brightness(1.5) hue-rotate(60deg);
                    transform: scale(1.03);
                    box-shadow: 0 0 15px var(--monster-color), 0 0 30px var(--monster-color);
                }
                15%, 35%, 55%, 75%, 95% {
                    filter: brightness(1.2) hue-rotate(30deg);
                    transform: scale(1);
                    box-shadow: 0 0 5px var(--monster-color);
                }
            }
            
            .lightning-active {
                animation: lightning-effect 1s ease-in-out;
                position: relative;
            }
            
            .lightning-active::before {
                content: '';
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 3px;
                height: 15px;
                background-color: var(--monster-color);
                box-shadow: 0 0 10px var(--monster-color), 0 0 20px var(--monster-color);
                clip-path: polygon(0 0, 100% 0, 50% 100%);
                z-index: 10;
                animation: lightningBolt 0.5s ease-in-out;
            }
            
            @keyframes lightningBolt {
                0%, 100% { opacity: 0; height: 0; }
                50% { opacity: 1; height: 15px; }
            }
            
            /* Monster Rage Mode Screen Shake */
            @keyframes monster-rage-shake {
                0%, 100% { transform: translate(0, 0) rotate(0); }
                10% { transform: translate(-2px, -1px) rotate(-0.5deg); }
                20% { transform: translate(2px, 1px) rotate(0.5deg); }
                30% { transform: translate(-2px, 0px) rotate(0.5deg); }
                40% { transform: translate(1px, -1px) rotate(0.5deg); }
                50% { transform: translate(-1px, 1px) rotate(-0.5deg); }
                60% { transform: translate(1px, 1px) rotate(0); }
                70% { transform: translate(-1px, -1px) rotate(-0.5deg); }
                80% { transform: translate(2px, 1px) rotate(0.5deg); }
                90% { transform: translate(-2px, 0px) rotate(-0.5deg); }
            }
            
            .shake-effect {
                animation: monster-rage-shake 0.5s infinite;
            }
            
            /* Rage Pulse Animation */
            @keyframes rage-pulse {
                0% { transform: scale(0); opacity: 0.8; }
                100% { transform: scale(4); opacity: 0; }
            }
            
            .rage-pulse {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, var(--monster-color) 0%, transparent 70%);
                border-radius: 50%;
                z-index: 998;
                animation: rage-pulse 0.8s ease-out;
                pointer-events: none;
            }
            
            .monster-active {
                animation: monster-rage-shake 0.5s infinite;
                filter: saturate(1.2) brightness(1.05);
            }
            
            .monster-active #game-screen {
                position: relative;
            }
            
            .monster-active #game-screen::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 3px solid var(--monster-color);
                box-shadow: 0 0 15px var(--monster-color);
                pointer-events: none;
                z-index: 999;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Call this function to add the styles
    addLightningStyles();
    
    // Add overwhelm animation styles
    function addOverwhelmStyles() {
        const style = document.createElement('style');
        style.id = 'overwhelm-styles';
        style.textContent = `
            @keyframes overwhelm-pulse {
                0%, 100% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.05); filter: brightness(1.3) hue-rotate(-20deg); }
            }
            
            @keyframes overwhelm-shake {
                0%, 100% { transform: translate(0, 0) rotate(0); }
                10% { transform: translate(-1px, 1px) rotate(-1deg); }
                20% { transform: translate(1px, 0px) rotate(1deg); }
                30% { transform: translate(0px, 1px) rotate(0); }
                40% { transform: translate(1px, -1px) rotate(1deg); }
                50% { transform: translate(-1px, 0px) rotate(-1deg); }
                60% { transform: translate(0px, 1px) rotate(0); }
                70% { transform: translate(-1px, 0px) rotate(-1deg); }
                80% { transform: translate(1px, 1px) rotate(1deg); }
                90% { transform: translate(0px, -1px) rotate(0); }
            }
            
            .high-overwhelm {
                animation: overwhelm-pulse 0.8s infinite ease-in-out;
            }
            
            .critical-overwhelm {
                animation: overwhelm-pulse 0.5s infinite ease-in-out, overwhelm-shake 0.3s infinite;
            }
            
            .overwhelm-danger {
                color: #ff3333 !important;
                text-shadow: 0 0 5px rgba(255, 0, 0, 0.7);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add overwhelm styles when document is loaded
    addOverwhelmStyles();
    
    // Make start screen more interactive and ADHD-like
    function setupInteractiveIntro() {
        // Replace the static rules with interactive elements
        const introContent = document.querySelector('.intro-content');
        if (!introContent) return;
        
        introContent.innerHTML = `
            <p class="intro-text">You have 30 minutes to write a simple email.</p>
            <p class="intro-text">But with ADHD, even the simplest tasks can be... <span id="flicker-text">challenging.</span></p>
            
            <div class="demo-area">
                <p class="demo-instruction">Click "FOCUS" to write the email:</p>
                <button id="demo-focus" class="demo-button">FOCUS</button>
                <div id="demo-result"></div>
            </div>
            
            <div class="intro-features">
                <div class="feature-item">
                    <i class="fas fa-keyboard"></i>
                    <span>Try to WORK on your email</span>
                    <small>(but success isn't guaranteed...)</small>
                </div>
                <div class="feature-item">
                    <i class="fas fa-random"></i>
                    <span>Take intentional BREAKS</span>
                    <small>(to reduce overwhelm)</small>
                </div>
                <div class="feature-item">
                    <i class="fas fa-bolt"></i>
                    <span>Use your one MONSTER energy</span>
                    <small>(for temporary super-focus)</small>
                </div>
            </div>
            
            <button id="start-button" class="action-button pulse-animation">I'LL TRY MY BEST... WAIT, WHAT?</button>
        `;
        
        // Add special styles for intro
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            .intro-text {
                font-size: 1.3rem;
                margin-bottom: 1rem;
            }
            
            #flicker-text {
                display: inline-block;
                animation: text-flicker 5s infinite;
                color: var(--primary-color);
                font-weight: bold;
            }
            
            @keyframes text-flicker {
                0%, 100% { opacity: 1; }
                25% { opacity: 0.5; }
                50% { opacity: 0.7; }
                75% { opacity: 0.3; }
            }
            
            .demo-area {
                background: rgba(0,0,0,0.05);
                border-radius: 10px;
                padding: 1rem;
                margin: 1.5rem 0;
                text-align: center;
            }
            
            .demo-instruction {
                font-weight: 600;
            }
            
            .demo-button {
                background: var(--secondary-color);
                color: white;
                border: none;
                border-radius: 30px;
                padding: 0.7rem 2rem;
                font-weight: 600;
                margin: 1rem 0;
                cursor: pointer;
            }
            
            #demo-result {
                min-height: 40px;
                font-style: italic;
                margin-top: 0.5rem;
            }
            
            .intro-features {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                justify-content: center;
                margin: 2rem 0;
            }
            
            .feature-item {
                background: white;
                border-radius: 8px;
                padding: 1rem;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                width: 200px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .feature-item i {
                font-size: 2rem;
                margin-bottom: 0.5rem;
                color: var(--primary-color);
            }
            
            .feature-item small {
                color: #666;
                margin-top: 0.5rem;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            .float {
                animation: float 3s ease-in-out infinite;
            }
        `;
        document.head.appendChild(styleEl);
        
        // Demo button functionality
        const demoButton = document.getElementById('demo-focus');
        const demoResult = document.getElementById('demo-result');
        
        if (demoButton && demoResult) {
            demoButton.addEventListener('click', function() {
                // Randomly show success or failure to demonstrate the ADHD experience
                const outcomes = [
                    { success: true, message: "You wrote a few sentences. Progress!" },
                    { success: false, message: "You got distracted by a notification." },
                    { success: false, message: "Wait, what were you supposed to be doing?" },
                    { success: true, message: "Nice focus! The email is coming along." },
                    { success: false, message: "You spent 5 minutes organizing your desktop instead." }
                ];
                
                const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
                demoResult.textContent = outcome.message;
                demoResult.style.color = outcome.success ? 'green' : 'red';
                
                if (!outcome.success) {
                    demoButton.classList.add('shake-animation');
                    setTimeout(() => demoButton.classList.remove('shake-animation'), 500);
                }
            });
        }
        
        // Update the start button reference and attach event listener to the new button
        startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', function() {
                console.log("Start button clicked!"); // Debug
                introScreen.classList.add('hidden');
                gameScreen.classList.remove('hidden');
                startGame();
            });
        }
        
        // Add achievement icons to the mini-achievements area if it exists
        const miniAchievements = document.getElementById('mini-achievements');
        if (miniAchievements) {
            // Make sure all achievement icons have proper attributes
            const achievementIcons = miniAchievements.querySelectorAll('.achievement-icon');
            achievementIcons.forEach(icon => {
                // Add proper data attributes for achievement tracking
                if (icon.title && !icon.hasAttribute('data-title')) {
                    icon.setAttribute('data-title', icon.title);
                }
                // Make sure it has locked class if it's not already unlocked
                if (!icon.classList.contains('unlocked-achievement')) {
                    icon.classList.add('locked-achievement');
                }
            });
        }
    }
    
    // Set up interactive intro
    setupInteractiveIntro();
    
    // Game functions
    function startGame() {
        console.log("Game starting!"); // Debug
        // Reset game state
        gameState.emailProgress = 0;
        gameState.timeSpent = 0;
        gameState.overwhelm = 0;
        gameState.focusStreak = 0;
        gameState.xp = 0;
        gameState.monsterActive = false;
        gameState.monsterEffectTurns = 0;
        gameState.monsterUsesRemaining = 3;
        gameState.distractionCount = 0;
        gameState.actionHistory = [];
        gameState.gameOver = false;
        gameState.usedDistractions.clear();
        gameState.achievements = {}; // Track unlocked achievements
        
        // Reset mini achievements for next session
        resetAchievementVisuals();
        
        // Apply achievement styles
        setupAchievementStyles();
        
        // Clear the game log for a fresh session
        gameLog.innerHTML = '';
        
        // Also clear email text for a fresh start
        emailText.innerHTML = '';
        
        // Ensure the maxTime is properly set
        if (!gameState.maxTime || gameState.maxTime <= 0) {
            gameState.maxTime = 30; // Default to 30 minutes
        }
        
        // Clear any remaining timers from previous games
        if (window.timeCheckInterval) {
            clearInterval(window.timeCheckInterval);
        }
        
        // CRITICAL FIX: Set up a timer to constantly check the time limit
        window.timeCheckInterval = setInterval(function() {
            if (!gameState.gameOver && gameState.timeSpent >= gameState.maxTime) {
                console.log("Time's up - ending game from interval check");
                endGame('timeout');
            }
        }, 1000); // Check every second
        
        // Update UI
        updateUI();
        
        // Log game start
        addLogEntry("Game started! Time to write that email...", "event");
    }
    
    function updateUI() {
        // Update progress bars
        document.getElementById('email-progress-bar').style.width = `${gameState.emailProgress}%`;
        document.getElementById('time-progress-bar').style.width = `${(gameState.timeSpent / gameState.maxTime) * 100}%`;
        document.getElementById('overwhelm-progress-bar').style.width = `${(gameState.overwhelm / 10) * 100}%`;
        
        // Update values
        document.getElementById('progress-value').textContent = `${Math.min(100, Math.floor(gameState.emailProgress))}%`;
        document.getElementById('time-value').textContent = `${gameState.maxTime - gameState.timeSpent} min`;
        
        // Update overwhelm display and animations
        const overwhelmValue = document.getElementById('overwhelm-value');
        const overwhelmBar = document.getElementById('overwhelm-progress-bar');
        
        overwhelmValue.textContent = `${gameState.overwhelm}/10`;
        
        // Apply overwhelm animations based on level
        if (gameState.overwhelm >= 8) {
            overwhelmValue.classList.add('overwhelm-danger');
            overwhelmBar.classList.add('critical-overwhelm');
            overwhelmBar.classList.remove('high-overwhelm');
            document.getElementById('overwhelm-label').classList.add('overwhelm-danger');
        } else if (gameState.overwhelm >= 6) {
            overwhelmValue.classList.add('overwhelm-danger');
            overwhelmBar.classList.add('high-overwhelm');
            overwhelmBar.classList.remove('critical-overwhelm');
            document.getElementById('overwhelm-label').classList.add('overwhelm-danger');
        } else {
            overwhelmValue.classList.remove('overwhelm-danger');
            overwhelmBar.classList.remove('high-overwhelm', 'critical-overwhelm');
            document.getElementById('overwhelm-label').classList.remove('overwhelm-danger');
        }
        
        // Rest of updateUI function
        document.getElementById('focus-streak').textContent = gameState.focusStreak;
        document.getElementById('focus-meter').style.width = `${Math.min(100, gameState.focusStreak * 10)}%`;
        document.getElementById('xp-earned').textContent = gameState.xp;
        document.getElementById('xp-meter').style.width = `${Math.min(100, gameState.xp)}%`;
        document.getElementById('current-distractions').textContent = gameState.distractionCount;
        
        // Calculate time efficiency
        const efficiency = Math.max(0, Math.floor(100 - (gameState.distractionCount / Math.max(1, gameState.timeSpent) * 100)));
        document.getElementById('time-efficiency').textContent = `${efficiency}%`;
        
        // Update monster button status
        updateMonsterUI();
        
        // Update mood indicator
        updateMoodIndicator();
        
        // Update email content based on progress
        updateEmailContent();
        
        // Check if game is over
        checkGameConditions();
        
        // Check for achievements
        checkAchievements();
    }
    
    function updateMoodIndicator() {
        if (gameState.overwhelm >= 8) {
            moodIndicator.textContent = '😵';
        } else if (gameState.focusStreak >= 3) {
            moodIndicator.textContent = '😌';
        } else if (gameState.actionHistory.length > 0 && 
                  gameState.actionHistory[gameState.actionHistory.length - 1] === 'distraction') {
            moodIndicator.textContent = '😣';
        } else {
            moodIndicator.textContent = '🙂';
        }
    }
    
    function updateEmailContent() {
        // Calculate how much of the email to show based on progress
        const totalLength = gameState.emailText.length;
        const visibleLength = Math.floor((gameState.emailProgress / 100) * totalLength);
        
        debug(`Updating email content: progress=${gameState.emailProgress}%, length=${visibleLength}/${totalLength}`);
        
        // Get the full email text and split it into paragraphs
        const paragraphs = gameState.emailText.split('\n');
        let finalHtml = '';
        
        // Process each paragraph to create a smooth typing effect
        let charsRemaining = visibleLength;
        
        for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i];
            
            if (charsRemaining <= 0) {
                break; // No more content to display
            } else if (charsRemaining >= paragraph.length) {
                // Show the entire paragraph
                finalHtml += paragraph + '<br>';
                charsRemaining -= paragraph.length + 1; // +1 for the newline
            } else {
                // Show partial paragraph
                finalHtml += paragraph.substring(0, charsRemaining) + '<br>';
                charsRemaining = 0;
            }
        }
        
        // Update the email content
        if (emailText) {
            emailText.innerHTML = finalHtml;
        } else {
            debug("ERROR: emailText element not found!");
        }
        
        debug("Email content updated, visible length: " + visibleLength);
        
        // Show/hide cursor
        if (cursor) {
            if (gameState.emailProgress < 100) {
                cursor.style.display = 'inline-block';
            } else {
                cursor.style.display = 'none';
                debug("Email is 100% complete, cursor hidden. Game over state: " + gameState.gameOver);
                // Call checkGameConditions to handle game completion
                checkGameConditions();
            }
        } else {
            debug("ERROR: cursor element not found!");
        }
    }
    
    function addLogEntry(message, type) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        
        // Add timestamp
        const timeLeft = gameState.maxTime - gameState.timeSpent;
        logEntry.innerHTML = `<span class="log-time">[${timeLeft}m]</span> ${message}`;
        
        // Add to log
        gameLog.appendChild(logEntry);
        gameLog.scrollTop = gameLog.scrollHeight;
    }
    
    function getUniqueDistraction() {
        const unusedDistractions = gameState.distractions.filter(d => !gameState.usedDistractions.has(d));
        
        if (unusedDistractions.length === 0) {
            gameState.usedDistractions.clear();
            return gameState.distractions[Math.floor(Math.random() * gameState.distractions.length)];
        }
        
        const distraction = unusedDistractions[Math.floor(Math.random() * unusedDistractions.length)];
        gameState.usedDistractions.add(distraction);
        return distraction;
    }
    
    // Handle player actions
    workButton.addEventListener('click', function() {
        // CRITICAL FIX: Don't allow actions if game is over or time is up
        if (gameState.gameOver) {
            debug("Work button clicked but game is over");
            return;
        }
        if (gameState.timeSpent >= gameState.maxTime) {
            debug("Work button clicked but time is up");
            console.log("Time's up - ending game from button click");
            endGame('timeout');
            return;
        }
        
        debug("Work button clicked, current progress: " + gameState.emailProgress + "%");
        
        // Record action
        gameState.actionHistory.push('work');
        
        // Log
        addLogEntry("You try to focus on the email...", "work");
        
        // Determine outcome (might get distracted)
        let distractionChance = 0.5; // Base 50% chance of getting distracted (ADHD default state)
        
        // Modify chance based on game state
        if (gameState.monsterEffectTurns > 0) {
            distractionChance = 0.1; // Monster reduces distraction chance to 10% (super focus)
        } else if (gameState.timeSpent >= 25) {
            distractionChance = 0; // Last 5 minutes: fully focused from deadline pressure
        } else if (gameState.timeSpent >= 20 && gameState.timeSpent < 25) {
            distractionChance = 0.2; // 20-24 minute mark: increased focus from urgency
        } else if (gameState.overwhelm >= 8) {
            distractionChance = 0.05; // High overwhelm but pushing through (5% chance)
        } else if (gameState.focusStreak >= 3) {
            distractionChance = 0.3; // Focus streak helps somewhat
        }
        
        if (Math.random() < distractionChance) {
            // Got distracted despite trying to work
            const distraction = getUniqueDistraction();
            const minutesWasted = Math.floor(Math.random() * 3) + 1;
            
            gameState.timeSpent += minutesWasted;
            gameState.overwhelm = Math.min(10, gameState.overwhelm + 2); // FIXED: Increase by 2 when work fails
            gameState.focusStreak = 0;
            gameState.distractionCount++;
            
            addLogEntry(`You got distracted: ${distraction} (${minutesWasted} min wasted)`, "distraction");
        } else {
            // Successfully worked on email
            let progress = Math.floor(Math.random() * 6) + 5; // 5-10% progress
            
            // Bonuses from game state
            if (gameState.monsterEffectTurns > 0) {
                progress += 5; // Monster gives +5% bonus
                gameState.monsterEffectTurns--;
                
                if (gameState.monsterEffectTurns === 0) {
                    addLogEntry("Monster energy boost has worn off!", "event");
                    document.body.classList.remove('monster-active');
                    gameScreen.classList.remove('shake-effect');
                    monsterCooldown.classList.add('hidden'); // CRITICAL FIX: Hide counter when effect ends
                    
                    // Remove any remaining energy particles
                    const particles = document.querySelectorAll('.energy-particle');
                    particles.forEach(p => p.remove());
                }
            }
            
            if (gameState.focusStreak > 0) {
                const bonus = Math.min(5, gameState.focusStreak);
                progress += bonus;
            }
            
            // Update game state
            gameState.emailProgress = Math.min(100, gameState.emailProgress + progress);
            debug(`Email progress increased to ${gameState.emailProgress}%`);
            
            gameState.timeSpent += 1;
            gameState.focusStreak++;
            gameState.xp += progress;
            gameState.overwhelm = Math.max(0, gameState.overwhelm - 1); // FIXED: Decrease by 1 when work succeeds
            
            addLogEntry(`Made ${progress}% progress on the email!`, "work");
        }
        
        // Update UI
        debug("Calling updateUI after work action");
        updateUI();
    });
    
    // CRITICAL FIX: Don't tell player they gained focus streak on accident
    distractionButton.addEventListener('click', function() {
        // CRITICAL FIX: Don't allow actions if game is over or time is up
        if (gameState.gameOver) return;
        if (gameState.timeSpent >= gameState.maxTime) {
            console.log("Time's up - ending game from button click");
            endGame('timeout');
            return;
        }
        
        // Record action
        gameState.actionHistory.push('distraction');
        
        // Update game state
        gameState.timeSpent += 1; // Takes a minute to take a break
        gameState.overwhelm = Math.max(0, gameState.overwhelm - 1); // Reduce overwhelm
        gameState.focusStreak = 0; // Reset focus streak
        
        // Log
        addLogEntry("You take an intentional break to reset your mind.", "break");
        
        // Update UI
        updateUI();
    });
    
    monsterButton.addEventListener('click', function() {
        // CRITICAL FIX: Don't allow actions if game is over or no monster uses remaining
        if (gameState.gameOver || gameState.monsterUsesRemaining <= 0) return;
        if (gameState.timeSpent >= gameState.maxTime) {
            console.log("Time's up - ending game from button click");
            endGame('timeout');
            return;
        }
        
        // Record action
        gameState.actionHistory.push('monster');
        
        // Update game state
        gameState.monsterUsesRemaining--;
        gameState.monsterEffectTurns = 3;
        gameState.timeSpent += 1; // Takes a minute to drink
        
        // Add lightning and rage effects
        monsterButton.classList.add('lightning-active');
        document.body.classList.add('monster-active');
        
        // Shake the screen for intense effect
        gameScreen.classList.add('shake-effect');
        
        // Flash the screen briefly
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'var(--monster-color)';
        flash.style.opacity = '0.3';
        flash.style.zIndex = '9999';
        flash.style.pointerEvents = 'none';
        document.body.appendChild(flash);
        
        setTimeout(() => flash.remove(), 150);
        
        // Create lightning effects around the game
        addLightningEffect();
        
        // Create multiple rage pulses for dramatic effect
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ragePulse = document.createElement('div');
                ragePulse.className = 'rage-pulse';
                gameScreen.appendChild(ragePulse);
                setTimeout(() => ragePulse.remove(), 800);
            }, i * 300);
        }
        
        setTimeout(() => {
            monsterButton.classList.remove('lightning-active');
        }, 1000);
        
        // More dramatic text
        addLogEntry("💥 You CHUG a Monster energy drink! RAGE MODE ACTIVATED for 3 turns! 💥", "monster");
        
        // Show monster effect
        monsterCooldown.classList.remove('hidden');
        monsterCooldown.textContent = gameState.monsterEffectTurns;
        
        // Update UI
        updateUI();
    });
    
    // Create lightning effect throughout the game
    function addLightningEffect() {
        // Create lightning elements
        for (let i = 0; i < 8; i++) {  // Increased from 5 to 8 for more intensity
            const lightning = document.createElement('div');
            lightning.className = 'lightning-bolt';
            lightning.style.left = `${Math.random() * 100}%`;
            lightning.style.animationDelay = `${Math.random() * 0.5}s`;
            document.getElementById('game-screen').appendChild(lightning);
            
            // Remove after animation
            setTimeout(() => {
                lightning.remove();
            }, 1000);
        }
        
        // Create energy particles that float around during monster mode
        if (gameState.monsterEffectTurns > 0) {
            createEnergyParticles();
        }
    }
    
    eventButton.addEventListener('click', function() {
        eventPopup.classList.add('hidden');
    });
    
    restartButton.addEventListener('click', function() {
        // Show intro screen with tutorial
        endScreen.classList.add('hidden');
        introScreen.classList.remove('hidden');
        
        // Reset monster effect
        document.body.classList.remove('monster-active');
        
        // Re-enable monster button
        monsterButton.disabled = false;
        
        // Need to re-setup the interactive intro since we're going back to it
        setupInteractiveIntro();
    });
    
    // Random events
    function triggerRandomEvent() {
        if (gameState.gameOver) return;
        
        // Combine regular events with work events
        const allEvents = [...gameState.events, ...workEvents];
        
        // Get random event
        const event = allEvents[Math.floor(Math.random() * allEvents.length)];
        
        // Display popup
        document.getElementById('event-title').textContent = event.title;
        document.getElementById('event-message').textContent = event.message;
        eventPopup.classList.remove('hidden');
        
        // Apply event effect
        const result = event.effect();
        addLogEntry(`EVENT: ${event.title} - ${result}`, "event");
        
        // Update UI
        updateUI();
    }
    
    function checkGameConditions() {
        if (gameState.gameOver) {
            debug("checkGameConditions called but game is already over");
            return;
        }
        
        debug(`Checking game conditions: email=${gameState.emailProgress}%, time=${gameState.timeSpent}/${gameState.maxTime}, overwhelm=${gameState.overwhelm}/10`);
        
        // Check win/lose conditions
        if (gameState.emailProgress >= 100 && !gameState.gameOver) {
            // Log this because it's important
            debug("Email completed! Triggering win condition from checkGameConditions.");
            console.log("Email completed! Triggering win condition from checkGameConditions.");
            
            // Ensure we only trigger end game once
            if (!gameState.gameOver) {
                endGame('win');
            }
        } else if (gameState.timeSpent >= gameState.maxTime) {
            debug("Time's up! Triggering timeout condition.");
            endGame('timeout'); // Fixed: Enforce time limit
        } else if (gameState.overwhelm >= 10) {
            debug("Overwhelm at maximum! Triggering overwhelm condition.");
            endGame('overwhelm');
        }
        
        // Random events (20% chance after each action)
        if (gameState.actionHistory.length > 0 && 
            gameState.actionHistory.length % 3 === 0 && 
            Math.random() < 0.2) {
            setTimeout(triggerRandomEvent, 500);
        }
    }
    
    function endGame(reason) {
        debug(`Ending game with reason: ${reason}, email progress: ${gameState.emailProgress}%`);
        
        gameState.gameOver = true;
        
        // Hide game screen, show end screen
        gameScreen.classList.add('hidden');
        endScreen.classList.remove('hidden');
        
        // Set end title and message
        const endTitle = document.getElementById('end-title');
        const endMessage = document.getElementById('end-message');
        
        // Fill in summary stats
        document.getElementById('final-progress').textContent = `${Math.floor(gameState.emailProgress)}%`;
        document.getElementById('final-time').textContent = `${gameState.timeSpent} min`;
        document.getElementById('final-streak').textContent = gameState.focusStreak;
        document.getElementById('final-distractions').textContent = gameState.distractionCount;
        
        // Set message based on outcome
        switch(reason) {
            case 'win':
                endTitle.textContent = "Mission Accomplished!";
                endMessage.textContent = "You completed the email despite your chaotic brain! Well done!";
                addLogEntry("🎉 You completed the email! Great job!", "event");
                break;
            case 'timeout':
                endTitle.textContent = "Out of Time!";
                endMessage.textContent = "You couldn't finish the email before the deadline. Better luck next time!";
                addLogEntry("⏰ You ran out of time! The email remains unfinished.", "event");
                console.log("Game over due to timeout");
                break;
            case 'overwhelm':
                endTitle.textContent = "Overwhelm Overload!";
                endMessage.textContent = "Your brain went into meltdown mode from too many distractions.";
                addLogEntry("🤯 Your overwhelm meter maxed out! Brain.exe has stopped working.", "event");
                break;
        }
        
        // Display achievements
        const achievementsList = document.getElementById('achievements-list');
        achievementsList.innerHTML = '';
        
        // Add some achievements based on game state
        if (gameState.emailProgress >= 100) {
            addAchievement('justSendIt', 'Just Send It', 'fa-paper-plane');
        }
        if (gameState.focusStreak >= 5 || gameState.achievements?.hyperfocus) {
            addAchievement('hyperfocus', 'Hyperfocus Mode', 'fa-bullseye');
        }
        if (gameState.distractionCount >= 10) {
            addAchievement('chaosChild', 'Chaos Child', 'fa-random');
        }
        if (gameState.emailProgress >= 100 && gameState.distractionCount === 0) {
            addAchievement('theChad', 'The Chad', 'fa-trophy');
        }
        if (gameState.emailProgress >= 100 && gameState.timeSpent <= 15) {
            addAchievement('speedDemon', 'Speed Demon', 'fa-bolt');
        }
        if (gameState.emailProgress >= 50 || gameState.achievements?.halfway) {
            addAchievement('halfway', 'Halfway There!', 'fa-flag-checkered');
        }
    }
    
    // Add achievement popup function
    function showAchievementPopup(name, icon) {
        console.log("Showing achievement popup for:", name);
        
        // Create and add styles if they don't exist
        if (!document.getElementById('achievement-popup-styles')) {
            const popupStyles = document.createElement('style');
            popupStyles.id = 'achievement-popup-styles';
            popupStyles.textContent = `
                @keyframes achievement-slide {
                    0% { transform: translateY(100px); opacity: 0; }
                    10% { transform: translateY(0); opacity: 1; }
                    90% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(100px); opacity: 0; }
                }
                
                .achievement-popup {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #6a3093, #a044ff);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    animation: achievement-slide 4s forwards;
                    pointer-events: none;
                }
                
                .achievement-popup i {
                    font-size: 2rem;
                    color: gold;
                    text-shadow: 0 0 5px rgba(255,215,0,0.5);
                }
                
                .achievement-popup .achievement-content {
                    display: flex;
                    flex-direction: column;
                }
                
                .achievement-popup .achievement-title {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    opacity: 0.8;
                }
                
                .achievement-popup .achievement-name {
                    font-size: 1.2rem;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(popupStyles);
        }
        
        // Create and show popup
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${name}</div>
            </div>
        `;
        document.body.appendChild(popup);
        
        // Remove popup after animation completes
        setTimeout(() => {
            popup.remove();
        }, 4000);
    }
    
    // Add work-related events
    const workEvents = [
        {
            title: "Boss Checks In!",
            message: "Your boss stops by to check on your progress. Pressure intensifies!",
            effect: function() {
                gameState.timeSpent += 1;
                gameState.overwhelm += 2;
                return "Lost 1 minute and gained +2 overwhelm from anxiety.";
            }
        },
        {
            title: "Computer Updates!",
            message: "Your computer decides NOW is the perfect time for updates.",
            effect: function() {
                gameState.timeSpent += 3;
                gameState.overwhelm += 1;
                return "Lost 3 minutes fighting with your computer.";
            }
        },
        {
            title: "Deadline Changed!",
            message: "Your boss needs this email SOONER than expected!",
            effect: function() {
                gameState.maxTime = Math.max(gameState.timeSpent + 5, gameState.maxTime - 5);
                gameState.overwhelm += 2;
                return "Deadline shortened by 5 minutes! Stress +2!";
            }
        },
        {
            title: "Productivity App!",
            message: "You remember that productivity app you installed. It actually helps!",
            effect: function() {
                gameState.emailProgress += 10;
                return "Gained +10% email progress! Technology is your friend.";
            }
        },
        {
            title: "Keyboard Shortcut!",
            message: "You accidentally discover a keyboard shortcut that saves time!",
            effect: function() {
                gameState.emailProgress += 5;
                gameState.overwhelm -= 1;
                return "Gained +5% progress and -1 overwhelm from the small victory.";
            }
        }
    ];
    
    // CRITICAL FIX: Check time limit every second to prevent overruns
    window.timeCheckInterval = setInterval(function() {
        // This interval checks if time is up even if other code is running
        if (!gameState.gameOver && gameState.timeSpent >= gameState.maxTime) {
            console.log("Time's up - ending game from timer check");
            endGame('timeout');
        }
    }, 1000); // Check every second
    
    // CRITICAL FIX: Update the Monster counter properly
    function updateMonsterUI() {
        debug(`Updating monster UI: ${gameState.monsterUsesRemaining} uses remaining, effect turns: ${gameState.monsterEffectTurns}`);
        
        // Update button state based on remaining uses
        if (gameState.monsterUsesRemaining <= 0) {
            monsterButton.disabled = true;
            monsterButton.setAttribute('data-uses', '0 left');
        } else {
            monsterButton.disabled = false;
            // Show remaining uses on the button
            monsterButton.setAttribute('data-uses', gameState.monsterUsesRemaining + ' left');
        }
        
        if (gameState.monsterEffectTurns > 0) {
            // Monster is active
            monsterCooldown.classList.remove('hidden');
            monsterCooldown.textContent = gameState.monsterEffectTurns;
            document.body.classList.add('monster-active');
            gameScreen.classList.add('shake-effect');
        } else {
            // Monster effect not active - hide counter
            monsterCooldown.classList.add('hidden');
            document.body.classList.remove('monster-active');
            gameScreen.classList.remove('shake-effect');
            
            // Remove any remaining energy particles
            const particles = document.querySelectorAll('.energy-particle');
            particles.forEach(p => p.remove());
        }
    }
    
    // CRITICAL FIX: Ensure achievement popup works properly
    function addAchievement(id, name, icon) {
        console.log("Achievement unlocked:", name);
        
        // Try to get the achievements list
        const achievementsList = document.getElementById('achievements-list');
        if (achievementsList) {
            // Add to achievements list
            const achievement = document.createElement('div');
            achievement.className = 'achievement';
            achievement.innerHTML = `<i class="fas ${icon}"></i> ${name}`;
            achievementsList.appendChild(achievement);
        }
        
        // Update mini achievements
        updateMiniAchievement(name);
        
        // Show achievement popup
        showAchievementPopup(name, icon);
    }
    
    // CRITICAL FIX: Separate function to update mini achievements
    function updateMiniAchievement(name) {
        console.log("Updating mini achievement for:", name);
        
        // Try looking for elements with various selectors
        const selectors = [
            '#mini-achievements .achievement-icon', 
            '.achievement-icon',
            '#mini-achievements [title="' + name + '"]',
            '[data-title="' + name + '"]',
            '#mini-achievements .locked-achievement'
        ];
        
        let found = false;
        
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            console.log(`Searching with selector: ${selector}, found ${elements.length} elements`);
            
            for (const elem of elements) {
                if (elem.getAttribute('data-title') === name || elem.title === name) {
                    console.log("Found matching element for:", name);
                    
                    elem.classList.remove('locked-achievement');
                    elem.classList.add('unlocked-achievement');
                    
                    // Make sure the icon is colored
                    const iconElem = elem.querySelector('i');
                    if (iconElem) {
                        iconElem.style.color = 'gold';
                        iconElem.style.textShadow = '0 0 5px rgba(255,215,0,0.7)';
                    } else {
                        elem.style.color = 'gold';
                        elem.style.textShadow = '0 0 5px rgba(255,215,0,0.7)';
                    }
                    
                    found = true;
                    break;
                }
            }
            
            if (found) break;
        }
    }
    
    // Add achievement checks during gameplay, not just at end
    function checkAchievements() {
        // First time reaching 50% email progress
        if (gameState.emailProgress >= 50 && !gameState.achievements?.halfway) {
            gameState.achievements = gameState.achievements || {};
            gameState.achievements.halfway = true;
            addLogEntry("🏆 Achievement: Halfway There!", "event");
            addAchievement('halfway', 'Halfway There!', 'fa-flag-checkered');
        }
        
        // First time getting 5+ focus streak
        if (gameState.focusStreak >= 5 && !gameState.achievements?.hyperfocus) {
            gameState.achievements = gameState.achievements || {};
            gameState.achievements.hyperfocus = true;
            addLogEntry("🏆 Achievement: Hyperfocus Mode!", "event");
            addAchievement('hyperfocus', 'Hyperfocus Mode', 'fa-bullseye');
        }
        
        // First time reaching 10+ distractions
        if (gameState.distractionCount >= 10 && !gameState.achievements?.chaosChild) {
            gameState.achievements = gameState.achievements || {};
            gameState.achievements.chaosChild = true;
            addLogEntry("🏆 Achievement: Chaos Child!", "event");
            addAchievement('chaosChild', 'Chaos Child', 'fa-random');
        }
        
        // Email completed
        if (gameState.emailProgress >= 100 && !gameState.achievements?.justSendIt) {
            gameState.achievements = gameState.achievements || {};
            gameState.achievements.justSendIt = true;
            addAchievement('justSendIt', 'Just Send It', 'fa-paper-plane');
        }
        
        // Efficiency achievement - complete email with no distractions
        if (gameState.emailProgress >= 100 && gameState.distractionCount === 0 && !gameState.achievements?.theChad) {
            gameState.achievements = gameState.achievements || {};
            gameState.achievements.theChad = true;
            addAchievement('theChad', 'The Chad', 'fa-trophy');
        }
        
        // Speed achievement - complete email in under 15 minutes
        if (gameState.emailProgress >= 100 && gameState.timeSpent <= 15 && !gameState.achievements?.speedDemon) {
            gameState.achievements = gameState.achievements || {};
            gameState.achievements.speedDemon = true;
            addAchievement('speedDemon', 'Speed Demon', 'fa-bolt');
        }
    }

    // Add energy particles floating around during monster effect
    function createEnergyParticles() {
        // Add CSS for energy particles if not already added
        if (!document.getElementById('energy-particle-styles')) {
            const style = document.createElement('style');
            style.id = 'energy-particle-styles';
            style.textContent = `
                @keyframes float-particle {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(var(--x-offset1), var(--y-offset1)) rotate(90deg); }
                    50% { transform: translate(var(--x-offset2), var(--y-offset2)) rotate(180deg); }
                    75% { transform: translate(var(--x-offset3), var(--y-offset3)) rotate(270deg); }
                    100% { transform: translate(0, 0) rotate(360deg); }
                }
                
                .energy-particle {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background-color: var(--monster-color);
                    border-radius: 50%;
                    opacity: 0.7;
                    pointer-events: none;
                    z-index: 990;
                    filter: blur(2px) brightness(1.5);
                    box-shadow: 0 0 5px var(--monster-color);
                    animation: float-particle 4s infinite ease-in-out;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create particles that float around
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'energy-particle';
            
            // Random position
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            particle.style.left = `${startX}%`;
            particle.style.top = `${startY}%`;
            
            // Random size
            const size = Math.random() * 8 + 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random movement pattern
            const offsetX1 = (Math.random() - 0.5) * 100;
            const offsetY1 = (Math.random() - 0.5) * 100;
            const offsetX2 = (Math.random() - 0.5) * 100;
            const offsetY2 = (Math.random() - 0.5) * 100;
            const offsetX3 = (Math.random() - 0.5) * 100;
            const offsetY3 = (Math.random() - 0.5) * 100;
            
            particle.style.setProperty('--x-offset1', `${offsetX1}px`);
            particle.style.setProperty('--y-offset1', `${offsetY1}px`);
            particle.style.setProperty('--x-offset2', `${offsetX2}px`);
            particle.style.setProperty('--y-offset2', `${offsetY2}px`);
            particle.style.setProperty('--x-offset3', `${offsetX3}px`);
            particle.style.setProperty('--y-offset3', `${offsetY3}px`);
            
            // Random animation duration and delay
            particle.style.animationDuration = `${Math.random() * 3 + 3}s`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            
            gameScreen.appendChild(particle);
            
            // Tag particles so we can remove them when monster effect ends
            particle.dataset.monsterEffect = 'true';
        }
    }

    // Ensure achievements are center-aligned
    function setupAchievementStyles() {
        if (!document.getElementById('achievement-centering-styles')) {
            const style = document.createElement('style');
            style.id = 'achievement-centering-styles';
            style.textContent = `
                #mini-achievements, .achievements-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin: 1rem auto;
                    text-align: center;
                }
                
                .achievement-icon, .achievement {
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    margin: 0 auto;
                }
                
                #achievements-list {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 1rem;
                }
                
                .achievement {
                    background: rgba(255,255,255,0.15);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    text-align: center;
                    min-width: 120px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Reset achievement visuals for new game session
    function resetAchievementVisuals() {
        // Reset mini-achievements display
        const allAchievementIcons = document.querySelectorAll('.achievement-icon, .unlocked-achievement');
        allAchievementIcons.forEach(icon => {
            // Keep the element but remove styling
            icon.classList.remove('unlocked-achievement');
            icon.classList.add('locked-achievement');
            
            // Reset any inline styles that might have been added
            icon.style.color = '';
            icon.style.textShadow = '';
            
            // Reset any icon colors
            const iconElement = icon.querySelector('i');
            if (iconElement) {
                iconElement.style.color = '';
                iconElement.style.textShadow = '';
            }
        });
        
        // Clear any achievement popups that might still be on screen
        const popups = document.querySelectorAll('.achievement-popup');
        popups.forEach(popup => popup.remove());
    }
}); 