let allQuestions = [];

// Load CSV on page load
async function loadCSV() {
    try {
        const response = await fetch("questions.csv");
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true });
        allQuestions = parsed.data;
        renderQuestionsList();
    } catch (error) {
        console.error("Error loading CSV:", error);
        allQuestions = [];
    }
}

// Save to CSV
function exportToCSV() {
    const csv = Papa.unparse(allQuestions);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions.csv";
    a.click();
    URL.revokeObjectURL(url);
}

// Render Questions List
function renderQuestionsList() {
    const container = document.getElementById("questionsList");
    container.innerHTML = "";
    allQuestions.forEach((q, index) => {
        const div = document.createElement("div");
        div.className = "questionItem";
        div.innerHTML = `
            <span>${q.question} (${q.correctAnswer})</span>
            <button onclick="deleteQuestion(${index})">מחק</button>
        `;
        container.appendChild(div);
    });
}

// Add New Question
function addQuestion() {
    const question = document.getElementById("newQuestion").value.trim();
    const answer = document.getElementById("newAnswer").value;
    if (question) {
        allQuestions.push({ question, correctAnswer: answer });
        document.getElementById("newQuestion").value = "";
        renderQuestionsList();
    }
}

// Delete Question
function deleteQuestion(index) {
    if (confirm("האם אתה בטוח שברצונך למחוק את השאלה?")) {
        allQuestions.splice(index, 1);
        renderQuestionsList();
    }
}

// Initialize
loadCSV();

// Event Listeners
document.getElementById("addQuestionButton").addEventListener("click", addQuestion);
document.getElementById("exportQuestionsButton").addEventListener("click", exportToCSV);