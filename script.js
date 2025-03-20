// Game Variables
let allQuestions = []; // Stores all questions loaded from CSV
let currentQuestions = []; // Stores the current shuffled set of questions for the game
let currentQuestionIndex = 0; // Tracks the current question index
let score = 0; // Tracks the player's score

// Load Questions from CSV File
async function loadQuestionsFromCSV() {
    try {
        // Fetch the CSV file
        const response = await fetch("questions.csv");
        if (!response.ok) throw new Error("Failed to load CSV file");

        // Parse CSV content using PapaParse
        const csvText = await response.text();
        const parsedData = Papa.parse(csvText, {
            header: true, // Use first row as headers
            skipEmptyLines: true // Ignore empty lines
        });

        // Validate parsed data
        allQuestions = parsedData.data.filter(question => 
            question.question && question.correctAnswer // Ensure required fields exist
        );
        
        console.log("Loaded questions:", allQuestions);
        
    } catch (error) {
        // Handle loading errors
        console.error("CSV Loading Error:", error);
        alert("אירעה שגיאה בטעינת השאלות. אנא ודא שקובץ questions.csv קיים ותקין.");
        allQuestions = []; // Reset to empty array on error
    }
}

// Fisher-Yates Array Shuffling Algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

// Get Random Subset of Questions for Game Session
function getRandomQuestions() {
    // Create a copy of all questions to avoid modifying original array
    const shuffledQuestions = shuffleArray([...allQuestions]); 
    return shuffledQuestions.slice(0, 10); // Return first 10 shuffled questions
}

// Create Card Element
function createCard(questionText) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.textContent = questionText;
    return card;
}

// Display Next Question Card
function showNextCard() {
    // Check if game has ended
    if (currentQuestionIndex >= currentQuestions.length) {
        endGame();
        return;
    }

    // Create and display new card
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const cardElement = createCard(currentQuestion.question);
    document.getElementById("gameContainer").appendChild(cardElement);

    // Initialize swipe gestures with Hammer.js
    const hammer = new Hammer(cardElement);
    hammer.on("swipeleft", () => handleAnswer(cardElement, "no"));
    hammer.on("swiperight", () => handleAnswer(cardElement, "yes"));

    currentQuestionIndex++; // Move to next question
}

// Handle Player's Answer
function handleAnswer(cardElement, userAnswer) {
    const currentQuestion = currentQuestions[currentQuestionIndex - 1];
    
    // Check answer correctness
    if (userAnswer === currentQuestion.correctAnswer) {
        score += 10;
        showConfetti();
    } else {
        showThunder();
    }

    // Add visual feedback
    cardElement.classList.add(userAnswer === "yes" ? "glow-right" : "glow-left");
    
    // Animate card exit after 200ms delay
    setTimeout(() => {
        flyAway(cardElement, userAnswer === "yes" ? "right" : "left");
    }, 200);
}

// Card Exit Animation
function flyAway(cardElement, direction) {
    // Set exit animation properties
    cardElement.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    cardElement.style.transform = `
        translate(${direction === "right" ? "100vw" : "-100vw"}, 0)
        rotate(${direction === "right" ? "30deg" : "-30deg"})
    `;
    cardElement.style.opacity = "0";

    // Remove card and proceed after animation completes
    setTimeout(() => {
        cardElement.remove();
        showNextCard();
    }, 500);
}

// Confetti Effect for Correct Answers
function showConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        
        // Randomize confetti properties
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animationDuration = `${Math.random() * 2 + 1}s`;
        confetti.style.backgroundColor = 
            ["#ffcc00", "#ff6666", "#66ccff"][Math.floor(Math.random() * 3)];
        
        document.body.appendChild(confetti);
        
        // Clean up confetti after animation
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Thunder Effect for Incorrect Answers
function showThunder() {
    const thunder = document.createElement("div");
    thunder.classList.add("thunder");
    document.body.appendChild(thunder);
    
    // Remove thunder effect after animation completes
    setTimeout(() => thunder.remove(), 500);
}

// End Game Screen
function endGame() {
    const endScreen = document.getElementById("endScreen");
    const finalScore = document.getElementById("finalScore");
    const resultImage = document.getElementById("resultImage");
    
    // Update score display
    finalScore.textContent = score;
    
    // Determine result image based on score
    if (score >= 90) {
        resultImage.src = "imgs/100.jpg"; // High score image
    } else if (score >= 50) {
        resultImage.src = "imgs/60-80.jpg"; // Medium score image
    } else {
        resultImage.src = "imgs/Failed02.jpg"; // Low score image
    }
    
    // Show end screen
    endScreen.style.display = "flex";
}

// Restart Game
function restartGame() {
    // Reset game state
    document.getElementById("endScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";
    currentQuestions = getRandomQuestions();
    currentQuestionIndex = 0;
    score = 0;
    
    // Start new game session
    showNextCard();
}

// Share Results via WhatsApp/Email
function shareResults(platform) {
    const scoreText = `השגתי ${score} נקודות במשחק תרבות הדיון! 🎉`;
    const shareImage = document.getElementById("resultImage").src;

    try {
        if (platform === "whatsapp") {
            // WhatsApp sharing URL
            window.open(
                `https://wa.me/?text=${encodeURIComponent(scoreText)}%0A${shareImage}`,
                "_blank"
            );
        } else if (platform === "email") {
            // Email sharing URL
            window.location.href = 
                `mailto:?subject=תוצאות המשחק&body=${encodeURIComponent(scoreText)}%0A${shareImage}`;
        }
    } catch (error) {
        alert("אירעה שגיאה בעת השיתוף. אנא נסה שוב.");
    }
}

// Initialize Game on Page Load
document.addEventListener("DOMContentLoaded", () => {
    // Start game when button is clicked
    document.getElementById("startGameButton").addEventListener("click", async () => {
        await loadQuestionsFromCSV(); // Load questions from CSV
        document.getElementById("welcomePage").style.display = "none";
        document.getElementById("gameContainer").style.display = "block";
        currentQuestions = getRandomQuestions(); // Get shuffled questions
        showNextCard(); // Start gameplay
    });

    // Restart button listener
    document.getElementById("restartButton").addEventListener("click", restartGame);
    
    // Sharing buttons listeners
    document.getElementById("shareWhatsApp").addEventListener("click", () => shareResults("whatsapp"));
    document.getElementById("shareEmail").addEventListener("click", () => shareResults("email"));
});