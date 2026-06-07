import { useState, useEffect } from 'react';
import { Clock, AlertCircle, Code, FileText, HelpCircle, ArrowLeft, Send, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { executeCode, getLanguageName, getCodeTemplate } from '../services/codeExecutor';
import { submitExamResult } from '../services/api';
import { toast } from 'sonner';

interface ExamModuleProps {
  student: { name: string; registerNumber: string; department?: string };
  question: any;
  onComplete: (results: any) => void;
  onBack: () => void;
}

type Section = 'programming' | 'mcq';

export default function ExamModule({ student, question, onComplete, onBack }: ExamModuleProps) {
  const [currentSection, setCurrentSection] = useState<Section>('programming');
  const [timeRemaining, setTimeRemaining] = useState(90 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Programming section
  const [code, setCode] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState('');
  const [outputMatches, setOutputMatches] = useState<boolean | null>(null);

  // MCQ section
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});

  const mcqQuestions = question.vivas || question.mcqs || [];
  const validQuestions = mcqQuestions.filter((q: any) => q.question);
  const isMCQComplete = Object.keys(mcqAnswers).length === validQuestions.length;
  const isProgrammingComplete = code.trim().length > 0;
  const isExamComplete = isProgrammingComplete && isMCQComplete;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Immediately terminate exam on tab switch
        const malpracticeResult = {
          student: {
            name: student.name,
            registerNumber: student.registerNumber,
            department: student.department || 'Unknown'
          },
          question: question.title,
          programmingMarks: 0,
          mcqMarks: 0,
          totalMarks: 0,
          maxMarks: 50,
          code,
          codeOutput,
          outputMatches: false,
          mcqAnswers,
          timeSpent: (90 * 60) - timeRemaining,
          malpractice: true,
          malpracticeReason: 'Tab switching detected - Exam terminated'
        };

        try {
          await submitExamResult(malpracticeResult);
        } catch (error) {
          console.error('Failed to submit malpractice result:', error);
        }

        // Clear current student session
        localStorage.removeItem('currentStudent');

        // Alert and redirect
        alert('⚠️ EXAM TERMINATED!\n\nTab switching is not allowed during the exam.\nYour exam has been marked as MALPRACTICE and terminated.\n\nYou will be logged out now.');

        // Force redirect to login
        window.location.reload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [code, codeOutput, timeRemaining, question, student, outputMatches]);

  const handleExecuteCode = async () => {
    setIsExecuting(true);
    setExecutionError('');
    setCodeOutput('');
    setOutputMatches(null);

    try {
      const result = await executeCode(code, question.language || 'javascript');

      if (result.success) {
        setCodeOutput(result.output);

        // Check if output matches expected
        if (question.expectedOutput) {
          const match = result.output.trim() === question.expectedOutput.trim();
          setOutputMatches(match);
        }
      } else {
        setExecutionError(result.error || 'Execution failed');
      }
    } catch (error: any) {
      setExecutionError(error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAutoSubmit = () => {
    submitExam();
  };

  const submitExam = async () => {
    setIsSubmitting(true);
    try {
      // Calculate MCQ marks (2 marks each)
      const mcqQuestions = question.vivas || question.mcqs || [];
      const mcqScore = mcqQuestions.reduce((score: number, mcq: any) => {
        return mcqAnswers[mcq.id] === mcq.correctAnswer ? score + 2 : score;
      }, 0);

      // Programming marks (auto 30 if output matches, else needs manual review)
      const programmingMarks = outputMatches ? 30 : 0;

      const results = {
        student: {
          name: student.name,
          registerNumber: student.registerNumber,
          department: student.department || 'Unknown'
        },
        question: question.title,
        programmingMarks,
        mcqMarks: mcqScore,
        totalMarks: programmingMarks + mcqScore,
        maxMarks: 50,
        code,
        codeOutput,
        outputMatches: !!outputMatches,
        mcqAnswers,
        timeSpent: (90 * 60) - timeRemaining,
        malpractice: false
      };

      await submitExamResult(results);
      toast.success('Exam submitted successfully!');
      
      onComplete({
        ...results,
        questionId: question.id,
        language: question.language,
        submittedAt: new Date().toISOString()
      });
    } catch (error: any) {
      toast.error('Failed to submit exam: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const card = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5 animate-fade-in" style={{
          ...card,
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.14)',
          padding: '1rem 1.5rem'
        }}>
          <div>
            <h2 className="text-base font-bold text-white">{question.title}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.5)', fontFamily: 'monospace' }}>
              {student.name} · {student.registerNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
              background: timeRemaining < 300 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${timeRemaining < 300 ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
              animation: timeRemaining < 300 ? 'pulse 1s infinite' : 'none'
            }}>
              <Clock className="w-4 h-4" style={{ color: timeRemaining < 300 ? '#fca5a5' : '#818cf8' }} />
              <span className="font-mono font-bold text-sm" style={{ color: timeRemaining < 300 ? '#fca5a5' : '#c7d2fe' }}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#fca5a5'
            }}>
              <AlertCircle className="w-3.5 h-3.5" />
              Tab switch = Exam Terminated
            </div>
          </div>
        </div>

        {/* ── Section Tabs ── */}
        <div className="flex gap-2 mb-5">
          {([['programming', 'Programming', '30 marks'], ['mcq', 'MCQ', '20 marks']] as const).map(([sec, label, marks]) => (
            <button
              key={sec}
              onClick={() => setCurrentSection(sec)}
              style={{
                flex: 1, padding: '0.7rem 1rem', borderRadius: '10px',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: currentSection === sec ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${currentSection === sec ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
                color: currentSection === sec ? '#c7d2fe' : 'rgba(148,163,184,0.55)',
                transition: 'all 0.2s ease'
              }}
            >
              {sec === 'programming' ? <Code style={{ width: '1rem', height: '1rem' }} /> : <HelpCircle style={{ width: '1rem', height: '1rem' }} />}
              {label}
              <span style={{
                padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700,
                background: currentSection === sec ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                color: currentSection === sec ? '#a5b4fc' : 'rgba(148,163,184,0.4)'
              }}>{marks}</span>
            </button>
          ))}
        </div>

        {/* ── Section Content ── */}
        {currentSection === 'programming' && (
          <ProgrammingSection
            question={question}
            code={code}
            setCode={setCode}
            codeOutput={codeOutput}
            isExecuting={isExecuting}
            executionError={executionError}
            outputMatches={outputMatches}
            onExecute={handleExecuteCode}
          />
        )}
        {currentSection === 'mcq' && (
          <MCQSection
            questions={question.vivas || question.mcqs || []}
            answers={mcqAnswers}
            onAnswerChange={setMcqAnswers}
          />
        )}

        {/* ── Submit ── */}
        <div className="mt-5 animate-fade-in" style={{ ...card, padding: '1.25rem 1.5rem' }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'rgba(148,163,184,0.5)' }}>Completion Status</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: isProgrammingComplete ? '#6ee7b7' : '#fbbf24' }}>
                  {isProgrammingComplete ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  Programming {isProgrammingComplete ? '✓' : '(pending)'}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: isMCQComplete ? '#6ee7b7' : '#fbbf24' }}>
                  {isMCQComplete ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  MCQ {Object.keys(mcqAnswers).length}/{validQuestions.length} {isMCQComplete ? '✓' : '(pending)'}
                </div>
              </div>
            </div>
            <button
              onClick={submitExam}
              disabled={isSubmitting || !isExamComplete}
              style={{
                padding: '0.75rem 2rem', borderRadius: '10px',
                fontWeight: 700, fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                cursor: (isSubmitting || !isExamComplete) ? 'not-allowed' : 'pointer',
                background: (isSubmitting || !isExamComplete)
                  ? 'rgba(255,255,255,0.04)'
                  : 'linear-gradient(135deg, #059669, #10b981)',
                border: `1px solid ${(isSubmitting || !isExamComplete) ? 'rgba(255,255,255,0.07)' : 'rgba(16,185,129,0.3)'}`,
                color: (isSubmitting || !isExamComplete) ? 'rgba(148,163,184,0.3)' : '#fff',
                boxShadow: (isSubmitting || !isExamComplete) ? 'none' : '0 4px 14px rgba(16,185,129,0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Programming Section Component
function ProgrammingSection({
  question, code, setCode, codeOutput, isExecuting, executionError, outputMatches, onExecute
}: any) {
  const card = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px',
  };
  return (
    <div style={{ ...card, padding: '1.5rem' }} className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">Programming Section</h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.4)' }}>Language: {getLanguageName(question.language || 'javascript')}</p>
        </div>
        <button
          onClick={onExecute}
          disabled={isExecuting || !code}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1.1rem', borderRadius: '8px',
            fontWeight: 600, fontSize: '0.8rem', cursor: (isExecuting || !code) ? 'not-allowed' : 'pointer',
            background: (isExecuting || !code) ? 'rgba(255,255,255,0.04)' : 'rgba(16,185,129,0.1)',
            border: `1px solid ${(isExecuting || !code) ? 'rgba(255,255,255,0.07)' : 'rgba(16,185,129,0.25)'}`,
            color: (isExecuting || !code) ? 'rgba(148,163,184,0.3)' : '#6ee7b7',
            transition: 'all 0.2s'
          }}
        >
          <Play style={{ width: '0.875rem', height: '0.875rem' }} />
          {isExecuting ? 'Running...' : 'Run Code'}
        </button>
      </div>

      {/* Problem statement */}
      <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#818cf8' }}>Problem Statement</p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(203,213,225,0.8)' }}>{question.description}</p>
        {question.expectedOutput && (
          <p className="text-xs mt-2" style={{ color: 'rgba(148,163,184,0.5)' }}>
            Expected: <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#a5b4fc' }}>{question.expectedOutput}</code>
          </p>
        )}
      </div>

      {/* Code editor */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={getCodeTemplate(question.language || 'javascript')}
        spellCheck={false}
        style={{
          width: '100%', height: '26rem',
          padding: '1rem', borderRadius: '10px',
          background: '#0d0d18',
          border: '1px solid rgba(99,102,241,0.2)',
          color: '#86efac',
          fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.7,
          outline: 'none', resize: 'vertical', transition: 'border-color 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
      />

      {/* Output */}
      {(codeOutput || executionError) && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.5)' }}>Output</p>
            {outputMatches !== null && (
              <span className="flex items-center gap-1 text-xs font-semibold" style={{
                color: outputMatches ? '#6ee7b7' : '#fca5a5'
              }}>
                {outputMatches
                  ? <><CheckCircle style={{ width: '0.875rem', height: '0.875rem' }} /> Correct!</>
                  : <><XCircle style={{ width: '0.875rem', height: '0.875rem' }} /> Doesn't match</> }
              </span>
            )}
          </div>
          {executionError ? (
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '0.875rem' }}>
              <p style={{ color: '#fca5a5', fontFamily: 'monospace', fontSize: '0.78rem' }}>{executionError}</p>
            </div>
          ) : (
            <div style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.875rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#86efac', whiteSpace: 'pre-wrap' }}>
              {codeOutput || '(no output)'}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 rounded-xl p-3 text-xs" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', color: 'rgba(253,230,138,0.6)' }}>
        💡 Write clean code. Use "Run Code" to test before submitting — matching output gives full programming marks.
      </div>
    </div>
  );
}

// MCQ Section Component
function MCQSection({ questions, answers, onAnswerChange }: any) {
  const answeredCount = Object.keys(answers).length;
  const validQuestions = questions.filter((q: any) => q.question);
  const card = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px',
  };

  return (
    <div style={{ ...card, padding: '1.5rem' }} className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white">Multiple Choice Questions</h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.4)' }}>2 marks each · 20 marks total</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
          background: answeredCount === validQuestions.length && validQuestions.length > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${answeredCount === validQuestions.length && validQuestions.length > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)'}`
        }}>
          <span className="text-xs font-bold" style={{ color: answeredCount === validQuestions.length && validQuestions.length > 0 ? '#6ee7b7' : '#818cf8' }}>
            {answeredCount} / {validQuestions.length} Answered
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {validQuestions.map((q: any, idx: number) => {
          const isAnswered = answers[q.id] !== undefined;
          return (
            <div key={q.id} style={{
              background: isAnswered ? 'rgba(16,185,129,0.03)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isAnswered ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '12px', padding: '1.1rem', transition: 'all 0.2s'
            }}>
              <div className="flex gap-3 mb-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{
                  background: isAnswered ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.12)',
                  color: isAnswered ? '#6ee7b7' : '#818cf8',
                  border: `1px solid ${isAnswered ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.2)'}`
                }}>
                  {idx + 1}
                </span>
                <p className="flex-1 text-sm font-semibold text-white leading-relaxed">{q.question}</p>
              </div>
              <div className="ml-9 space-y-2">
                {q.options.map((option: string, optIdx: number) => {
                  const isSelected = answers[q.id] === optIdx;
                  return (
                    <label
                      key={optIdx}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.6rem 0.875rem', borderRadius: '8px',
                        cursor: 'pointer', transition: 'all 0.15s',
                        background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isSelected ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        color: isSelected ? '#c7d2fe' : 'rgba(148,163,184,0.65)'
                      }}
                    >
                      <input
                        type="radio"
                        name={`mcq-${q.id}`}
                        checked={isSelected}
                        onChange={() => onAnswerChange({ ...answers, [q.id]: optIdx })}
                        style={{ accentColor: '#6366f1', width: '0.9rem', height: '0.9rem', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '0.825rem', fontWeight: isSelected ? 600 : 400 }}>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
