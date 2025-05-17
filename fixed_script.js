// ADHD Simulator Game Logic - Enhanced Version
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const startButton = document.getElementById('start-button');
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
        monsterUsed: false,
        distractionCount: 0,
        actionHistory: [],
        gameOver: false,
        
        // Email content that will progressively be revealed
        emailText: `Hi Boss,

I wanted to provide an update on the project we discussed last week.

We've made significant progress on the key deliverables and are on track to meet our deadlines. The team has been working hard to address the challenges we identified earlier.

I'll have a detailed report ready by Friday with all the metrics you requested.

Let me know if you need any specific information before then.

Best regards,
Your Name`,

        // Random events
        events: [
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
        ],
        
        // Distractions
        distractions: [
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
        ],
        usedDistractions: new Set()
    };
    
    // Interactive Tutorial Setup
    function setupInteractiveTutorial() {
        // Clear the intro content and replace with interactive tutorial
        const introContent = document.querySelector('.intro-content');
        introContent.innerHTML = `
            <p>You need to write a simple email in 30 minutes. But with ADHD, even simple tasks can be...</p>
            <div id="tutorial-container">
                <div class="tutorial-step active">
                    <h3>Focus... wait, what was I doing?</h3>
                    <p>Try to click the "FOCUS" button 3 times in a row to complete this step.</p>
                    <button id="tutorial-focus" class="tutorial-button">FOCUS</button>
                    <div class="progress-container">
                        <div id="tutorial-focus-progress" class="tutorial-progress"></div>
                    </div>
                </div>
                <div class="tutorial-step">
                    <h3>Distractions are everywhere!</h3>
                    <p>Oh look, something shiny! Click on the distractions that appear.</p>
                    <div id="distraction-container"></div>
                    <div class="progress-container">
                        <div id="tutorial-distraction-progress" class="tutorial-progress"></div>
                    </div>
                </div>
                <div class="tutorial-step">
                    <h3>Sometimes you need a boost!</h3>
                    <p>When overwhelmed, energy drinks might help... temporarily.</p>
                    <button id="tutorial-monster" class="tutorial-button monster-button">DRINK MONSTER</button>
                    <div class="progress-container">
                        <div id="tutorial-monster-progress" class="tutorial-progress"></div>
                    </div>
                </div>
                <div class="tutorial-step final-step">
                    <h3>Ready to experience ADHD?</h3>
                    <p>Remember: Even when you <em>try</em> to focus, your brain might have other plans!</p>
                    <button id="start-game-button" class="action-button pulse-animation">I'M READY... WAIT, WHAT?</button>
                </div>
            </div>
        `;
        
        // Style for interactive tutorial
        const style = document.createElement('style');
        style.textContent = `
            .tutorial-step {
                display: none;
                margin-bottom: 2rem;
                padding: 1.5rem;
                background-color: rgba(255, 107, 43, 0.1);
                border-radius: 8px;
                transition: all 0.5s ease;
            }
            
            .tutorial-step.active {
                display: block;
                animation: fadeIn 0.5s forwards;
            }
            
            .tutorial-button {
                padding: 0.8rem 2rem;
                font-size: 1rem;
                background-color: #00b4d8;
                color: white;
                border: none;
                border-radius: 30px;
                cursor: pointer;
                margin: 1rem 0;
                font-weight: 600;
            }
            
            .tutorial-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .monster-button {
                background-color: #7209b7;
            }
            
            .progress-container {
                height: 8px;
                background-color: #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
                margin: 1rem 0;
            }
            
            .tutorial-progress {
                height: 100%;
                width: 0%;
                background-color: #4caf50;
                transition: width 0.3s ease;
            }
            
            #distraction-container {
                position: relative;
                height: 120px;
                background-color: rgba(255, 255, 255, 0.5);
                border-radius: 8px;
                margin: 1rem 0;
            }
            
            .distraction-item {
                position: absolute;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 1.5rem;
            }
            
            .distraction-item:hover {
                transform: scale(1.2);
            }
            
            @keyframes fadeIn {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            
            .final-step {
                text-align: center;
            }
        `;
        document.head.appendChild(style);
        
        // Tutorial interactions
        let tutorialStep = 0;
        const tutorialSteps = document.querySelectorAll('.tutorial-step');
        const tutorialFocusButton = document.getElementById('tutorial-focus');
        const tutorialMonsterButton = document.getElementById('tutorial-monster');
        const startGameButton = document.getElementById('start-game-button');
        const tutorialFocusProgress = document.getElementById('tutorial-focus-progress');
        const tutorialDistractionProgress = document.getElementById('tutorial-distraction-progress');
        const tutorialMonsterProgress = document.getElementById('tutorial-monster-progress');
        
        // Focus step variables
        let focusClicks = 0;
        let consecutiveFocusClicks = 0;
        let lastFocusTime = 0;
        
        if (tutorialFocusButton) {
            tutorialFocusButton.addEventListener('click', function() {
                const now = Date.now();
                
                // Random chance (30%) to fail focus even when clicking the button
                if (Math.random() < 0.3) {
                    addTutorialMessage("Oops! Your mind wandered...", false);
                    consecutiveFocusClicks = 0;
                } else {
                    // Check if clicks are consecutive (within 3 seconds)
                    if (now - lastFocusTime < 3000 || lastFocusTime === 0) {
                        consecutiveFocusClicks++;
                        addTutorialMessage("Nice focus! Keep going...", true);
                    } else {
                        consecutiveFocusClicks = 1;
                        addTutorialMessage("Starting over with focus...", true);
                    }
                }
                
                // Update progress bar (based on consecutive clicks)
                const progress = (consecutiveFocusClicks / 3) * 100;
                tutorialFocusProgress.style.width = `${progress}%`;
                
                // Move to next step if completed
                if (consecutiveFocusClicks >= 3) {
                    setTimeout(() => {
                        moveToNextTutorialStep();
                        spawnDistractions();
                    }, 1000);
                }
                
                focusClicks++;
                lastFocusTime = now;
            });
        }
        
        // Distraction step
        let distractionsCaught = 0;
        const distractionEmojis = ['📱', '🎮', '🎵', '🍕', '🐈', '📺', '💭', '🎬', '📚', '☕'];
        
        function spawnDistractions() {
            const container = document.getElementById('distraction-container');
            if (!container) return;
            
            // Clear any existing distractions
            container.innerHTML = '';
            distractionsCaught = 0;
            
            // Spawn distraction items with random positions
            let spawnedCount = 0;
            const maxDistractions = 5;
            
            function spawnRandomDistraction() {
                if (spawnedCount >= maxDistractions || tutorialStep !== 1) return;
                
                const distraction = document.createElement('div');
                distraction.className = 'distraction-item';
                distraction.textContent = distractionEmojis[Math.floor(Math.random() * distractionEmojis.length)];
                
                // Random position
                const left = Math.random() * 80 + 10; // 10-90%
                const top = Math.random() * 80 + 10; // 10-90%
                distraction.style.left = `${left}%`;
                distraction.style.top = `${top}%`;
                
                container.appendChild(distraction);
                
                distraction.addEventListener('click', function() {
                    this.style.opacity = '0';
                    setTimeout(() => this.remove(), 300);
                    distractionsCaught++;
                    
                    // Update progress
                    const progress = (distractionsCaught / maxDistractions) * 100;
                    tutorialDistractionProgress.style.width = `${progress}%`;
                    
                    // Move to next step if completed
                    if (distractionsCaught >= maxDistractions) {
                        setTimeout(moveToNextTutorialStep, 1000);
                    } else {
                        // Spawn another distraction with delay
                        setTimeout(spawnRandomDistraction, 500 + Math.random() * 1000);
                    }
                });
                
                spawnedCount++;
            }
            
            // Initial spawning of distractions
            for (let i = 0; i < 3; i++) {
                setTimeout(() => spawnRandomDistraction(), i * 800);
            }
        }
        
        // Monster energy step
        if (tutorialMonsterButton) {
            tutorialMonsterButton.addEventListener('click', function() {
                tutorialMonsterProgress.style.width = '100%';
                this.disabled = true;
                this.textContent = "ENERGY BOOST ACTIVATED!";
                
                // Visual effect
                document.body.classList.add('monster-active');
                
                // Remove effect after delay
                setTimeout(() => {
                    document.body.classList.remove('monster-active');
                    moveToNextTutorialStep();
                }, 2000);
            });
        }
        
        // Start game button
        if (startGameButton) {
            startGameButton.addEventListener('click', function() {
                introScreen.classList.add('hidden');
                gameScreen.classList.remove('hidden');
                startGame();
            });
        }
        
        function moveToNextTutorialStep() {
            tutorialSteps[tutorialStep].classList.remove('active');
            tutorialStep++;
            if (tutorialStep < tutorialSteps.length) {
                tutorialSteps[tutorialStep].classList.add('active');
            }
        }
        
        function addTutorialMessage(message, isSuccess) {
            const messageEl = document.createElement('div');
            messageEl.className = `tutorial-message ${isSuccess ? 'success' : 'failure'}`;
            messageEl.textContent = message;
            
            // Add styling for messages
            messageEl.style.color = isSuccess ? '#4caf50' : '#f44336';
            messageEl.style.marginTop = '0.5rem';
            messageEl.style.fontSize = '0.9rem';
            messageEl.style.fontStyle = 'italic';
            
            // Find the right container
            if (tutorialStep === 0) {
                const container = document.querySelector('.tutorial-step.active');
                const existingMessage = container.querySelector('.tutorial-message');
                if (existingMessage) existingMessage.remove();
                container.appendChild(messageEl);
            }
        }
        
        // Show the first step
        tutorialSteps[0].classList.add('active');
    }
    
    // Initialize the interactive tutorial
    setupInteractiveTutorial();
    
    // Game functions
    function startGame() {
        // Reset game state
        gameState.emailProgress = 0;
        gameState.timeSpent = 0;
        gameState.overwhelm = 0;
        gameState.focusStreak = 0;
        gameState.xp = 0;
        gameState.monsterActive = false;
        gameState.monsterEffectTurns = 0;
        gameState.monsterUsed = false;
        gameState.distractionCount = 0;
        gameState.actionHistory = [];
        gameState.gameOver = false;
        gameState.usedDistractions.clear();
        
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
        document.getElementById('overwhelm-value').textContent = `${gameState.overwhelm}/10`;
        document.getElementById('focus-streak').textContent = gameState.focusStreak;
        document.getElementById('focus-meter').style.width = `${Math.min(100, gameState.focusStreak * 10)}%`;
        document.getElementById('xp-earned').textContent = gameState.xp;
        document.getElementById('xp-meter').style.width = `${Math.min(100, gameState.xp)}%`;
        document.getElementById('current-distractions').textContent = gameState.distractionCount;
        
        // Calculate time efficiency
        const efficiency = Math.max(0, Math.floor(100 - (gameState.distractionCount / Math.max(1, gameState.timeSpent) * 100)));
        document.getElementById('time-efficiency').textContent = `${efficiency}%`;
        
        // Update monster button status
        if (gameState.monsterUsed) {
            monsterButton.classList.add('disabled');
            if (gameState.monsterEffectTurns > 0) {
                monsterCooldown.classList.remove('hidden');
                monsterCooldown.textContent = gameState.monsterEffectTurns;
                document.body.classList.add('monster-active');
            } else {
                monsterCooldown.classList.add('hidden');
                document.body.classList.remove('monster-active');
            }
        }
        
        // Update mood indicator
        updateMoodIndicator();
        
        // Update email content based on progress
        updateEmailContent();
        
        // Check if game is over
        checkGameConditions();
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
        
        // Show partial email text
        emailText.textContent = gameState.emailText.substring(0, visibleLength);
        
        // Show/hide cursor
        if (gameState.emailProgress < 100) {
            cursor.style.display = 'inline-block';
        } else {
            cursor.style.display = 'none';
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
        if (gameState.gameOver) return;
        
        // Record action
        gameState.actionHistory.push('work');
        
        // Log
        addLogEntry("You try to focus on the email...", "work");
        
        // Determine outcome (might get distracted)
        let distractionChance = 0.3; // Base 30% chance of getting distracted
        
        // Modify chance based on game state
        if (gameState.monsterEffectTurns > 0) {
            distractionChance = 0.1; // Monster reduces distraction chance
        } else if (gameState.overwhelm >= 7) {
            distractionChance = 0.5; // High overwhelm increases chance
        } else if (gameState.focusStreak >= 3) {
            distractionChance = 0.2; // Focus streak helps
        }
        
        if (Math.random() < distractionChance) {
            // Got distracted despite trying to work
            const distraction = getUniqueDistraction();
            const minutesWasted = Math.floor(Math.random() * 3) + 1;
            
            gameState.timeSpent += minutesWasted;
            gameState.overwhelm = Math.min(10, gameState.overwhelm + 1);
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
                }
            }
            
            if (gameState.focusStreak > 0) {
                const bonus = Math.min(5, gameState.focusStreak);
                progress += bonus;
            }
            
            // Update game state
            gameState.emailProgress = Math.min(100, gameState.emailProgress + progress);
            gameState.timeSpent += 1;
            gameState.focusStreak++;
            gameState.xp += progress;
            gameState.overwhelm = Math.max(0, gameState.overwhelm - 1);
            
            addLogEntry(`Made ${progress}% progress on the email!`, "work");
            
            // Check for achievements
            if (gameState.focusStreak >= 5) {
                addLogEntry("🏆 Achievement: Hyperfocus Mode!", "event");
            }
        }
        
        // Update UI
        updateUI();
    });
    
    distractionButton.addEventListener('click', function() {
        if (gameState.gameOver) return;
        
        // Record action
        gameState.actionHistory.push('distraction');
        
        // Get a random distraction
        const distraction = getUniqueDistraction();
        const minutesWasted = Math.floor(Math.random() * 3) + 2; // 2-4 minutes
        
        // Update game state
        gameState.timeSpent += minutesWasted;
        gameState.overwhelm = Math.max(0, gameState.overwhelm - 2); // Intentional distractions reduce overwhelm
        gameState.focusStreak = 0;
        gameState.distractionCount++;
        
        addLogEntry(`You took a break: ${distraction} (${minutesWasted} min)`, "distraction");
        
        // Check for achievement
        if (gameState.distractionCount >= 10) {
            addLogEntry("🏆 Achievement: Chaos Child!", "event");
        }
        
        // Update UI
        updateUI();
    });
    
    monsterButton.addEventListener('click', function() {
        if (gameState.gameOver || gameState.monsterUsed) return;
        
        // Record action
        gameState.actionHistory.push('monster');
        
        // Update game state
        gameState.monsterUsed = true;
        gameState.monsterEffectTurns = 3;
        gameState.timeSpent += 1; // Takes a minute to drink
        
        addLogEntry("You chug a Monster energy drink! Super focus activated for 3 turns!", "monster");
        
        // Show monster effect
        monsterCooldown.classList.remove('hidden');
        monsterCooldown.textContent = gameState.monsterEffectTurns;
        document.body.classList.add('monster-active');
        
        // Update UI
        updateUI();
    });
    
    eventButton.addEventListener('click', function() {
        eventPopup.classList.add('hidden');
    });
    
    restartButton.addEventListener('click', function() {
        // Show intro screen with tutorial
        endScreen.classList.add('hidden');
        introScreen.classList.remove('hidden');
        setupInteractiveTutorial();
    });
    
    // Random events
    function triggerRandomEvent() {
        if (gameState.gameOver) return;
        
        // Get random event
        const event = gameState.events[Math.floor(Math.random() * gameState.events.length)];
        
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
        if (gameState.gameOver) return;
        
        // Check win/lose conditions
        if (gameState.emailProgress >= 100) {
            endGame('win');
        } else if (gameState.timeSpent >= gameState.maxTime) {
            endGame('timeout');
        } else if (gameState.overwhelm >= 10) {
            endGame('overwhelm');
        }
        
        // Random events (20% chance after each action)
        if (gameState.actionHistory.length > 0 && Math.random() < 0.2) {
            setTimeout(triggerRandomEvent, 500);
        }
    }
    
    function endGame(reason) {
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
        if (gameState.focusStreak >= 5) {
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
        
        function addAchievement(id, name, icon) {
            const achievement = document.createElement('div');
            achievement.className = 'achievement';
            achievement.innerHTML = `<i class="fas ${icon}"></i> ${name}`;
            achievementsList.appendChild(achievement);
            
            // Also unlock the mini achievement icon
            const miniAchievements = document.querySelectorAll('#mini-achievements .locked-achievement');
            for (const elem of miniAchievements) {
                if (elem.title === name) {
                    elem.classList.remove('locked-achievement');
                    elem.classList.add('unlocked-achievement');
                    break;
                }
            }
        }
    }
});
