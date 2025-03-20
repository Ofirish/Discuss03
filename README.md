# **  הדיון - משחק קלפים (Discussion Culture - Card Game)**

Welcome to **תרבות הדיון**, an interactive card-based game designed to promote respectful and constructive discussions. Players answer questions by swiping left ("No") or right ("Yes"), earning points for correct answers. The game provides feedback through visual effects, such as confetti for correct answers and thunder for incorrect ones.

---

## **Features**
- **Dynamic Question Loading**: Questions are loaded dynamically from a CSV file (`questions.csv`) for easy management.
- **Swipe Gestures**: Use swipe gestures (left for "No", right for "Yes") to answer questions.
- **Visual Feedback**:
  - **Confetti Effect**: Celebrates correct answers.
  - **Thunder Effect**: Indicates incorrect answers.
  - **Card Glow**: Cards glow green for "Yes" and red for "No".
- **Progress Bar**: Tracks the player's progress through the game.
- **End Screen**: Displays the final score and a result image based on performance.
- **Sharing Options**: Share results via WhatsApp or email.
- **Customizable Questions**: Add, edit, or delete questions using the management page (`manage.html`).

---

## **File Structure**
```
/game
  ├── index.html        // Main game interface
  ├── manage.html       // Question management interface
  ├── styles.css        // Shared CSS styles
  ├── script.js         // Game logic
  ├── manage.js         // Management page logic
  ├── questions.csv     // Questions data
  └── imgs/             // Folder for images
      ├── ptb.jpg       // Poker table background
      ├── cardpaper.jpg // Card texture
      ├── 100.jpg       // Result image for high score
      ├── 60-80.jpg     // Result image for medium score
      └── Failed02.jpg  // Result image for low score
```

---

## **Setup Instructions**

### **Prerequisites**
1. Ensure you have a modern web browser (e.g., Chrome, Firefox, Edge).
2. Download the project files or clone the repository.

### **Steps to Run Locally**
1. **Download Files**:
   - Download the entire `/game` folder, including all HTML, CSS, JavaScript, and image files.

2. **Prepare Images**:
   - Place your background and card images in the `imgs/` folder:
     - `ptb.jpg`: Poker table texture.
     - `cardpaper.jpg`: Card texture overlay.
     - `100.jpg`, `60-80.jpg`, `Failed02.jpg`: Result images for different score ranges.

3. **Prepare Questions**:
   - Open the `questions.csv` file and add your questions in the following format:
     ```
     question,correctAnswer
     האם ניתן להשיג את מטרת הדיון בדרך אחרת?,no
     האם יש להזמין רק את הנדרשים לדיון?,yes
     ```

4. **Run the Game**:
   - Open `index.html` in your browser to start the game.
   - Open `manage.html` in your browser to manage questions.

---

## **How to Play**
1. **Start the Game**:
   - Click the "התחל משחק" button on the welcome screen.
   - Swipe right ("Yes") or left ("No") to answer questions.

2. **Track Progress**:
   - A progress bar at the top of the screen shows your progress through the 10 questions.

3. **End Screen**:
   - After answering all questions, the game displays your final score and a result image.
   - Share your results via WhatsApp or email.

4. **Restart**:
   - Click "שחק שוב" to restart the game with a new set of shuffled questions.

---

## **Management Page**
The `manage.html` page allows you to:
- **Add New Questions**:
  - Enter a question and select the correct answer ("Yes" or "No").
  - Click "הוסף שאלה" to add it to the list.
- **Edit/Delete Questions**:
  - Each question has a "מחק" button to remove it.
- **Export Questions**:
  - Click "ייצא שאלות ל-CSV" to download an updated `questions.csv` file.

---

## **Dependencies**
The game uses the following external libraries:
- **Hammer.js**: For swipe gesture detection.
  - CDN: `<script src="https://cdn.jsdelivr.net/npm/hammerjs@2.0.8/hammer.min.js"></script>`
- **PapaParse**: For parsing the CSV file.
  - CDN: `<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>`

---

## **Troubleshooting**
### 1. **Questions Not Loading**
- Ensure the `questions.csv` file is in the same directory as `index.html`.
- Verify that the file contains valid data in the format `question,correctAnswer`.

### 2. **Images Not Displaying**
- Ensure all required images are placed in the `imgs/` folder.
- Check the file names and paths in `styles.css` and `script.js`.

### 3. **Swipe Gestures Not Working**
- Ensure Hammer.js is properly included in the HTML file.
- Test on a device or browser that supports touch gestures.

### 4. **Sharing Results Fails**
- Ensure the `mailto:` protocol is supported by your email client.
- Check your internet connection for WhatsApp sharing.

---

## **Contributing**
If you'd like to contribute to this project:
1. Fork the repository.
2. Create a new branch for your changes.
3. Submit a pull request with a detailed description of your updates.

---

## **License**
This project is licensed under the **MIT License**. You are free to use, modify, and distribute the code for personal or commercial purposes.

---

## **Contact**
For questions, feedback, or support:
- Email: [your-email@example.com]
- GitHub: [your-github-username]

---

Enjoy playing **תרבות הדיון** and fostering respectful discussions! 🎉
