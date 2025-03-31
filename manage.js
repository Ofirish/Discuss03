// Question Management System
class QuestionManager {
    constructor() {
        this.allQuestions = [];
        this.initElements();
        this.setupEventListeners();
        this.loadQuestions();
    }

    initElements() {
        this.elements = {
            questionForm: document.getElementById('questionForm'),
            addQuestionBtn: document.getElementById('addQuestionButton'),
            newQuestion: document.getElementById('newQuestion'),
            newAnswer: document.getElementById('newAnswer'),
            newExplanation: document.getElementById('newExplanation'),
            uploadCSV: document.getElementById('uploadCSV'),
            exportBtn: document.getElementById('exportQuestionsButton'),
            questionsList: document.getElementById('questionsList'),
            questionsCount: document.getElementById('questionsCount'),
            statusMessage: document.getElementById('statusMessage'),
            editModal: document.getElementById('editModal'),
            editForm: document.getElementById('editQuestionForm'),
            editQuestionId: document.getElementById('editQuestionId'),
            editQuestionText: document.getElementById('editQuestionText'),
            editAnswer: document.getElementById('editAnswer'),
            editExplanation: document.getElementById('editExplanation'),
            closeModal: document.querySelector('.close-modal')
        };
    }

    setupEventListeners() {
        // Add new question
        this.elements.addQuestionBtn.addEventListener('click', () => this.addQuestion());
        
        // Import/Export
        this.elements.uploadCSV.addEventListener('change', (e) => this.handleFileUpload(e));
        this.elements.exportBtn.addEventListener('click', () => this.exportToCSV());
        
        // Edit modal
        this.elements.closeModal.addEventListener('click', () => this.closeModal());
        this.elements.editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedQuestion();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.editModal) {
                this.closeModal();
            }
        });
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
        this.elements.questionsList.innerHTML = '';
        
        if (this.allQuestions.length === 0) {
            this.elements.questionsList.innerHTML = '<p class="no-questions">אין שאלות להצגה</p>';
            this.elements.questionsCount.textContent = '0';
            return;
        }
        
        this.allQuestions.forEach((question, index) => {
            const questionEl = document.createElement('div');
            questionEl.className = 'question-item';
            questionEl.innerHTML = `
                <div class="question-text">${question.question}</div>
                <div class="question-meta">
                    <span>תשובה: ${question.correctAnswer === 'yes' ? 'כן' : 'לא'}</span>
                    ${question.exp ? `<span class="question-explanation">הסבר: ${question.exp.substring(0, 30)}...</span>` : ''}
                </div>
                <div class="question-actions">
                    <button class="edit-btn" data-index="${index}">ערוך</button>
                    <button class="delete-btn" data-index="${index}">מחק</button>
                </div>
            `;
            
            this.elements.questionsList.appendChild(questionEl);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.openEditModal(parseInt(e.target.dataset.index)));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteQuestion(parseInt(e.target.dataset.index)));
        });
        
        this.elements.questionsCount.textContent = this.allQuestions.length;
    }

    addQuestion() {
        const question = this.elements.newQuestion.value.trim();
        const answer = this.elements.newAnswer.value;
        const explanation = this.elements.newExplanation.value.trim();
        
        if (!question) {
            this.showStatus('אנא הזן שאלה', 'error');
            return;
        }
        
        this.allQuestions.push({
            question,
            correctAnswer: answer,
            exp: explanation
        });
        
        this.elements.questionForm.reset();
        this.renderQuestionsList();
        this.showStatus('שאלה נוספה בהצלחה', 'success');
    }

    openEditModal(index) {
        const question = this.allQuestions[index];
        this.elements.editQuestionId.value = index;
        this.elements.editQuestionText.value = question.question;
        this.elements.editAnswer.value = question.correctAnswer;
        this.elements.editExplanation.value = question.exp || '';
        this.elements.editModal.style.display = 'flex';
    }

    saveEditedQuestion() {
        const index = this.elements.editQuestionId.value;
        const question = this.elements.editQuestionText.value.trim();
        const answer = this.elements.editAnswer.value;
        const explanation = this.elements.editExplanation.value.trim();
        
        if (!question) {
            this.showStatus('אנא הזן שאלה', 'error');
            return;
        }
        
        this.allQuestions[index] = {
            question,
            correctAnswer: answer,
            exp: explanation
        };
        
        this.closeModal();
        this.renderQuestionsList();
        this.showStatus('שאלה עודכנה בהצלחה', 'success');
    }

    deleteQuestion(index) {
        if (confirm('האם אתה בטוח שברצונך למחוק את השאלה?')) {
            this.allQuestions.splice(index, 1);
            this.renderQuestionsList();
            this.showStatus('שאלה נמחקה בהצלחה', 'success');
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file size
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
                
                // Validate CSV structure
                if (!parsed.meta.fields.includes('question') || 
                    !parsed.meta.fields.includes('correctAnswer')) {
                    throw new Error('Invalid CSV format');
                }
                
                // Filter valid questions
                this.allQuestions = parsed.data.filter(q => 
                    q.question && q.correctAnswer && ['yes', 'no'].includes(q.correctAnswer.toLowerCase())
                );
                
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
            
            this.showStatus('ייצוא שאלות הושלם בהצלחה', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showStatus('שגיאה בייצוא השאלות', 'error');
        }
    }

    closeModal() {
        this.elements.editModal.style.display = 'none';
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