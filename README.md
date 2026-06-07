# Lab Examination Portal

A complete web-based lab examination system with code execution, observation tracking, and automated evaluation.

## Features

### For Students
1. **Student Login** - Name and Register Number authentication
2. **Random Question Assignment** - Get a random programming question from the admin's question bank
3. **Code Editor** - Write and execute JavaScript code directly in the browser
4. **Output Verification** - Automatic verification of code output against expected results
5. **Observation Section** - Write detailed observations (10 marks)
6. **MCQ Test** - Answer 10 multiple-choice questions (1 mark each)
7. **90-Minute Timer** - Auto-submit when time expires
8. **Anti-Cheating** - Tab switch detection and monitoring
9. **PDF Export** - Download complete exam report with code, output, and marks

### For Administrators
1. **Question Bank Management** - Create, edit, and delete programming questions
2. **MCQ Configuration** - Add 10 MCQs per question with 4 options each
3. **Student Results Dashboard** - View all student submissions
4. **Search & Filter** - Find students by name, register number, or question
5. **Export Results** - Download all results as JSON
6. **Statistics** - View average scores, total students, and submission counts

## Exam Structure

**Total Marks: 50**
- **Programming**: 30 marks (auto-graded if output matches)
- **Observation**: 10 marks (manual/auto)
- **MCQ**: 10 marks (10 questions × 1 mark, auto-graded)

## How to Use

### Admin Setup

1. **Access Admin Panel**
   - Click "Admin Panel" from login page
   - Click "Manage Questions" button

2. **Create Questions**
   - Click "Add New Question"
   - Fill in:
     - Question Title
     - Problem Description
     - Difficulty Level
     - Expected Output (for verification)
     - 10 MCQ Questions with options and correct answers
   - Click "Save Question"

3. **View Results**
   - Return to Admin Panel
   - View all student submissions
   - Filter by student name or question
   - Export results as needed

### Student Workflow

1. **Login**
   - Enter your full name
   - Enter your register number
   - Click "Login to Exam"

2. **Get Question**
   - Click "Get Random Question" on dashboard
   - Review the question assigned
   - Click "Start Lab Examination"

3. **Complete Exam Sections**

   **Programming Section:**
   - Read the problem statement
   - Write your JavaScript code
   - Click "Run Code" to test
   - Verify output matches expected result

   **Observation Section:**
   - Write detailed observations about your approach
   - Explain challenges and solutions
   - Marks: 0-10 (can be auto-assigned)

   **MCQ Section:**
   - Answer all 10 questions
   - Select one option per question
   - Each correct answer = 1 mark

4. **Submit**
   - Review all sections
   - Click "Submit Exam"
   - View your results

5. **Download PDF**
   - Download complete exam report
   - Includes code, output, observation, and marks

## Technical Details

- **Frontend**: React + TypeScript + Tailwind CSS
- **Code Execution**: Browser-based JavaScript execution (safe sandboxed environment)
- **Data Storage**: localStorage (browser-based)
- **PDF Generation**: jsPDF library
- **Timer**: 90 minutes with auto-submit
- **Anti-Cheating**: Tab visibility detection

## Data Storage

All data is stored locally in the browser's localStorage:
- `adminQuestions` - Question bank created by admin
- `examResults` - All student exam submissions
- `currentStudent` - Active student session

## Security Features

1. Tab switch monitoring
2. Time-limited exam (90 minutes)
3. Auto-submit on timeout
4. Code execution in sandboxed environment
5. Output verification

## Limitations

- **Browser-based storage**: Data is stored locally. Clearing browser data will erase all questions and results.
- **JavaScript only**: Code execution currently supports JavaScript only.
- **Client-side execution**: Code runs in the browser, not on a server.
- **Single device**: Students must complete exam on the same device/browser.

## Future Enhancements

For production use, consider:
- Backend database (Supabase, Firebase, etc.)
- Multi-language code execution (Python, Java, C++)
- Server-side code execution for security
- Real-time proctoring
- Advanced plagiarism detection
- Automatic code quality analysis

## Support

For issues or questions, contact your system administrator.

---

© 2026 Lab Examination System
