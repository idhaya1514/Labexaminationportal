import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file is stored in the project root so it persists across restarts
const dbPath = path.resolve(__dirname, '../database.sqlite');

let db = null;

export async function initDb() {
  if (db) return db;

  console.log(`[Database] Initializing SQLite database at: ${dbPath}`);

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign key constraints
  await db.run('PRAGMA foreign_keys = ON');

  // WAL mode for better concurrent read/write performance
  await db.run('PRAGMA journal_mode = WAL');
  await db.run('PRAGMA synchronous = NORMAL');

  // Create all tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      register_number TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
      language TEXT NOT NULL,
      expected_output TEXT NOT NULL,
      test_cases TEXT NOT NULL,  -- JSON array
      vivas TEXT NOT NULL,       -- JSON array of MCQ objects
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_register_number TEXT NOT NULL UNIQUE,
      question_id INTEGER NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_register_number) REFERENCES students (register_number) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exam_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_register_number TEXT NOT NULL,
      student_name TEXT NOT NULL,
      student_department TEXT NOT NULL,
      question TEXT NOT NULL,
      programming_marks INTEGER NOT NULL,
      mcq_marks INTEGER NOT NULL,
      observation_marks INTEGER DEFAULT 0,
      total_marks INTEGER NOT NULL,
      max_marks INTEGER DEFAULT 50,
      code TEXT NOT NULL,
      code_output TEXT NOT NULL,
      output_matches INTEGER NOT NULL, -- 0=false, 1=true
      mcq_answers TEXT NOT NULL,       -- JSON object
      time_spent INTEGER NOT NULL,     -- seconds
      malpractice INTEGER DEFAULT 0,   -- 0=false, 1=true
      malpractice_reason TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_register_number) REFERENCES students (register_number) ON DELETE CASCADE
    );

    -- Indexes for common lookups
    CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results (student_register_number);
    CREATE INDEX IF NOT EXISTS idx_assignments_question ON student_assignments (question_id);
  `);

  // Non-destructive migration: add observation_marks if it doesn't exist on older databases
  try {
    await db.run('ALTER TABLE exam_results ADD COLUMN observation_marks INTEGER DEFAULT 0');
    console.log('[Database] Migration: Added observation_marks column to exam_results.');
  } catch (err) {
    // Column already exists — safe to ignore this specific error
    if (!err.message.includes('duplicate column name')) {
      console.error('[Database] Unexpected migration error:', err.message);
    }
  }

  console.log('[Database] SQLite database and tables ready.');
  return db;
}

export async function getDb() {
  if (!db) await initDb();
  return db;
}

export async function queryAll(sql, params = []) {
  const database = await getDb();
  try {
    return await database.all(sql, params);
  } catch (error) {
    console.error(`[Database Error] queryAll: ${error.message} | SQL: ${sql}`);
    throw error;
  }
}

export async function queryGet(sql, params = []) {
  const database = await getDb();
  try {
    return await database.get(sql, params);
  } catch (error) {
    console.error(`[Database Error] queryGet: ${error.message} | SQL: ${sql}`);
    throw error;
  }
}

export async function queryRun(sql, params = []) {
  const database = await getDb();
  try {
    return await database.run(sql, params);
  } catch (error) {
    console.error(`[Database Error] queryRun: ${error.message} | SQL: ${sql}`);
    throw error;
  }
}
