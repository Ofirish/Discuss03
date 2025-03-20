let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

// Load Questions from CSV
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
        allQuestions = [];
    }
}

// Shuffle Array (Fisher-Yates Algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Get Random Questions
function getRandomQuestions() {
    const shuffledQuestions = shuffleArray([...allQuestions]);
    return shuffledQuestions.slice(0, 10);
}

// Update Progress Bar
function updateProgressBar() {
    const progressFill = document.getElementById("progressFill");
    const progressPercentage = (currentQuestionIndex / currentQuestions.length) * 100;
    progressFill.style.width = `${progressPercentage}%`;
}

// Create Card Element
function createCard(questionText) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.textContent = questionText;
    return card;
}

// Show Next Card
function showNextCard() {
    if (currentQuestionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const cardElement = createCard(currentQuestion.question);
    document.getElementById("gameContainer").appendChild(cardElement);

    const hammer = new Hammer(cardElement);
    hammer.on("swipeleft", () => handleAnswer(cardElement, "no"));
    hammer.on("swiperight", () => handleAnswer(cardElement, "yes"));

    currentQuestionIndex++;
    updateProgressBar();
}

// Handle Player's Answer
function handleAnswer(cardElement, userAnswer) {
    const currentQuestion = currentQuestions[currentQuestionIndex - 1];
    if (userAnswer === currentQuestion.correctAnswer) {
        score += 10;
        showConfetti();
    } else {
        showThunder();
    }
    cardElement.classList.add(userAnswer === "yes" ? "glow-right" : "glow-left");
    setTimeout(() => flyAway(cardElement, userAnswer === "yes" ? "right" : "left"), 200);
}

// Fly Away Animation
function flyAway(cardElement, direction) {
    cardElement.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    cardElement.style.transform = `
        translate(${direction === "right" ? "100vw" : "-100vw"}, 0)
        rotate(${direction === "right" ? "30deg" : "-30deg"})
    `;
    cardElement.style.opacity = "0";
    setTimeout(() => {
        cardElement.remove();
        showNextCard();
    }, 500);
}

// Confetti Effect
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

// Thunder Effect
function showThunder() {
    const thunder = document.createElement("div");
    thunder.classList.add("thunder");
    document.body.appendChild(thunder);
    setTimeout(() => thunder.remove(), 500);
}

// End Game Screen
function endGame() {
    const endScreen = document.getElementById("endScreen");
    const finalScoreElement = document.getElementById("finalScore");
    const resultImage = document.getElementById("resultImage");

    // Update the final score
    finalScoreElement.textContent = score;

    // Determine the result image based on the score
    let imageUrl;
    if (score >= 90) {
        imageUrl = "imgs/100.jpg"; // High score image
    } else if (score >= 50) {
        imageUrl = "imgs/60-80.jpg"; // Medium score image
    } else {
        imageUrl = "imgs/Failed02.jpg"; // Low score image
    }

    // Preload the image to ensure it's fully loaded before showing the end screen
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
        // Once the image is loaded, set it as the source for the resultImage element
        resultImage.src = imageUrl;

        // Show the end screen only after the image is ready
        endScreen.style.display = "flex";
    };

    img.onerror = () => {
        console.error("Failed to load result image:", imageUrl);
        alert("אירעה שגיאה בטעינת התמונה.");
    };
}

// Restart Game
function restartGame() {
    document.getElementById("endScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";
    currentQuestions = getRandomQuestions();
    currentQuestionIndex = 0;
    score = 0;
    updateProgressBar();
    showNextCard();
}

// Share Results via WhatsApp/Email
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

// Initialize Game on Page Load
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startGameButton").addEventListener("click", async () => {
        await loadQuestionsFromCSV();
        document.getElementById("welcomePage").style.display = "none";
        document.getElementById("gameContainer").style.display = "block";
        currentQuestions = getRandomQuestions();
        showNextCard();
    });

    document.getElementById("restartButton").addEventListener("click", restartGame);
    document.getElementById("shareWhatsApp").addEventListener("click", () => shareResults("whatsapp"));
    document.getElementById("shareEmail").addEventListener("click", () => shareResults("email"));
});