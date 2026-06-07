import { useState, useEffect } from 'react';
import {
  GraduationCap, User, LogOut, Clock, FileText,
  PlayCircle, AlertCircle, Loader2, BookOpen, Zap, Shield, CheckCircle
} from 'lucide-react';
import { getQuestions, getAssignedQuestion, assignQuestion, getStudentExamResults } from '../services/api';
import { toast } from 'sonner';

interface DashboardProps {
  student: { name: string; registerNumber: string; department?: string };
  onStartExam: (question: any) => void;
  onLogout: () => void;
}

const DIFF_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Easy:   { bg: 'rgba(16,185,129,0.1)',  text: '#6ee7b7', border: 'rgba(16,185,129,0.25)'  },
  Medium: { bg: 'rgba(245,158,11,0.1)',  text: '#fcd34d', border: 'rgba(245,158,11,0.25)'  },
  Hard:   { bg: 'rgba(239,68,68,0.1)',   text: '#fca5a5', border: 'rgba(239,68,68,0.25)'   },
};

const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '14px',
};

export default function Dashboard({ student, onStartExam, onLogout }: DashboardProps) {
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [todayResult, setTodayResult] = useState<any>(null);

  useEffect(() => {
    loadQuestions();
    checkAssignedQuestion();
    checkTodaySubmission();
  }, []);

  const checkTodaySubmission = async () => {
    try {
      const results = await getStudentExamResults(student.registerNumber);
      const getLocalDateString = (dObj: Date) => {
        const y = dObj.getFullYear();
        const m = String(dObj.getMonth() + 1).padStart(2, '0');
        const d = String(dObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      const localToday = getLocalDateString(new Date());
      const resultForToday = results.find(r => {
        if (!r.submittedAt) return false;
        return getLocalDateString(new Date(r.submittedAt)) === localToday;
      });
      if (resultForToday) {
        setHasSubmittedToday(true);
        setTodayResult(resultForToday);
      }
    } catch (error) {
      console.error('Failed to check today submission:', error);
    }
  };

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const questions = await getQuestions();
      setAvailableQuestions(questions);
      setServerError('');
    } catch (error: any) {
      setServerError('Cannot connect to server. Please ensure the backend is running.');
      toast.error('Failed to load questions: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAssignedQuestion = async () => {
    setIsQuestionLoading(true);
    try {
      const assigned = await getAssignedQuestion(student.registerNumber);
      if (assigned) setSelectedQuestion(assigned);
    } catch (error) {
      console.error('Failed to check assigned question:', error);
    } finally {
      setIsQuestionLoading(false);
    }
  };

  const handleGetRandomQuestion = async () => {
    setIsQuestionLoading(true);
    try {
      const assigned = await getAssignedQuestion(student.registerNumber);
      if (assigned) {
        setSelectedQuestion(assigned);
        toast.info('You already have an assigned question.');
        return;
      }
      if (availableQuestions.length === 0) {
        toast.error('No questions available. Contact your administrator.');
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const randomQuestion = availableQuestions[randomIndex];
      await assignQuestion(student.registerNumber, randomQuestion.id);
      setSelectedQuestion(randomQuestion);
      toast.success('Question assigned! You may now start your exam.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign question');
    } finally {
      setIsQuestionLoading(false);
    }
  };

  const handleStart = () => {
    if (selectedQuestion) onStartExam(selectedQuestion);
  };

  const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const diff = selectedQuestion ? (DIFF_COLORS[selectedQuestion.difficulty] || DIFF_COLORS.Medium) : null;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6 animate-fade-in" style={{
          ...cardStyle,
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.15)',
          padding: '1.25rem 1.5rem'
        }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0" style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
            }}>
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">Welcome back, {student.name.split(' ')[0]}</h1>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.6)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                {student.registerNumber} · {student.department}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-medium transition-all px-4 py-2 rounded-lg"
            style={{ color: 'rgba(148,163,184,0.7)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* ── Server Error ── */}
        {serverError && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm animate-fade-in" style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#fca5a5'
          }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Server Connection Error</p>
              <p className="text-xs mt-0.5 opacity-70">{serverError}</p>
            </div>
          </div>
        )}

        {/* ── Info Cards ── */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { icon: User,     label: 'Student',  val: student.name,       sub: student.registerNumber, color: '#818cf8' },
            { icon: Clock,    label: 'Duration',  val: '90 Minutes',       sub: 'Auto-submit on timeout', color: '#34d399' },
            { icon: FileText, label: 'Sections',  val: '50 Total Marks',   sub: 'Program 30 + MCQ 20', color: '#a78bfa' },
          ].map(({ icon: Icon, label, val, sub, color }) => (
            <div key={label} style={{ ...cardStyle, padding: '1.1rem 1.25rem' }} className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.5)' }}>{label}</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{val}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.45)' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Main Panel ── */}
        <div style={{ ...cardStyle, padding: '1.75rem' }} className="animate-fade-in">
          {hasSubmittedToday ? (
            // ── Completed State ──
            <div className="flex flex-col items-center py-10 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 relative" style={{
                background: 'rgba(16,185,129,0.1)',
                border: '2px solid rgba(16,185,129,0.25)',
              }}>
                <CheckCircle className="w-10 h-10" style={{ color: '#34d399' }} />
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full" style={{
                  border: '2px solid rgba(16,185,129,0.2)',
                  animation: 'pulse-ring 2s ease-out infinite'
                }} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Today's Exam Submitted!</h2>
              <p className="text-sm mb-7" style={{ color: 'rgba(148,163,184,0.6)', maxWidth: '360px', lineHeight: '1.6' }}>
                Your lab examination has been successfully recorded.
              </p>

              {/* Score display */}
              <div className="mb-6 px-8 py-5 rounded-2xl" style={{
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.15)'
              }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(52,211,153,0.6)' }}>Your Score</p>
                <p className="text-5xl font-black" style={{ color: '#34d399', lineHeight: 1 }}>
                  {(todayResult?.programmingMarks || 0) + (todayResult?.mcqMarks || 0) + (todayResult?.observationMarks || 0)}
                  <span className="text-2xl font-semibold" style={{ color: 'rgba(52,211,153,0.4)' }}>/{todayResult?.maxMarks || 50}</span>
                </p>
                <p className="text-xs mt-2.5" style={{ color: 'rgba(148,163,184,0.4)' }}>
                  Programming: {todayResult?.programmingMarks || 0} pts &nbsp;·&nbsp; MCQ: {todayResult?.mcqMarks || 0} pts &nbsp;·&nbsp; Observation: {todayResult?.observationMarks || 0} pts
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold" style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5'
              }}>
                <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ animation: 'pulse 2s infinite' }} />
                Re-examination is strictly prohibited
              </div>
            </div>

          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-white">Start Your Lab Exam</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>
                    {availableQuestions.length} question{availableQuestions.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                {selectedQuestion && (
                  <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8'
                  }}>Question Assigned</span>
                )}
              </div>

              {/* Divider */}
              <div className="mb-5" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

              {availableQuestions.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <AlertCircle className="w-6 h-6" style={{ color: '#fbbf24' }} />
                  </div>
                  <p className="text-sm font-semibold text-white">No Questions Available</p>
                  <p className="text-xs text-center" style={{ color: 'rgba(148,163,184,0.45)', maxWidth: '280px' }}>
                    Your administrator hasn't added any questions yet.
                  </p>
                </div>
              ) : isQuestionLoading ? (
                <div className="flex items-center justify-center py-10 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#818cf8' }} />
                  <p className="text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>Loading your assigned question...</p>
                </div>
              ) : !selectedQuestion ? (
                // ── Get Question ──
                <div className="flex flex-col items-center py-8 gap-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)'
                  }}>
                    <BookOpen className="w-8 h-8" style={{ color: '#818cf8' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white mb-1">Ready to begin?</p>
                    <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)', lineHeight: 1.6 }}>
                      Click below to receive your randomly assigned question.
                    </p>
                    <p className="text-xs mt-2 font-semibold" style={{ color: '#fca5a5' }}>
                      ⚠ You can only get ONE question — this cannot be changed
                    </p>
                  </div>
                  <button
                    onClick={handleGetRandomQuestion}
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: '10px',
                      padding: '0.75rem 2rem',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(99,102,241,0.25)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.25)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    Get My Question
                  </button>
                </div>
              ) : (
                // ── Question Card ──
                <div className="mb-5 rounded-xl p-5" style={{
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.18)'
                }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Zap className="w-4 h-4 flex-shrink-0" style={{ color: '#818cf8' }} />
                        <h3 className="text-base font-bold text-white">{selectedQuestion.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.65)' }}>{selectedQuestion.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {diff && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{
                          background: diff.bg, color: diff.text, border: `1px solid ${diff.border}`
                        }}>
                          {selectedQuestion.difficulty}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-center" style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(148,163,184,0.7)'
                      }}>
                        {selectedQuestion.language?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {selectedQuestion.expectedOutput && (
                    <p className="text-xs mt-3" style={{ color: 'rgba(148,163,184,0.4)' }}>
                      Sample output: <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(148,163,184,0.7)' }}>{selectedQuestion.expectedOutput}</code>
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: 'rgba(99,102,241,0.6)' }}>
                    <Shield className="w-3 h-3" />
                    Permanently assigned — cannot be changed
                  </div>
                </div>
              )}

              {/* Instructions */}
              {selectedQuestion && (
                <div className="rounded-xl p-4 mb-5" style={{
                  background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)'
                }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#fbbf24' }}>
                    📋 Important Instructions
                  </h4>
                  <ul className="space-y-1.5 text-xs" style={{ color: 'rgba(253,230,138,0.6)' }}>
                    <li>· Write and execute your code for the given problem (30 marks)</li>
                    <li>· Answer 10 MCQ questions — 2 marks each (20 marks total)</li>
                    <li>· Exam auto-submits after 90 minutes</li>
                    <li className="font-bold" style={{ color: '#fca5a5' }}>· ⚠ Switching tabs will INSTANTLY terminate your exam!</li>
                  </ul>
                </div>
              )}

              {/* Start button */}
              {!isQuestionLoading && (
                <button
                  onClick={handleStart}
                  disabled={!selectedQuestion || isLoading}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#fff',
                    cursor: (!selectedQuestion || isLoading) ? 'not-allowed' : 'pointer',
                    background: (!selectedQuestion || isLoading)
                      ? 'rgba(255,255,255,0.04)'
                      : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    boxShadow: (!selectedQuestion || isLoading) ? 'none' : '0 4px 16px rgba(99,102,241,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { if (selectedQuestion && !isLoading) { e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.25)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <PlayCircle className="w-5 h-5" />
                  {selectedQuestion ? 'Start Lab Examination' : 'Get a question first'}
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: 'rgba(100,116,139,0.35)' }}>
          SSCET Examination System · 50 Marks Total (Programming 30 + MCQ 20)
        </p>
      </div>
    </div>
  );
}
