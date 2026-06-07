import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Code, Loader2, ArrowLeft } from 'lucide-react';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../services/api';
import { toast } from 'sonner';

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: 'javascript' | 'python' | 'java' | 'c' | 'cpp';
  expectedOutput: string;
  testCases: { input: string; output: string }[];
  vivas: VivaQuestion[];
  mcqs?: VivaQuestion[];
  createdAt: string;
}

interface VivaQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface AdminQuestionManagerProps {
  onBack: () => void;
}

const card = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '14px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 1rem',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '9px', color: '#e2e8f0', fontSize: '0.8rem',
  outline: 'none', transition: 'all 0.2s',
};

const DIFF_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Easy:   { bg: 'rgba(16,185,129,0.1)',  text: '#6ee7b7', border: 'rgba(16,185,129,0.2)' },
  Medium: { bg: 'rgba(245,158,11,0.1)',  text: '#fcd34d', border: 'rgba(245,158,11,0.2)' },
  Hard:   { bg: 'rgba(239,68,68,0.1)',   text: '#fca5a5', border: 'rgba(239,68,68,0.2)' },
};

export default function AdminQuestionManager({ onBack }: AdminQuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Question>>({
    title: '', description: '', difficulty: 'Medium', language: 'javascript', expectedOutput: '',
    testCases: [],
    vivas: Array(10).fill(null).map((_, i) => ({ id: i + 1, question: '', options: ['', '', '', ''], correctAnswer: 0 }))
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadQuestions(); }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await getQuestions();
      setQuestions(data.map(q => ({ ...q, id: String(q.id) })));
    } catch (error: any) {
      toast.error('Failed to load questions: ' + error.message);
    } finally { setIsLoading(false); }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) { toast.warning('Please fill in all required fields'); return; }
    setIsSaving(true);
    try {
      const payload = {
        title: formData.title!, description: formData.description!, difficulty: formData.difficulty!,
        language: formData.language!, expectedOutput: formData.expectedOutput || '',
        testCases: formData.testCases || [], vivas: formData.vivas || []
      };
      if (editingId) { await updateQuestion(editingId, payload); toast.success('Question updated'); }
      else { await createQuestion(payload); toast.success('Question saved'); }
      resetForm(); await loadQuestions();
    } catch (error: any) { toast.error(error.message || 'Operation failed'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this question?')) {
      try { await deleteQuestion(id); toast.success('Question deleted'); await loadQuestions(); }
      catch (error: any) { toast.error('Failed: ' + error.message); }
    }
  };

  const handleEdit = (question: Question) => { setFormData(question); setEditingId(question.id); setIsAdding(true); };

  const resetForm = () => {
    setFormData({
      title: '', description: '', difficulty: 'Medium', language: 'javascript', expectedOutput: '', testCases: [],
      vivas: Array(10).fill(null).map((_, i) => ({ id: i + 1, question: '', options: ['', '', '', ''], correctAnswer: 0 }))
    });
    setIsAdding(false); setEditingId(null);
  };

  const updateViva = (index: number, field: string, value: any) => {
    const vivas = [...(formData.vivas || [])];
    vivas[index] = { ...vivas[index], [field]: value };
    setFormData({ ...formData, vivas });
  };

  const updateVivaOption = (vivaIndex: number, optionIndex: number, value: string) => {
    const vivas = [...(formData.vivas || [])];
    const options = [...vivas[vivaIndex].options];
    options[optionIndex] = value;
    vivas[vivaIndex] = { ...vivas[vivaIndex], options };
    setFormData({ ...formData, vivas });
  };

  const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(99,102,241,0.4)';
    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)';
  };
  const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5 animate-fade-in" style={{
          ...card,
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.12)',
          padding: '1rem 1.5rem'
        }}>
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: 'rgba(148,163,184,0.5)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.5)'}
            >
              <ArrowLeft style={{ width: '0.875rem', height: '0.875rem' }} />
              Back
            </button>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)' }} />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 10px rgba(99,102,241,0.3)'
            }}>
              <Code style={{ width: '1rem', height: '1rem', color: '#fff' }} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Question Bank</h1>
              <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Manage programming questions & MCQs</p>
            </div>
          </div>
          {!isAdding && (
            <button onClick={() => setIsAdding(true)} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: '1px solid rgba(99,102,241,0.3)',
              color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.25)', transition: 'all 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 18px rgba(99,102,241,0.4)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.25)'}
            >
              <Plus style={{ width: '0.875rem', height: '0.875rem' }} />
              Add Question
            </button>
          )}
        </div>

        {/* ── Question Form ── */}
        {isAdding && (
          <div style={{
            ...card,
            background: 'rgba(99,102,241,0.04)',
            border: '1px solid rgba(99,102,241,0.15)',
            padding: '1.5rem',
            marginBottom: '1.25rem'
          }} className="animate-fade-in">
            <h3 className="text-sm font-bold text-white mb-4">{editingId ? '✏️ Edit Question' : '➕ New Question'}</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Implement Bubble Sort" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Description *</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed problem statement..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical' as const }} onFocus={focusHandler as any} onBlur={blurHandler as any} />
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Language</label>
                  <select value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value as any })}
                    style={{ ...inputStyle, appearance: 'none' as const, cursor: 'pointer' }}
                    onFocus={focusHandler as any} onBlur={blurHandler as any}>
                    {['javascript', 'python', 'java', 'c', 'cpp'].map(l => <option key={l} value={l}>{l === 'cpp' ? 'C++' : l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Difficulty</label>
                  <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                    style={{ ...inputStyle, appearance: 'none' as const, cursor: 'pointer' }}
                    onFocus={focusHandler as any} onBlur={blurHandler as any}>
                    {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Expected Output</label>
                  <input type="text" value={formData.expectedOutput} onChange={e => setFormData({ ...formData, expectedOutput: e.target.value })}
                    placeholder="e.g., [1, 2, 3]" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
                </div>
              </div>

              {/* MCQ Section */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(148,163,184,0.5)' }}>
                  MCQ Questions (10 × 2 = 20 marks)
                </h4>
                <div className="space-y-3" style={{ maxHeight: '24rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {formData.vivas?.map((viva, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px', padding: '0.875rem'
                    }}>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(148,163,184,0.5)' }}>Q{idx + 1}</label>
                      <input type="text" value={viva.question} onChange={e => updateViva(idx, 'question', e.target.value)}
                        placeholder={`MCQ Question ${idx + 1}`}
                        style={{ ...inputStyle, fontSize: '0.78rem', marginBottom: '0.5rem' }}
                        onFocus={focusHandler} onBlur={blurHandler} />
                      <div className="grid grid-cols-2 gap-2">
                        {viva.options.map((opt, optIdx) => (
                          <input key={optIdx} type="text" value={opt} onChange={e => updateVivaOption(idx, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            style={{ ...inputStyle, fontSize: '0.75rem' }}
                            onFocus={focusHandler} onBlur={blurHandler} />
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>Correct:</label>
                        <select value={viva.correctAnswer} onChange={e => updateViva(idx, 'correctAnswer', Number(e.target.value))}
                          style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#e2e8f0', fontSize: '0.75rem', outline: 'none', cursor: 'pointer' }}>
                          {[0, 1, 2, 3].map(i => <option key={i} value={i}>Option {i + 1}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button onClick={handleSubmit} disabled={isSaving} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  background: isSaving ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${isSaving ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.25)'}`,
                  color: '#6ee7b7', transition: 'all 0.2s'
                }}>
                  {isSaving ? <Loader2 style={{ width: '0.875rem', height: '0.875rem' }} className="animate-spin" /> : <Save style={{ width: '0.875rem', height: '0.875rem' }} />}
                  {editingId ? 'Update' : 'Save'} Question
                </button>
                <button onClick={resetForm} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(148,163,184,0.7)', transition: 'all 0.2s'
                }}>
                  <X style={{ width: '0.875rem', height: '0.875rem' }} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Questions List ── */}
        <div style={card} className="animate-fade-in">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.4)' }}>
              Stored Questions ({questions.length})
            </p>
          </div>

          {isLoading ? (
            <div className="text-center" style={{ padding: '4rem 2rem' }}>
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#818cf8' }} />
              <p className="text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>Loading question bank...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center" style={{ padding: '4rem 2rem' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Code className="w-7 h-7" style={{ color: 'rgba(148,163,184,0.2)' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'rgba(148,163,184,0.5)' }}>No questions added yet</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(148,163,184,0.3)' }}>Click "Add Question" to create your first one</p>
            </div>
          ) : (
            <div style={{ padding: '0.75rem' }}>
              <div className="space-y-3">
                {questions.map(q => {
                  const ds = DIFF_STYLES[q.difficulty] || DIFF_STYLES.Medium;
                  return (
                    <div key={q.id} style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px', padding: '1rem 1.25rem', transition: 'all 0.2s'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; e.currentTarget.style.background = 'rgba(99,102,241,0.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{q.title}</h4>
                            <span style={{
                              padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700,
                              background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)'
                            }}>{q.language?.toUpperCase() || 'JS'}</span>
                            <span style={{
                              padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700,
                              background: ds.bg, color: ds.text, border: `1px solid ${ds.border}`
                            }}>{q.difficulty}</span>
                          </div>
                          <p className="text-xs leading-relaxed mb-1.5" style={{ color: 'rgba(148,163,184,0.6)' }}>{q.description}</p>
                          {q.expectedOutput && (
                            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.4)' }}>
                              Expected: <code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#a5b4fc' }}>{q.expectedOutput}</code>
                            </p>
                          )}
                          <p className="text-xs mt-1.5" style={{ color: 'rgba(148,163,184,0.3)' }}>
                            MCQ: {q.vivas?.filter(m => m.question).length || q.mcqs?.filter(m => m.question).length || 0}/10 configured
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => handleEdit(q)} className="p-1.5 rounded-lg transition-colors"
                            style={{ color: '#818cf8', background: 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          ><Edit2 style={{ width: '0.9rem', height: '0.9rem' }} /></button>
                          <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg transition-colors"
                            style={{ color: '#fca5a5', background: 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          ><Trash2 style={{ width: '0.9rem', height: '0.9rem' }} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
