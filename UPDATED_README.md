# Lab Examination Portal - Updated Version

A complete web-based lab examination system with multi-language code execution, admin-controlled evaluation, and automated grading.

## 🆕 What's New

### Admin Features
1. ✅ **Admin Login** - Secure login with credentials (Username: `sscet`, Password: `adminsscet@2026`)
2. ✅ **Student Registration System** - Admin must register students before they can access exams
3. ✅ **Multi-Language Support** - Questions can be configured for JavaScript, Python, Java, C, or C++
4. ✅ **Manual Observation Marks** - Admin can add/edit observation marks for each student after exam completion
5. ✅ **Viva Questions** - Renamed from MCQ (same format: 10 questions × 1 mark each)

### Student Features
1. ✅ **Verified Login** - Only registered students can log in
2. ✅ **Multi-Language Code Editor** - Write and execute code in different programming languages
3. ✅ **Observation Section** - Write observations (marks added by admin later)
4. ✅ **Viva Questions** - Answer 10 multiple-choice questions (auto-graded)

## 📊 Exam Structure

**Total Marks: 50**
- **Programming**: 30 marks (auto-graded if output matches)
- **Observation**: 10 marks (admin adds marks manually)
- **Viva Questions**: 10 marks (10 questions × 1 mark, auto-graded)

## 🔐 Login Credentials

### Admin Login
- **Username**: `sscet`
- **Password**: `adminsscet@2026`

### Student Login
- Students must be registered by admin first
- Login with exact name and register number as registered

## 🚀 Getting Started

### Step 1: Admin Setup

1. **Access Admin Panel**
   - Click "Admin Panel" on login page
   - Login with admin credentials

2. **Register Students**
   - Click "Manage Students"
   - Click "Add Student"
   - Enter student name and register number
   - Click "Add Student"
   - Repeat for all students

3. **Create Questions**
   - Click "Manage Questions"
   - Click "Add New Question"
   - Fill in:
     - Question Title
     - Problem Description
     - **Programming Language** (JavaScript, Python, Java, C, C++)
     - Difficulty Level
     - Expected Output
     - 10 Viva Questions with 4 options each
   - Click "Save Question"

### Step 2: Student Workflow

1. **Login**
   - Enter your full name (exactly as registered)
   - Enter your register number (exactly as registered)
   - Click "Login to Exam"

2. **Get Question**
   - Click "Get Random Question" on dashboard
   - Review the assigned question
   - Note the programming language required
   - Click "Start Lab Examination"

3. **Complete Exam Sections**

   **Programming Section (30 marks):**
   - Write code in the specified language
   - Click "Run Code" to execute and test
   - Output verification is automatic
   - If output matches expected: Full 30 marks
   - If output doesn't match: Admin review required

   **Observation Section (10 marks):**
   - Write detailed observations
   - Explain your approach, challenges, solutions
   - Admin will evaluate and add marks later

   **Viva Questions Section (10 marks):**
   - Answer all 10 questions
   - Select one option per question
   - Each correct answer = 1 mark (auto-graded)

4. **Submit Exam**
   - Review all sections
   - Click "Submit Exam"
   - View preliminary results
   - Download PDF report

### Step 3: Admin Evaluation

1. **View Submissions**
   - Go to Admin Panel
   - View all student submissions

2. **Add Observation Marks**
   - Click the edit icon (pencil) in "Actions" column
   - Enter observation marks (0-10)
   - Click "Save"
   - Total marks will update automatically

3. **Export Results**
   - Click "Export All Results" to download all data
   - Individual PDFs already downloaded by students

## 💻 Supported Programming Languages

### JavaScript (Browser-based execution)
- ✅ **Fully Working** - Executes in browser
- Use `console.log()` for output
- Example:
```javascript
const arr = [64, 34, 25, 12, 22, 11, 90];
console.log(JSON.stringify(arr.sort((a, b) => a - b)));
```

### Python, Java, C, C++ (Server-side execution required)
- ⚠️ **Requires Integration** - See production setup below
- Currently shows placeholder message
- For production: Integrate with Judge0 API

## 🔧 Production Setup (Optional)

For real multi-language code execution, integrate with **Judge0 API**:

1. **Sign up for Judge0**: https://judge0.com/
2. **Get API Key**: https://rapidapi.com/judge0-official/api/judge0-ce
3. **Update Code Executor**: Edit `/src/app/services/codeExecutor.ts`
4. **Add API Key**: Replace placeholder calls with actual API integration

See code comments in `codeExecutor.ts` for detailed integration instructions.

## 📋 Key Differences from Previous Version

| Feature | Previous | Updated |
|---------|----------|---------|
| Admin Login | None | Username/Password required |
| Student Login | Anyone can login | Only registered students |
| Programming Language | JavaScript only | JavaScript, Python, Java, C, C++ |
| Observation Marks | Student enters | Admin evaluates |
| MCQ Section | "MCQ" | Renamed to "Viva Questions" |
| Code Execution | Browser only | Multi-language support |

## 📝 Important Notes

1. **Student Registration**: Admin MUST register students before they can log in
2. **Exact Match Required**: Student name and register number must match exactly
3. **Language Support**: JavaScript works fully, others need API integration
4. **Observation Marks**: Students write observations, admin adds marks later
5. **Data Storage**: All data stored in browser localStorage (for production, use database)

## 🔒 Security Features

- Admin login with credentials
- Student verification against registered list
- Tab switch monitoring
- Time-limited exam (90 minutes)
- Auto-submit on timeout
- Code execution in sandboxed environment

## 📊 Admin Dashboard Features

- View all student submissions
- Search by name or register number
- Filter by question
- Edit observation marks inline
- Export all results as JSON
- View statistics (total students, average score, etc.)

## 🎯 Workflow Summary

```
Admin Flow:
1. Login with credentials
2. Register students
3. Create questions (with language selection)
4. View student submissions
5. Add observation marks
6. Export results

Student Flow:
1. Login (must be registered)
2. Get random question
3. Write & execute code (in specified language)
4. Write observations
5. Answer viva questions
6. Submit exam
7. Download PDF result
```

## 🆘 Troubleshooting

**Q: Student can't login**
A: Check that student is registered with exact name and register number

**Q: Code execution fails for Python/Java/C/C++**
A: These languages require server-side integration with Judge0 API

**Q: Observation marks not showing**
A: Admin must manually add observation marks in admin panel

**Q: Can't access admin panel**
A: Use credentials - Username: `sscet`, Password: `adminsscet@2026`

**Q: Lost all data**
A: Data is in browser localStorage. Clearing browser data will erase everything. For production, use a database.

## 🔮 Future Enhancements

- Real database integration (Supabase, Firebase)
- Server-side code execution for all languages
- Real-time proctoring with webcam
- Advanced plagiarism detection
- Code quality analysis
- Auto-save draft responses
- Email notifications
- Bulk student import (CSV)

---

© 2026 Lab Examination System - Updated Version
