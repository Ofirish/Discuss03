// SECTION: Global Variables
let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

// SECTION: Load Questions from CSV
async function loadQuestionsFromCSV() {
    try {
        const response = await fetch("questions.csv");
        if (!response.ok) throw new Error("Failed to load CSV file");

        const csvText = await response.text();
        const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        allQuestions = parsedData.data.filter(q => q.question && q.correctAnswer);
    } catch (error) {
        console.error("CSV Loading Error:", error);
        alert("אירעה שגיאה בטעינת השאלות.");

        // Default questions as fallback
        allQuestions = [
            { question: "האם חשוב להקשיב לאחרים?", correctAnswer: "yes" },
            { question: "האם תמיד צריך לנצח בדיון?", correctAnswer: "no" }
        ];
    }
}

// SECTION: Shuffle Array (Fisher-Yates Algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// SECTION: Get Random Questions
function getRandomQuestions() {
    const totalQuestions = parseInt(localStorage.getItem("totalQuestions")) || 10;
    const shuffledQuestions = shuffleArray([...allQuestions]);
    return shuffledQuestions.slice(0, totalQuestions);
}

// SECTION: Update Progress Bar
function updateProgressBar() {
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");

    const progressPercentage = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progressFill.style.width = `${progressPercentage}%`;

    let funnyMessage;
    if (progressPercentage === 100) {
        funnyMessage = "Finished!";
    } else if (progressPercentage >= 80) {
        funnyMessage = "Almost there!";
    } else if (progressPercentage >= 50) {
        funnyMessage = "Keep it up!";
    } else {
        funnyMessage = "Just getting started!";
    }
    progressText.textContent = `${currentQuestionIndex + 1} out of ${currentQuestions.length} questions (${funnyMessage})`;
}

// SECTION: Initialize Hammer.js Swipe on Cards
function initCardSwipe(cardElement) {
    const hammer = new Hammer(cardElement);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL }); // Fix: Ensure horizontal swipe detection
    let isSwiping = false;

    hammer.on('panstart', () => {
        cardElement.classList.add('swiping'); // Disable transitions during swipe
        isSwiping = true;
    });

    hammer.on('panmove', (event) => {
        if (!isSwiping) return;

        const x = event.deltaX;
        const rotation = x * 0.1; // Slight rotation effect
        cardElement.style.transform = `translate(calc(-50% + ${x}px), -50%) rotate(${rotation}deg)`;

        if (x > 0) {
            cardElement.classList.add('glow-right');
            cardElement.classList.remove('glow-left');
        } else {
            cardElement.classList.add('glow-left');
            cardElement.classList.remove('glow-right');
        }
    });

    hammer.on('panend', (event) => {
        if (!isSwiping) return;
        isSwiping = false;
        cardElement.classList.remove('swiping');

        const x = event.deltaX;
        const velocity = event.velocityX;
        const threshold = cardElement.offsetWidth / 4;

        if (Math.abs(x) > threshold || Math.abs(velocity) > 0.5) {
            const direction = x > 0 ? 'right' : 'left';
            flyAway(cardElement, direction); // Slide card off-screen
            handleAnswer(direction === 'right'); // Handle answer
        } else {
            cardElement.style.transform = 'translate(-50%, -50%)'; // Return to center
            cardElement.classList.remove('glow-left', 'glow-right');
        }
    });
}

// SECTION: Create Card Element
function createCard(questionText) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.textContent = questionText;

    initCardSwipe(card); // Initialize swipe gestures
    document.getElementById("gameContainer").appendChild(card);

    return card;
}

// SECTION: Show Next Card
function showNextCard() {
    if (currentQuestionIndex >= currentQuestions.length) {
        endGame();
        return;
    }

    const currentQuestion = currentQuestions[currentQuestionIndex];
    const cardElement = createCard(currentQuestion.question);
    currentQuestionIndex++;
    updateProgressBar();
}

// SECTION: Handle Player's Answer
function handleAnswer(isCorrect) {
    const correctAnswer = currentQuestions[currentQuestionIndex - 1].correctAnswer;

    if (isCorrect === (correctAnswer === "yes")) {
        score += 10; // Increase score for correct answers
        showConfetti(); // Show confetti effect
    } else {
        showThunder(); // Show thunder effect
        shakeScreen(); // Shake screen
        vibrateDevice(); // Trigger haptic feedback
    }
}

// SECTION: Fly Away Animation
function flyAway(cardElement, direction) {
    cardElement.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    cardElement.style.transform = `
        translate(${direction === "right" ? "100vw" : "-100vw"}, 0)
        rotate(${direction === "right" ? "30deg" : "-30deg"})
    `;
    cardElement.style.opacity = "0";

    setTimeout(() => {
        cardElement.remove(); // Remove card from DOM
        showNextCard();
    }, 500);
}

// SECTION: Confetti Effect
function showConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animationDuration = `${Math.random() * 2 + 1}s`;
        confetti.style.backgroundColor = ["#ffcc00", "#ff6666", "#66ccff"][Math.floor(Math.random() * 3)];
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

// SECTION: Thunder Effect
function showThunder() {
    const thunder = document.createElement("div");
    thunder.classList.add("thunder");
    document.body.appendChild(thunder);
    setTimeout(() => thunder.remove(), 500);
}

// SECTION: Shake Screen
function shakeScreen() {
    const gameContainer = document.getElementById("gameContainer");
    gameContainer.classList.add("shake-effect"); // Add shake effect class
    setTimeout(() => {
        gameContainer.classList.remove("shake-effect");
    }, 300);
}

// SECTION: Vibrate Device
function vibrateDevice() {
    if ("vibrate" in navigator) {
        navigator.vibrate(200); // Vibrate for 200ms
    } else {
        console.log("Haptic feedback not supported.");
    }
}

// SECTION: End Game Screen
function endGame() {
    const endScreen = document.getElementById("endScreen");
    const finalScoreElement = document.getElementById("finalScore");
    const resultImage = document.getElementById("resultImage");

    finalScoreElement.textContent = score;

    let imageUrl;
    if (score >= 90) {
        imageUrl = "imgs/100.jpg";
    } else if (score >= 50) {
        imageUrl = "imgs/60-80.jpg";
    } else {
        imageUrl = "imgs/Failed02.jpg";
    }

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
        resultImage.src = imageUrl;
        endScreen.style.display = "flex"; // Show end screen after image loads
    };
    img.onerror = () => {
        console.error("Failed to load result image:", imageUrl);
        alert("אירעה שגיאה בטעינת התמונה.");
    };
}

// SECTION: Restart Game
function restartGame() {
    document.getElementById("endScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";
    currentQuestions = getRandomQuestions();
    currentQuestionIndex = 0;
    score = 0;
    updateProgressBar();
    showNextCard();
}

// SECTION: Share Results
function shareResults(platform) {
    const scoreText = `השגתי ${score} נקודות במשחק תרבות הדיון! 🎉`;
    const shareImage = document.getElementById("resultImage").src;

    try {
        if (platform === "whatsapp") {
            window.open(
                `https://wa.me/?text=${encodeURIComponent(scoreText)}%0A${shareImage}`,
                "_blank"
            );
        } else if (platform === "email") {
            window.location.href = 
                `mailto:?subject=תוצאות המשחק&body=${encodeURIComponent(scoreText)}%0A${shareImage}`;
        }
    } catch (error) {
        alert("אירעה שגיאה בעת השיתוף. אנא נסה שוב.");
    }
}

// SECTION: Initialize Game on Page Load
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startGameButton").addEventListener("click", async () => {
        await loadQuestionsFromCSV(); // Load questions from CSV
        document.getElementById("welcomePage").style.display = "none";
        document.getElementById("gameContainer").style.display = "block";
        currentQuestions = getRandomQuestions();
        showNextCard();
    });

    document.getElementById("restartButton").addEventListener("click", restartGame);
    document.getElementById("shareWhatsApp").addEventListener("click", () => shareResults("whatsapp"));
    document.getElementById("shareEmail").addEventListener("click", () => shareResults("email"));
});