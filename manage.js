class QuestionManager {
    constructor() {
        this.allQuestions = [];
        this.currentInterface = 'questions';
        this.initElements();
        this.setupEventListeners();
        this.loadQuestions();
    }

    initElements() {
        this.elements = {
            // Navigation
            showQuestionsBtn: document.getElementById('showQuestionsBtn'),
            newQuestionBtn: document.getElementById('newQuestionBtn'),
            importBtn: document.getElementById('importBtn'),
            exportBtn: document.getElementById('exportBtn'),
            
            // Interfaces
            questionsInterface: document.getElementById('questionsInterface'),
            newQuestionInterface: document.getElementById('newQuestionInterface'),
            importInterface: document.getElementById('importInterface'),
            exportInterface: document.getElementById('exportInterface'),
            
            // Questions List
            questionsListContainer: document.getElementById('questionsListContainer'),
            
            // New Question Form
            newQuestionForm: document.getElementById('newQuestionForm'),
            newQuestionText: document.getElementById('newQuestionText'),
            newQuestionAnswer: document.getElementById('newQuestionAnswer'),
            newQuestionExplanation: document.getElementById('newQuestionExplanation'),
            cancelNewQuestion: document.getElementById('cancelNewQuestion'),
            
            // Import
            csvFileInput: document.getElementById('csvFileInput'),
            fileNameDisplay: document.getElementById('fileNameDisplay'),
            cancelImport: document.getElementById('cancelImport'),
            confirmImport: document.getElementById('confirmImport'),
            
            // Export
            cancelExport: document.getElementById('cancelExport'),
            confirmExport: document.getElementById('confirmExport'),
            
            // Status
            statusMessage: document.getElementById('statusMessage')
        };
    }

    setupEventListeners() {
        // Navigation
        this.elements.showQuestionsBtn.addEventListener('click', () => this.showInterface('questions'));
        this.elements.newQuestionBtn.addEventListener('click', () => this.showInterface('newQuestion'));
        this.elements.importBtn.addEventListener('click', () => this.showInterface('import'));
        this.elements.exportBtn.addEventListener('click', () => this.showInterface('export'));
        
        // New Question
        this.elements.newQuestionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addQuestion();
        });
        this.elements.cancelNewQuestion.addEventListener('click', () => this.showInterface('questions'));
        
        // Import
        this.elements.csvFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.elements.cancelImport.addEventListener('click', () => this.showInterface('questions'));
        this.elements.confirmImport.addEventListener('click', () => this.importQuestions());
        
        // Export
        this.elements.cancelExport.addEventListener('click', () => this.showInterface('questions'));
        this.elements.confirmExport.addEventListener('click', () => this.exportToCSV());
    }

    showInterface(interfaceName) {
        // Update navigation
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.management-interface').forEach(div => div.classList.remove('active'));
        
        // Show selected interface
        this.currentInterface = interfaceName;
        document.getElementById(`${interfaceName}Btn`).classList.add('active');
        document.getElementById(`${interfaceName}Interface`).classList.add('active');

        // Always refresh questions list when showing it
    if (interfaceName === 'questions') {
        this.renderQuestionsList();
    }
    
    }

    async loadQuestions() {
        try {
            const response = await fetch('questions.csv');
            if (!response.ok) throw new Error('Failed to load questions');
            
            const csvText = await response.text();
            const parsed = Papa.parse(csvText, { 
                header: true,
                skipEmptyLines: true 
            });
            
            this.allQuestions = parsed.data.filter(q => 
                q.question && q.correctAnswer && ['yes', 'no'].includes(q.correctAnswer.toLowerCase())
            );
            
            this.renderQuestionsList();
            this.showStatus('טעינת שאלות הושלמה בהצלחה', 'success');
        } catch (error) {
            console.error('Error loading questions:', error);
            this.showStatus('שגיאה בטעינת השאלות', 'error');
            this.allQuestions = [];
        }
    }

    renderQuestionsList() {
        this.elements.questionsListContainer.innerHTML = '';
        
        if (this.allQuestions.length === 0) {
            this.elements.questionsListContainer.innerHTML = '<p class="no-questions">אין שאלות להצגה</p>';
            return;
        }
        
        this.allQuestions.forEach((question, index) => {
            const questionEl = document.createElement('div');
            questionEl.className = 'question-item';
            questionEl.dataset.index = index;
            questionEl.innerHTML = `
                <div class="question-text">${question.question}</div>
                <div class="question-meta">
                    תשובה: ${question.correctAnswer === 'yes' ? 'כן' : 'לא'}
                </div>
                <div class="question-actions">
                    <div class="form-group">
                        <textarea id="editQuestion_${index}" rows="3">${question.question}</textarea>
                    </div>
                    <div class="form-group">
                        <select id="editAnswer_${index}">
                            <option value="yes" ${question.correctAnswer === 'yes' ? 'selected' : ''}>כן</option>
                            <option value="no" ${question.correctAnswer === 'no' ? 'selected' : ''}>לא</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <textarea id="editExplanation_${index}" rows="2">${question.exp || ''}</textarea>
                    </div>
                    <div class="form-actions">
                        <button class="secondary-button cancel-edit">ביטול</button>
                        <button class="primary-button save-edit">שמור שינויים</button>
                        <button class="secondary-button delete-question">מחק שאלה</button>
                    </div>
                </div>
            `;
            
            // Add event listeners
            questionEl.addEventListener('click', (e) => {
                if (!e.target.closest('.question-actions')) {
                    questionEl.classList.toggle('active');
                }
            });
            
            questionEl.querySelector('.save-edit').addEventListener('click', () => {
                this.saveQuestionEdit(index);
            });
            
            questionEl.querySelector('.cancel-edit').addEventListener('click', () => {
                questionEl.classList.remove('active');
            });
            
            questionEl.querySelector('.delete-question').addEventListener('click', () => {
                if (confirm('האם אתה בטוח שברצונך למחוק את השאלה?')) {
                    this.deleteQuestion(index);
                }
            });
            
            this.elements.questionsListContainer.appendChild(questionEl);
        });
    }

    saveQuestionEdit(index) {
        const questionEl = document.querySelector(`.question-item[data-index="${index}"]`);
        const question = document.getElementById(`editQuestion_${index}`).value.trim();
        const answer = document.getElementById(`editAnswer_${index}`).value;
        const explanation = document.getElementById(`editExplanation_${index}`).value.trim();
        
        if (!question) {
            this.showStatus('אנא הזן שאלה', 'error');
            return;
        }
        
        this.allQuestions[index] = {
            question,
            correctAnswer: answer,
            exp: explanation
        };
        
        questionEl.classList.remove('active');
        this.showStatus('שאלה עודכנה בהצלחה', 'success');
    }

    deleteQuestion(index) {
        this.allQuestions.splice(index, 1);
        this.renderQuestionsList();
        this.showStatus('שאלה נמחקה בהצלחה', 'success');
    }

    addQuestion() {
        const question = this.elements.newQuestionText.value.trim();
        const answer = this.elements.newQuestionAnswer.value;
        const explanation = this.elements.newQuestionExplanation.value.trim();
        
        if (!question) {
            this.showStatus('אנא הזן שאלה', 'error');
            return;
        }
        
        this.allQuestions.push({
            question,
            correctAnswer: answer,
            exp: explanation
        });
        
        this.elements.newQuestionForm.reset();
        this.showInterface('questions');
        this.renderQuestionsList();
        this.showStatus('שאלה נוספה בהצלחה', 'success');
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.elements.fileNameDisplay.textContent = file.name;
        this.elements.confirmImport.disabled = false;
    }

    importQuestions() {
        const file = this.elements.csvFileInput.files[0];
        if (!file) return;
        
        if (file.size > 1024 * 1024) { // 1MB limit
            this.showStatus('גודל הקובץ גדול מדי. אנא בחר קובץ עד 1MB.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = Papa.parse(e.target.result, {
                    header: true,
                    skipEmptyLines: true
                });
                
                if (!parsed.meta.fields.includes('question') || 
                    !parsed.meta.fields.includes('correctAnswer')) {
                    throw new Error('Invalid CSV format');
                }
                
                this.allQuestions = parsed.data.filter(q => 
                    q.question && q.correctAnswer && ['yes', 'no'].includes(q.correctAnswer.toLowerCase())
                );
                
                this.elements.csvFileInput.value = '';
                this.elements.fileNameDisplay.textContent = 'לא נבחר קובץ';
                this.elements.confirmImport.disabled = true;
                
                this.showInterface('questions');
                this.renderQuestionsList();
                this.showStatus(`טעינת ${this.allQuestions.length} שאלות הושלמה`, 'success');
            } catch (error) {
                console.error('Error parsing CSV:', error);
                this.showStatus('שגיאה בקריאת הקובץ. אנא ודא שהפורמט תקין.', 'error');
            }
        };
        
        reader.onerror = () => {
            this.showStatus('שגיאה בקריאת הקובץ', 'error');
        };
        
        reader.readAsText(file, 'UTF-8');
    }

    exportToCSV() {
        try {
            if (this.allQuestions.length === 0) {
                this.showStatus('אין שאלות לייצוא', 'error');
                return;
            }
            
            const csv = Papa.unparse(this.allQuestions);
            const bom = '\uFEFF';
            const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `questions_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            this.showInterface('questions');
            this.showStatus('ייצוא שאלות הושלם בהצלחה', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showStatus('שגיאה בייצוא השאלות', 'error');
        }
    }

    showStatus(message, type = 'success') {
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.className = `status-message ${type}`;
        
        setTimeout(() => {
            this.elements.statusMessage.textContent = '';
            this.elements.statusMessage.className = 'status-message';
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuestionManager();
});