// Array to store all questions loaded from the CSV file or added manually
let allQuestions = [];

/**
 * Load questions from the `questions.csv` file when the page loads.
 * Uses PapaParse to parse the CSV data into an array of objects.
 */
async function loadCSV() {
    try {
        // Fetch the CSV file
        const response = await fetch("questions.csv");
        if (!response.ok) throw new Error("Failed to load CSV file");

        // Parse the CSV content using PapaParse
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true });

        // Filter out invalid questions (those missing a question or answer)
        allQuestions = parsed.data.filter(q => q.question && q.correctAnswer);

        // Render the list of questions on the page
        renderQuestionsList();
    } catch (error) {
        // Handle errors gracefully
        console.error("Error loading CSV:", error);
        allQuestions = [];
    }
}

/**
 * Export the current list of questions to a CSV file.
 * Ensures UTF-8 encoding to support Hebrew characters.
 */
function exportToCSV() {
    // Convert the `allQuestions` array back into a CSV string
    const csv = Papa.unparse(allQuestions, {
        encoding: "utf8" // Ensure UTF-8 encoding for Hebrew text
    });

    // Create a downloadable Blob object
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions.csv"; // Set the filename
    a.click();

    // Clean up the temporary URL
    URL.revokeObjectURL(url);
}

/**
 * Render the list of questions dynamically in the UI.
 * Each question includes a "Delete" button to remove it.
 */
function renderQuestionsList() {
    const container = document.getElementById("questionsList");
    container.innerHTML = ""; // Clear the existing list

    // Loop through all questions and create a UI element for each
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

/**
 * Add a new question to the list.
 * Validates input before adding the question.
 */
function addQuestion() {
    // Get the question text and selected answer from the form
    const question = document.getElementById("newQuestion").value.trim();
    const answer = document.getElementById("newAnswer").value;

    // Validate that the question is not empty
    if (question) {
        allQuestions.push({ question, correctAnswer: answer }); // Add to the array
        document.getElementById("newQuestion").value = ""; // Clear the input field
        renderQuestionsList(); // Re-render the list
    }
}

/**
 * Delete a question from the list by its index.
 * Confirms with the user before deletion.
 */
function deleteQuestion(index) {
    if (confirm("האם אתה בטוח שברצונך למחוק את השאלה?")) {
        allQuestions.splice(index, 1); // Remove the question from the array
        renderQuestionsList(); // Re-render the list
    }
}

/**
 * Load questions from an uploaded CSV file.
 * Parses the file and replaces the current list of questions.
 */
function loadQuestionsFromUploadedCSV(file) {
    const reader = new FileReader();

    // Handle successful file reading
    reader.onload = async (event) => {
        try {
            const csvText = event.target.result; // Get the file content
            const parsed = Papa.parse(csvText, { header: true });

            // Filter out invalid questions
            allQuestions = parsed.data.filter(q => q.question && q.correctAnswer);

            // Re-render the list of questions
            renderQuestionsList();
        } catch (error) {
            // Handle parsing errors
            console.error("Error parsing uploaded CSV:", error);
            alert("אירעה שגיאה בטעינת השאלות מהקובץ.");
        }
    };

    // Handle file reading errors
    reader.onerror = () => {
        console.error("Error reading uploaded file.");
        alert("אירעה שגיאה בקריאת הקובץ.");
    };

    // Read the file as text with UTF-8 encoding
    reader.readAsText(file, "UTF-8");
}

/**
 * Initialize the management page.
 * Loads questions from the CSV file when the page loads.
 */
loadCSV();

/**
 * Event Listeners for Buttons
 */

// Add a new question when the "Add Question" button is clicked
document.getElementById("addQuestionButton").addEventListener("click", addQuestion);

// Export questions to CSV when the "Export Questions" button is clicked
document.getElementById("exportQuestionsButton").addEventListener("click", exportToCSV);

// Load questions from an uploaded CSV file when a file is selected
document.getElementById("uploadCSV").addEventListener("change", (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
        loadQuestionsFromUploadedCSV(file); // Load questions from the file
    }
});