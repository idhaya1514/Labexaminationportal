import { useState, useEffect } from 'react';
import {
  Shield, ArrowLeft, Users, FileText, Download, Search,
  TrendingUp, BookOpen, UserPlus, BarChart2, Loader2,
  AlertCircle, CheckCircle, X, RefreshCw, Calendar
} from 'lucide-react';
import { DEPARTMENTS } from './StudentManagement';
import { getExamResults, clearAllExamData } from '../services/api';
import { toast } from 'sonner';

interface AdminPanelProps {
  onBack: () => void;
  onManageQuestions: () => void;
  onManageStudents: () => void;
  onViewPerformance: () => void;
  onDailyTracker: () => void;
}

const DEPT_SHORT: Record<string, string> = {
  'Artificial Intelligence and Data Science': 'AI & DS',
  'Computer Science': 'CSE',
  'Information Technology': 'IT',
  'Cyber Security': 'CYS',
};
const DEPT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Artificial Intelligence and Data Science': { bg: 'rgba(139,92,246,0.1)', text: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
  'Computer Science':                          { bg: 'rgba(59,130,246,0.1)', text: '#93c5fd', border: 'rgba(59,130,246,0.2)' },
  'Information Technology':                    { bg: 'rgba(16,185,129,0.1)', text: '#6ee7b7', border: 'rgba(16,185,129,0.2)' },
  'Cyber Security':                            { bg: 'rgba(239,68,68,0.1)',  text: '#fca5a5', border: 'rgba(239,68,68,0.2)'  },
};

const card = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '14px',
};

const navBtn = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.5rem 0.875rem', borderRadius: '8px',
  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(203,213,225,0.8)', transition: 'all 0.2s ease',
};

export default function AdminPanel({ onBack, onManageQuestions, onManageStudents, onViewPerformance, onDailyTracker }: AdminPanelProps) {
  const [results, setResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterQuestion, setFilterQuestion] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { loadResults(); }, []);
  useEffect(() => { filterResults(); }, [searchTerm, filterDept, filterQuestion, results]);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const data = await getExamResults();
      setResults(data);
    } catch (error: any) {
      toast.error('Failed to load exam results: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...results];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.student.name.toLowerCase().includes(term) ||
        r.student.registerNumber.toLowerCase().includes(term)
      );
    }
    if (filterDept !== 'all') filtered = filtered.filter(r => (r.student.department || '') === filterDept);
    if (filterQuestion !== 'all') filtered = filtered.filter(r => r.question === filterQuestion);
    setFilteredResults(filtered);
  };

  const exportAllResults = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Exam_Results_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Results exported successfully');
  };

  const clearAllResults = async () => {
    if (confirm('Are you sure you want to clear ALL exam results and student assignments? This cannot be undone.')) {
      try {
        await clearAllExamData();
        toast.success('All exam data cleared successfully');
        setResults([]);
        setFilteredResults([]);
      } catch (error: any) {
        toast.error('Failed to clear data: ' + error.message);
      }
    }
  };

  const questions = [...new Set(results.map(r => r.question))];
  const totalStudents = new Set(results.map(r => r.student.registerNumber)).size;
  const avgScore = results.length > 0
    ? (results.reduce((s, r) => s + ((r.programmingMarks || 0) + (r.mcqMarks || 0)), 0) / results.length).toFixed(1)
    : '0.0';
  const malpracticeCount = results.filter(r => r.malpractice).length;
  const deptCounts = DEPARTMENTS.map(dept => ({
    dept, count: results.filter(r => r.student.department === dept).length,
  }));

  const selectStyle = {
    width: '100%', padding: '0.625rem 1rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '9px', color: '#e2e8f0', fontSize: '0.8rem',
    appearance: 'none' as const, outline: 'none', cursor: 'pointer', transition: 'all 0.2s'
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Top Nav ── */}
        <div className="flex items-center justify-between mb-5 animate-fade-in" style={{
          ...card,
          background: 'rgba(124,58,237,0.06)',
          border: '1px solid rgba(124,58,237,0.12)',
          padding: '0.875rem 1.25rem'
        }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{
              background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
              boxShadow: '0 4px 10px rgba(124,58,237,0.3)'
            }}>
              <Shield className="w-4.5 h-4.5 text-white" style={{ width: '1.1rem', height: '1.1rem' }} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>SSCET Lab Examination System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Students',    icon: UserPlus,   action: onManageStudents },
              { label: 'Questions',   icon: BookOpen,   action: onManageQuestions },
              { label: 'Performance', icon: BarChart2,  action: onViewPerformance },
            ].map(({ label, icon: Icon, action }) => (
              <button key={label} onClick={action} style={navBtn}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; e.currentTarget.style.color = '#c7d2fe'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(203,213,225,0.8)'; }}
              >
                <Icon style={{ width: '0.875rem', height: '0.875rem' }} />
                {label}
              </button>
            ))}
            <button onClick={onDailyTracker} style={{
              ...navBtn, background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', color: '#5eead4'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.1)'; }}
            >
              <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
              Daily Tracker
            </button>
            <button onClick={loadResults} style={navBtn}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <RefreshCw style={{ width: '0.875rem', height: '0.875rem' }} />
              Refresh
            </button>
            <button onClick={onBack} style={{ ...navBtn, color: '#fca5a5', background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.15)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
            >
              <ArrowLeft style={{ width: '0.875rem', height: '0.875rem' }} />
              Logout
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { icon: Users,       label: 'Total Students',  value: totalStudents,       color: '#818cf8', accent: 'rgba(99,102,241,' },
            { icon: FileText,    label: 'Submissions',     value: results.length,       color: '#34d399', accent: 'rgba(16,185,129,' },
            { icon: TrendingUp,  label: 'Average Score',   value: `${avgScore}/50`,     color: '#a78bfa', accent: 'rgba(139,92,246,' },
            { icon: AlertCircle, label: 'Malpractice',     value: malpracticeCount,     color: '#fca5a5', accent: 'rgba(239,68,68,'  },
          ].map(({ icon: Icon, label, value, color, accent }) => (
            <div key={label} style={{ ...card, padding: '1.25rem' }} className="animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${accent}0.12)` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-black text-white mb-0.5">{value}</p>
              <p className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.5)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Dept Breakdown ── */}
        <div style={{ ...card, padding: '1.25rem', marginBottom: '1.25rem' }} className="animate-fade-in">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(148,163,184,0.4)' }}>Submissions by Department</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {deptCounts.map(({ dept, count }) => {
              const dc = DEPT_COLORS[dept] || { bg: 'rgba(255,255,255,0.05)', text: '#94a3b8', border: 'rgba(255,255,255,0.1)' };
              const isActive = filterDept === dept;
              return (
                <button
                  key={dept}
                  onClick={() => setFilterDept(filterDept === dept ? 'all' : dept)}
                  style={{
                    background: isActive ? dc.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? dc.border : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '10px', padding: '0.875rem', textAlign: 'left',
                    transition: 'all 0.2s ease', cursor: 'pointer'
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: isActive ? dc.text : 'rgba(148,163,184,0.5)' }}>
                    {DEPT_SHORT[dept] || dept}
                  </p>
                  <p className="text-2xl font-black text-white">{count}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{ ...card, padding: '1.25rem', marginBottom: '1.25rem' }} className="animate-fade-in">
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(148,163,184,0.4)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search name or reg. no..."
                style={{ ...selectStyle, paddingLeft: '2.2rem' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={selectStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterQuestion} onChange={e => setFilterQuestion(e.target.value)} style={selectStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <option value="all">All Questions</option>
              {questions.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={exportAllResults} disabled={results.length === 0} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '8px',
              background: results.length === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(16,185,129,0.1)',
              border: `1px solid ${results.length === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(16,185,129,0.2)'}`,
              color: results.length === 0 ? 'rgba(148,163,184,0.3)' : '#6ee7b7',
              fontSize: '0.8rem', fontWeight: 600, cursor: results.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}>
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
            <button onClick={clearAllResults} disabled={results.length === 0} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '8px',
              background: results.length === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${results.length === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(239,68,68,0.18)'}`,
              color: results.length === 0 ? 'rgba(148,163,184,0.3)' : '#fca5a5',
              fontSize: '0.8rem', fontWeight: 600, cursor: results.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}>
              <X className="w-3.5 h-3.5" /> Clear All Data
            </button>
          </div>
        </div>

        {/* ── Results Table ── */}
        <div style={{ ...card, overflow: 'hidden' }} className="animate-fade-in">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#818cf8' }} />
              <p className="text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>Loading exam records...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <FileText className="w-7 h-7" style={{ color: 'rgba(148,163,184,0.2)' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'rgba(148,163,184,0.5)' }}>No results found</p>
              <p className="text-xs" style={{ color: 'rgba(148,163,184,0.3)' }}>Student exam results will appear here after submissions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                    {['Student', 'Reg. No.', 'Department', 'Question', 'Program', 'MCQ', 'Total', '%'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: h === 'Student' || h === 'Reg. No.' || h === 'Department' || h === 'Question' ? 'left' : 'center', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.4)', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, idx) => {
                    const computedTotal = (result.programmingMarks || 0) + (result.mcqMarks || 0);
                    const percentage = ((computedTotal / (result.maxMarks || 50)) * 100);
                    const dept = result.student.department || '';
                    const dc = DEPT_COLORS[dept];
                    return (
                      <tr key={result.id} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: result.malpractice ? 'rgba(239,68,68,0.04)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                        transition: 'background 0.15s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = result.malpractice ? 'rgba(239,68,68,0.04)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                      >
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{
                              background: 'rgba(99,102,241,0.1)', color: '#818cf8'
                            }}>
                              {result.student.name.charAt(0)}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-white">{result.student.name}</span>
                              {result.malpractice && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs font-bold rounded" style={{ background: 'rgba(239,68,68,0.8)', color: '#fff' }}>MALPRACTICE</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(148,163,184,0.6)', letterSpacing: '0.04em' }}>
                          {result.student.registerNumber}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {dc ? (
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
                              {DEPT_SHORT[dept] || dept}
                            </span>
                          ) : <span style={{ color: 'rgba(148,163,184,0.4)', fontSize: '0.75rem' }}>N/A</span>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', maxWidth: '200px' }}>
                          <p style={{ fontSize: '0.8rem', color: 'rgba(148,163,184,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={result.question}>
                            {result.question || 'N/A'}
                          </p>
                          {result.malpractice && result.malpracticeReason && (
                            <p style={{ fontSize: '0.7rem', color: '#fca5a5', marginTop: '2px' }}>{result.malpracticeReason}</p>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#c7d2fe' }}>
                          {result.programmingMarks || 0}/30
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#c7d2fe' }}>
                          {result.mcqMarks || 0}/20
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 800, color: '#a5b4fc' }}>
                          {computedTotal}/{result.maxMarks || 50}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
                            background: percentage >= 70 ? 'rgba(16,185,129,0.12)' : percentage >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                            color: percentage >= 70 ? '#6ee7b7' : percentage >= 50 ? '#fcd34d' : '#fca5a5',
                            border: `1px solid ${percentage >= 70 ? 'rgba(16,185,129,0.2)' : percentage >= 50 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                          }}>
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table footer */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.35)' }}>
              Showing <span style={{ color: '#818cf8', fontWeight: 700 }}>{filteredResults.length}</span> of {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.25)' }}>SQLite · SSCET Exam DB</p>
          </div>
        </div>

      </div>
    </div>
  );
}
