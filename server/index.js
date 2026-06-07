import express from 'express';
import cors from 'cors';
import { initDb, queryAll, queryGet, queryRun } from './db.js';

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ─────────────────────────────────────────────────────────────

app.use(cors({
  origin: '*', // Allow all origins — safe for lab environment
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Health Check ────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Used by the frontend to detect if the backend is online before showing
 * login forms. Returns 200 if the server and database are ready.
 */
app.get('/api/health', async (req, res) => {
  try {
    // Verify DB connectivity
    await queryGet('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

// ─── Student APIs ─────────────────────────────────────────────────────────────

/**
 * POST /api/students
 * Body: { name, registerNumber, department }
 * Creates a new student record in the database.
 */
app.post('/api/students', async (req, res, next) => {
  try {
    const { name, registerNumber, department } = req.body;

    if (!name || !registerNumber || !department) {
      return res.status(400).json({ error: 'Name, register number, and department are required' });
    }

    const regNo = registerNumber.trim();
    const studentName = name.trim();
    const dept = department.trim();

    if (regNo.length === 0 || studentName.length === 0) {
      return res.status(400).json({ error: 'Name and register number cannot be empty' });
    }

    // Prevent duplicate register numbers
    const existing = await queryGet('SELECT id FROM students WHERE register_number = ?', [regNo]);
    if (existing) {
      return res.status(409).json({ error: `Register number "${regNo}" already exists` });
    }

    const result = await queryRun(
      'INSERT INTO students (name, register_number, department) VALUES (?, ?, ?)',
      [studentName, regNo, dept]
    );

    console.log(`[API] Created student: ${studentName} (${regNo}) in ${dept}`);
    res.status(201).json({
      id: result.lastID,
      name: studentName,
      registerNumber: regNo,
      department: dept
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/students
 * Returns all students ordered alphabetically by name.
 */
app.get('/api/students', async (req, res, next) => {
  try {
    const students = await queryAll(
      `SELECT
        id,
        name,
        register_number AS registerNumber,
        department,
        created_at AS createdAt
       FROM students
       ORDER BY name ASC`
    );
    res.json(students);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/students/:registerNumber
 * Looks up a student by register number — used for login verification.
 * This is the primary auth endpoint for students.
 */
app.get('/api/students/:registerNumber', async (req, res, next) => {
  try {
    const { registerNumber } = req.params;
    const student = await queryGet(
      `SELECT
        id,
        name,
        register_number AS registerNumber,
        department,
        created_at AS createdAt
       FROM students
       WHERE register_number = ?`,
      [registerNumber.trim()]
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found. Please contact your administrator.' });
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/students/:id
 * Body: { name, registerNumber, department }
 * Updates an existing student record.
 */
app.put('/api/students/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, registerNumber, department } = req.body;

    if (!name || !registerNumber || !department) {
      return res.status(400).json({ error: 'Name, register number, and department are required' });
    }

    const regNo = registerNumber.trim();
    const studentName = name.trim();
    const dept = department.trim();

    // Check for duplicate register number on a DIFFERENT student
    const duplicate = await queryGet(
      'SELECT id FROM students WHERE register_number = ? AND id != ?',
      [regNo, id]
    );
    if (duplicate) {
      return res.status(409).json({ error: 'Register number is already used by another student' });
    }

    const result = await queryRun(
      'UPDATE students SET name = ?, register_number = ?, department = ? WHERE id = ?',
      [studentName, regNo, dept, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    console.log(`[API] Updated student ID ${id}: ${studentName} (${regNo})`);
    res.json({ id: Number(id), name: studentName, registerNumber: regNo, department: dept });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/students/:id
 * Permanently deletes a student and all their associated data (CASCADE).
 */
app.delete('/api/students/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await queryRun('DELETE FROM students WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    console.log(`[API] Deleted student ID ${id}`);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── Question APIs ────────────────────────────────────────────────────────────

/**
 * GET /api/questions
 * Returns all questions with parsed JSON fields (testCases, vivas).
 */
app.get('/api/questions', async (req, res, next) => {
  try {
    const questions = await queryAll(
      `SELECT
        id, title, description, difficulty, language,
        expected_output AS expectedOutput,
        test_cases AS testCases,
        vivas,
        created_at AS createdAt
       FROM questions
       ORDER BY created_at DESC`
    );

    const parsed = questions.map(q => ({
      ...q,
      testCases: q.testCases ? JSON.parse(q.testCases) : [],
      vivas: q.vivas ? JSON.parse(q.vivas) : []
    }));

    res.json(parsed);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/questions
 * Body: { title, description, difficulty, language, expectedOutput, testCases, vivas }
 */
app.post('/api/questions', async (req, res, next) => {
  try {
    const { title, description, difficulty, language, expectedOutput, testCases, vivas } = req.body;

    if (!title || !description || !difficulty || !language) {
      return res.status(400).json({ error: 'Title, description, difficulty, and language are required' });
    }

    const result = await queryRun(
      'INSERT INTO questions (title, description, difficulty, language, expected_output, test_cases, vivas) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        title.trim(),
        description.trim(),
        difficulty,
        language,
        (expectedOutput || '').trim(),
        JSON.stringify(testCases || []),
        JSON.stringify(vivas || [])
      ]
    );

    console.log(`[API] Created question ID ${result.lastID}: "${title}"`);
    res.status(201).json({
      id: result.lastID,
      title, description, difficulty, language, expectedOutput,
      testCases: testCases || [],
      vivas: vivas || []
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/questions/:id
 */
app.put('/api/questions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, language, expectedOutput, testCases, vivas } = req.body;

    if (!title || !description || !difficulty || !language) {
      return res.status(400).json({ error: 'Title, description, difficulty, and language are required' });
    }

    const result = await queryRun(
      'UPDATE questions SET title = ?, description = ?, difficulty = ?, language = ?, expected_output = ?, test_cases = ?, vivas = ? WHERE id = ?',
      [
        title.trim(),
        description.trim(),
        difficulty,
        language,
        (expectedOutput || '').trim(),
        JSON.stringify(testCases || []),
        JSON.stringify(vivas || []),
        id
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    console.log(`[API] Updated question ID ${id}: "${title}"`);
    res.json({ id: Number(id), title, description, difficulty, language, expectedOutput, testCases: testCases || [], vivas: vivas || [] });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/questions/:id
 */
app.delete('/api/questions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await queryRun('DELETE FROM questions WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    console.log(`[API] Deleted question ID ${id}`);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── Assignment APIs ──────────────────────────────────────────────────────────

/**
 * GET /api/assignments/:registerNumber
 * Returns the assigned question for a student, with full question data.
 */
app.get('/api/assignments/:registerNumber', async (req, res, next) => {
  try {
    const { registerNumber } = req.params;
    const assignment = await queryGet(
      `SELECT
        sa.id AS assignmentId,
        sa.question_id AS questionId,
        q.title, q.description, q.difficulty, q.language,
        q.expected_output AS expectedOutput,
        q.test_cases AS testCases,
        q.vivas
       FROM student_assignments sa
       JOIN questions q ON sa.question_id = q.id
       WHERE sa.student_register_number = ?`,
      [registerNumber.trim()]
    );

    if (!assignment) {
      return res.status(404).json({ message: 'No question assigned yet' });
    }

    res.json({
      ...assignment,
      testCases: assignment.testCases ? JSON.parse(assignment.testCases) : [],
      vivas: assignment.vivas ? JSON.parse(assignment.vivas) : []
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/assignments
 * Body: { registerNumber, questionId }
 * Assigns a question to a student. One assignment per student (UNIQUE constraint).
 */
app.post('/api/assignments', async (req, res, next) => {
  try {
    const { registerNumber, questionId } = req.body;

    if (!registerNumber || !questionId) {
      return res.status(400).json({ error: 'Register number and question ID are required' });
    }

    const regNo = registerNumber.trim();

    // Verify student exists in DB
    const student = await queryGet('SELECT id FROM students WHERE register_number = ?', [regNo]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found in database' });
    }

    // Verify question exists in DB
    const question = await queryGet('SELECT id FROM questions WHERE id = ?', [questionId]);
    if (!question) {
      return res.status(404).json({ error: 'Question not found in database' });
    }

    const result = await queryRun(
      'INSERT INTO student_assignments (student_register_number, question_id) VALUES (?, ?)',
      [regNo, questionId]
    );

    console.log(`[API] Assigned question ${questionId} to student ${regNo}`);
    res.status(201).json({ id: result.lastID, registerNumber: regNo, questionId });
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Student already has a question assigned' });
    }
    next(error);
  }
});

// ─── Exam Results APIs ────────────────────────────────────────────────────────

/**
 * POST /api/exam-results
 * Saves a complete exam submission to the database.
 */
app.post('/api/exam-results', async (req, res, next) => {
  try {
    const {
      studentRegisterNumber, studentName, studentDepartment, question,
      programmingMarks, mcqMarks, observationMarks, totalMarks, maxMarks,
      code, codeOutput, outputMatches, mcqAnswers, timeSpent, malpractice, malpracticeReason
    } = req.body;

    if (!studentRegisterNumber || !studentName || !question) {
      return res.status(400).json({ error: 'studentRegisterNumber, studentName, and question are required' });
    }

    const regNo = studentRegisterNumber.trim();
    const dept = studentDepartment ? studentDepartment.trim() : 'Unknown';
    const obsMrks = observationMarks || 0;

    const result = await queryRun(
      `INSERT INTO exam_results (
        student_register_number, student_name, student_department, question,
        programming_marks, mcq_marks, observation_marks, total_marks, max_marks,
        code, code_output, output_matches, mcq_answers,
        time_spent, malpractice, malpractice_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        regNo,
        studentName.trim(),
        dept,
        question.trim(),
        programmingMarks || 0,
        mcqMarks || 0,
        obsMrks,
        totalMarks || 0,
        maxMarks || 50,
        code || '',
        codeOutput || '',
        outputMatches ? 1 : 0,
        JSON.stringify(mcqAnswers || {}),
        timeSpent || 0,
        malpractice ? 1 : 0,
        malpracticeReason || null
      ]
    );

    console.log(`[API] Saved exam result ID ${result.lastID} for ${regNo} — Score: ${totalMarks}/${maxMarks}, Malpractice: ${!!malpractice}`);
    res.status(201).json({ id: result.lastID, success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exam-results
 * Returns all exam results, newest first, with parsed fields.
 */
app.get('/api/exam-results', async (req, res, next) => {
  try {
    const results = await queryAll(
      `SELECT
        id,
        student_register_number AS studentRegisterNumber,
        student_name AS studentName,
        student_department AS studentDepartment,
        question,
        programming_marks AS programmingMarks,
        mcq_marks AS mcqMarks,
        observation_marks AS observationMarks,
        total_marks AS totalMarks,
        max_marks AS maxMarks,
        code,
        code_output AS codeOutput,
        output_matches AS outputMatches,
        mcq_answers AS mcqAnswers,
        time_spent AS timeSpent,
        malpractice,
        malpractice_reason AS malpracticeReason,
        submitted_at AS submittedAt
       FROM exam_results
       ORDER BY submitted_at DESC`
    );

    const formatted = results.map(r => ({
      id: r.id,
      student: {
        name: r.studentName,
        registerNumber: r.studentRegisterNumber,
        department: r.studentDepartment
      },
      question: r.question,
      programmingMarks: r.programmingMarks,
      mcqMarks: r.mcqMarks,
      observationMarks: r.observationMarks || 0,
      totalMarks: r.totalMarks,
      maxMarks: r.maxMarks,
      code: r.code,
      codeOutput: r.codeOutput,
      outputMatches: r.outputMatches === 1,
      mcqAnswers: r.mcqAnswers ? JSON.parse(r.mcqAnswers) : {},
      timeSpent: r.timeSpent,
      malpractice: r.malpractice === 1,
      malpracticeReason: r.malpracticeReason,
      submittedAt: r.submittedAt
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exam-results/by-date/:date
 * Returns all exam results submitted on a specific date (YYYY-MM-DD).
 * Used by the admin Daily Tracker calendar.
 */
app.get('/api/exam-results/by-date/:date', async (req, res, next) => {
  try {
    const { date } = req.params;
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }

    const results = await queryAll(
      `SELECT
        id,
        student_register_number AS studentRegisterNumber,
        student_name AS studentName,
        student_department AS studentDepartment,
        question,
        programming_marks AS programmingMarks,
        mcq_marks AS mcqMarks,
        observation_marks AS observationMarks,
        total_marks AS totalMarks,
        max_marks AS maxMarks,
        code,
        code_output AS codeOutput,
        output_matches AS outputMatches,
        mcq_answers AS mcqAnswers,
        time_spent AS timeSpent,
        malpractice,
        malpractice_reason AS malpracticeReason,
        submitted_at AS submittedAt
       FROM exam_results
       WHERE DATE(submitted_at) = ?
       ORDER BY submitted_at DESC`,
      [date]
    );

    const formatted = results.map(r => ({
      id: r.id,
      student: {
        name: r.studentName,
        registerNumber: r.studentRegisterNumber,
        department: r.studentDepartment
      },
      question: r.question,
      programmingMarks: r.programmingMarks,
      mcqMarks: r.mcqMarks,
      observationMarks: r.observationMarks || 0,
      totalMarks: r.totalMarks,
      maxMarks: r.maxMarks,
      code: r.code,
      codeOutput: r.codeOutput,
      outputMatches: r.outputMatches === 1,
      mcqAnswers: r.mcqAnswers ? JSON.parse(r.mcqAnswers) : {},
      timeSpent: r.timeSpent,
      malpractice: r.malpractice === 1,
      malpracticeReason: r.malpracticeReason,
      submittedAt: r.submittedAt
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exam-results/student/:registerNumber
 * Returns all exam results for a specific student, ordered by newest first.
 * Used by the student dashboard to verify if they have already completed a test.
 */
app.get('/api/exam-results/student/:registerNumber', async (req, res, next) => {
  try {
    const { registerNumber } = req.params;
    const results = await queryAll(
      `SELECT
        id,
        student_register_number AS studentRegisterNumber,
        student_name AS studentName,
        student_department AS studentDepartment,
        question,
        programming_marks AS programmingMarks,
        mcq_marks AS mcqMarks,
        observation_marks AS observationMarks,
        total_marks AS totalMarks,
        max_marks AS maxMarks,
        code,
        code_output AS codeOutput,
        output_matches AS outputMatches,
        mcq_answers AS mcqAnswers,
        time_spent AS timeSpent,
        malpractice,
        malpractice_reason AS malpracticeReason,
        submitted_at AS submittedAt
       FROM exam_results
       WHERE student_register_number = ?
       ORDER BY submitted_at DESC`,
      [registerNumber.trim()]
    );

    const formatted = results.map(r => ({
      id: r.id,
      student: {
        name: r.studentName,
        registerNumber: r.studentRegisterNumber,
        department: r.studentDepartment
      },
      question: r.question,
      programmingMarks: r.programmingMarks,
      mcqMarks: r.mcqMarks,
      observationMarks: r.observationMarks || 0,
      totalMarks: r.totalMarks,
      maxMarks: r.maxMarks,
      code: r.code,
      codeOutput: r.codeOutput,
      outputMatches: r.outputMatches === 1,
      mcqAnswers: r.mcqAnswers ? JSON.parse(r.mcqAnswers) : {},
      timeSpent: r.timeSpent,
      malpractice: r.malpractice === 1,
      malpracticeReason: r.malpracticeReason,
      submittedAt: r.submittedAt
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/exam-results/:id
 * Body: { observationMarks }
 * Updates observation marks for a specific exam result.
 * Fixes the localStorage bug in AdminPanel — marks now persist to the database.
 */
app.put('/api/exam-results/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { observationMarks } = req.body;

    if (observationMarks === undefined || observationMarks < 0 || observationMarks > 10) {
      return res.status(400).json({ error: 'observationMarks must be a number between 0 and 10' });
    }

    // First get current record to recalculate total
    const existing = await queryGet(
      'SELECT programming_marks, mcq_marks FROM exam_results WHERE id = ?',
      [id]
    );
    if (!existing) {
      return res.status(404).json({ error: 'Exam result not found' });
    }

    const newTotal = (existing.programming_marks || 0) + (existing.mcq_marks || 0) + Number(observationMarks);

    const result = await queryRun(
      'UPDATE exam_results SET observation_marks = ?, total_marks = ? WHERE id = ?',
      [Number(observationMarks), newTotal, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Exam result not found' });
    }

    console.log(`[API] Updated observation marks for result ID ${id}: ${observationMarks} (new total: ${newTotal})`);
    res.json({ id: Number(id), observationMarks: Number(observationMarks), totalMarks: newTotal });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/clear-data
 * Deletes all exam results and assignments. Does NOT delete students or questions.
 */
app.post('/api/admin/clear-data', async (req, res, next) => {
  try {
    console.log('[API] Admin: Clearing all exam results and student assignments');
    await queryRun('DELETE FROM exam_results');
    await queryRun('DELETE FROM student_assignments');
    res.json({ message: 'Exam results and assignments cleared successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('[API Error]', err.message, err.stack);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV !== 'production' ? err.message : undefined
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
  });
}).catch(err => {
  console.error('[Server] FATAL: Failed to initialize database:', err);
  process.exit(1);
});
