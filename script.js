/**
 * CARD SWIPE GAME - COMPLETE WORKING VERSION
 * 
 * Features:
 * - Loads questions from CSV or uses fallback
 * - Implements swipeable card interface
 * - Tracks progress and score
 * - Handles game flow from start to end
 */

// ======================
// GAME STATE VARIABLES
// ======================
let allQuestions = [];       // All loaded questions from CSV
let currentQuestions = [];   // Questions for current game session
let currentQuestionIndex = 0; // Current question position
let score = 0;               // Player's score

// ======================
// DOM ELEMENTS
// ======================
const gameContainer = document.getElementById('gameContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const startButton = document.getElementById('startGameButton');
const restartButton = document.getElementById('restartButton');

// ======================
// INITIALIZATION
// ======================
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    
    // Set up social sharing
    document.getElementById('shareWhatsApp').addEventListener('click', () => shareResults('whatsapp'));
    document.getElementById('shareEmail').addEventListener('click', () => shareResults('email'));
});

/**
 * Starts the game flow
 */
async function startGame() {
    try {
        // Load questions and hide welcome screen
        await loadQuestionsFromCSV();
        document.getElementById('welcomePage').style.display = 'none';
        gameContainer.style.display = 'block';
        
        // Initialize game state
        currentQuestions = getRandomQuestions();
        currentQuestionIndex = 0;
        score = 0;
        
        // Show first card
        showNextCard();
    } catch (error) {
        console.error('Game initialization failed:', error);
        alert('אירעה שגיאה בהפעלת המשחק. נא לנסות שוב.');
    }
}

// ======================
// QUESTION MANAGEMENT
// ======================

/**
 * Loads questions from CSV file or uses fallback
 */
async function loadQuestionsFromCSV() {
    try {
        const response = await fetch('questions.csv');
        if (!response.ok) throw new Error('Failed to load CSV');
        
        const csvText = await response.text();
        const parsedData = Papa.parse(csvText, { 
            header: true, 
            skipEmptyLines: true 
        });
        
        allQuestions = parsedData.data.filter(q => q.question && q.correctAnswer);
    } catch (error) {
        console.error('Error loading questions:', error);
        
        // Fallback questions
        allQuestions = [
            { question: "האם חשוב להקשיב לאחרים?", correctAnswer: "yes" },
            { question: "האם תמיד צריך לנצח בדיון?", correctAnswer: "no" },
            { question: "האם צריך לכבד דעות שונות?", correctAnswer: "yes" }
        ];
    }
}

/**
 * Gets random subset of questions for current game
 * @returns {Array} Shuffled array of questions
 */
function getRandomQuestions() {
    const totalQuestions = 10; // Fixed to 10 questions
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, totalQuestions);
}

// ======================
// CARD MANAGEMENT
// ======================

/**
 * Creates and displays a new card with question
 * @param {string} questionText - The question to display
 */
function createCard(questionText) {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = questionText;
    card.style.opacity = '1';
    card.style.display = 'flex';
    
    // Add to DOM and initialize swipe
    gameContainer.appendChild(card);
    initCardSwipe(card);
    return card;
}

/**
 * Initializes swipe gestures for a card
 * @param {HTMLElement} cardElement - The card DOM element
 */
/**
 * Initializes swipe gestures for a card element
 * @param {HTMLElement} cardElement - The card DOM element to make swipeable
 */
function initCardSwipe(cardElement) {
    // Initialize Hammer.js for touch gestures
    const hammer = new Hammer(cardElement);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });

    // When swipe begins
    hammer.on('panstart', () => {
        cardElement.classList.add('swiping'); // Disable transitions during swipe
    });

    // During swipe movement
    hammer.on('panmove', (e) => {
        const x = e.deltaX; // Horizontal movement distance
        const rotation = x * 0.2; // Calculate rotation based on swipe distance
        
        // Apply movement and rotation in real-time
        cardElement.style.transform = `translate(calc(-50% + ${x}px), -50%) rotate(${rotation}deg)`;
        
        // Visual feedback for swipe direction
        if (x > 0) {
            cardElement.classList.add('glow-right');
            cardElement.classList.remove('glow-left');
        } else {
            cardElement.classList.add('glow-left');
            cardElement.classList.remove('glow-right');
        }
    });

    // When swipe ends
    hammer.on('panend', (e) => {
        cardElement.classList.remove('swiping');
        const x = e.deltaX;
        const threshold = cardElement.offsetWidth / 3; // Minimum swipe distance
        
        // Check if swipe passed threshold
        if (Math.abs(x) > threshold || Math.abs(e.velocityX) > 0.5) {
            const direction = x > 0 ? 'right' : 'left';
            flyAway(cardElement, direction); // Animate card off screen
            handleAnswer(direction === 'right'); // Process answer
        } else {
            // Return card to center if swipe was insufficient
            cardElement.style.transform = 'translate(-50%, -50%)';
            cardElement.classList.remove('glow-left', 'glow-right');
        }
    });
}

/**
 * Resets card to center position
 * @param {HTMLElement} card - The card element
 */
function resetCardPosition(card) {
    card.style.transform = 'translate(-50%, -50%)';
    card.classList.remove('glow-left', 'glow-right');
}

/**
 * Animates card flying off screen
 * @param {HTMLElement} card - The card element
 * @param {string} direction - 'left' or 'right'
 */
/**
 * Animates card flying off screen after swipe
 * @param {HTMLElement} card - Card DOM element
 * @param {string} direction - 'left' or 'right'
 */
function flyAway(card, direction) {
    const flyDistance = window.innerWidth * 1.5; // Distance to fly off screen
    
    // Smooth animation with easing
    card.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
    
    // Apply transform based on direction
    card.style.transform = direction === 'right' 
        ? `translate(calc(-50% + ${flyDistance}px), -50%) rotate(45deg)`
        : `translate(calc(-50% - ${flyDistance}px), -50%) rotate(-45deg)`;
    
    card.style.opacity = '0'; // Fade out
    
    // Remove card after animation completes
    setTimeout(() => {
        card.remove();
        showNextCard();
    }, 600); // Matches CSS transition duration
}

/**
 * Shows next card or ends game if finished
 */
function showNextCard() {
    updateProgressBar();
    
    if (currentQuestionIndex >= currentQuestions.length) {
        endGame();
        return;
    }

    const currentQuestion = currentQuestions[currentQuestionIndex];
    createCard(currentQuestion.question);
    currentQuestionIndex++;
}

// ======================
// GAME LOGIC
// ======================

/**
 * Handles player's answer
 * @param {boolean} isYes - Whether player swiped right (yes)
 */
function handleAnswer(isYes) {
    const currentQuestion = currentQuestions[currentQuestionIndex - 1];
    const isCorrect = (isYes && currentQuestion.correctAnswer === 'yes') || 
                     (!isYes && currentQuestion.correctAnswer === 'no');

    if (isCorrect) {
        score += 10;
        showConfetti();
    } else {
        showThunder();
        shakeScreen();
        vibrateDevice();
    }
}

/**
 * Updates progress bar display
 */
function updateProgressBar() {
    const progress = (currentQuestionIndex / currentQuestions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentQuestionIndex}/${currentQuestions.length}`;
}

/**
 * Ends the game and shows results
 */
function endGame() {
    const endScreen = document.getElementById('endScreen');
    const finalScoreElement = document.getElementById('finalScore');
    
    finalScoreElement.textContent = score;
    
    // Set result image based on score
    const resultImage = document.getElementById('resultImage');
    if (score >= 80) {
        resultImage.src = 'imgs/great-score.jpg';
    } else if (score >= 50) {
        resultImage.src = 'imgs/medium-score.jpg';
    } else {
        resultImage.src = 'imgs/low-score.jpg';
    }
    
    endScreen.style.display = 'flex';
}

/**
 * Restarts the game
 */
function restartGame() {
    document.getElementById('endScreen').style.display = 'none';
    currentQuestionIndex = 0;
    score = 0;
    showNextCard();
}

// ======================
// VISUAL EFFECTS
// ======================

/**
 * Shows confetti effect for correct answers
 */
function showConfetti() {
    // Confetti implementation...
}

/**
 * Shows thunder effect for wrong answers
 */
function showThunder() {
    // Thunder effect implementation...
}

/**
 * Shakes the screen
 */
function shakeScreen() {
    gameContainer.classList.add('shake');
    setTimeout(() => gameContainer.classList.remove('shake'), 500);
}

/**
 * Triggers device vibration if available
 */
function vibrateDevice() {
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
}

/**
 * Creates confetti explosion for correct answers
 */
function showConfetti() {
    // Create 50 confetti pieces
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        // Random positioning
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = getRandomColor();
        
        // Animation with random duration
        confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        
        // Random horizontal movement
        confetti.style.setProperty('--random-x', `${Math.random() * 200 - 100}px`);
        
        document.body.appendChild(confetti);
        
        // Auto-cleanup after animation
        setTimeout(() => confetti.remove(), 3000);
    }
}

/**
 * Creates screen flash effect for wrong answers
 */
function showThunder() {
    const thunder = document.createElement('div');
    thunder.className = 'thunder-effect';
    thunder.style.animation = 'thunderFlash 0.3s linear';
    document.body.appendChild(thunder);
    
    // Auto-remove after animation
    setTimeout(() => thunder.remove(), 300);
}

/**
 * Helper: Returns random color for confetti
 */
function getRandomColor() {
    const colors = ['#ff6f61', '#6a11cb', '#2575fc', '#ffcc00', '#2ecc71'];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Shakes screen for wrong answers
 */
function shakeScreen() {
    const container = document.getElementById('gameContainer');
    container.classList.add('shake-effect');
    
    // Remove class after animation
    setTimeout(() => {
        container.classList.remove('shake-effect');
    }, 500);
}
// ======================
// SOCIAL SHARING
// ======================

/**
 * Shares results on social platforms
 * @param {string} platform - 'whatsapp' or 'email'
 */
function shareResults(platform) {
    const message = `השגתי ${score} נקודות במשחק תרבות הדיון!`;
    
    if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
    } else if (platform === 'email') {
        window.location.href = `mailto:?subject=תוצאות המשחק&body=${encodeURIComponent(message)}`;
    }
}