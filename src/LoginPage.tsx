import { useState, useEffect } from 'react';
import {
  GraduationCap, User, Hash, BookOpen, Loader2,
  AlertCircle, WifiOff, ChevronRight, Lock
} from 'lucide-react';
import { getStudent, checkServerHealth } from '../services/api';

const DEPARTMENTS = [
  'Artificial Intelligence and Data Science',
  'Computer Science',
  'Information Technology',
  'Cyber Security',
];

interface LoginPageProps {
  onLogin: (student: { name: string; registerNumber: string; department: string }) => void;
  onAdminClick: () => void;
}

export default function LoginPage({ onLogin, onAdminClick }: LoginPageProps) {
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkServerHealth().then(setServerOnline);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Please enter your full name'); return; }
    if (!registerNumber.trim()) { setError('Please enter your register number'); return; }
    if (!department) { setError('Please select your department'); return; }

    if (serverOnline === false) {
      setError('Server is offline. Please contact your administrator.');
      return;
    }

    setIsLoading(true);
    try {
      const student = await getStudent(registerNumber.trim());
      if (student.name.toLowerCase() !== name.trim().toLowerCase()) {
        setError('Name does not match our records. Please check your entry.');
        return;
      }
      if (student.department !== department) {
        setError('Department does not match. Please check your entry.');
        return;
      }
      onLogin({ name: student.name, registerNumber: student.registerNumber, department: student.department });
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('not found') || msg.includes('404')) {
        setError('Register number not found. Contact your administrator.');
      } else if (msg.includes('fetch') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('Cannot connect to server. Ensure the server is running.');
        setServerOnline(false);
      } else {
        setError(msg || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background grid pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }} />

      {/* Ambient orbs */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        animation: 'floatOrb 8s ease-in-out infinite'
      }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
        animation: 'floatOrb 10s ease-in-out infinite reverse'
      }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in">

        {/* Server offline banner */}
        {serverOnline === false && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <span>Server offline — contact your administrator</span>
          </div>
        )}

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.05) inset',
          padding: '2.5rem'
        }}>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative" style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)'
            }}>
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Examination Portal</h1>
            <p className="text-sm font-medium" style={{ color: 'rgba(148,163,184,0.7)', letterSpacing: '0.06em' }}>
              SSCET — Lab Exam System
            </p>
          </div>

          {/* Divider */}
          <div className="mb-6" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)' }} />

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold mb-2 ml-0.5 uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                Department
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6366f1' }} />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{
                    width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                    paddingTop: '0.75rem', paddingBottom: '0.75rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: department ? '#e2e8f0' : 'rgba(148,163,184,0.5)',
                    fontSize: '0.875rem', appearance: 'none', cursor: 'pointer',
                    transition: 'all 0.2s ease', outline: 'none'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="">Select your department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold mb-2 ml-0.5 uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6366f1' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                    paddingTop: '0.75rem', paddingBottom: '0.75rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: '#e2e8f0',
                    fontSize: '0.875rem', outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = 'rgba(99,102,241,0.04)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                />
              </div>
            </div>

            {/* Register Number */}
            <div>
              <label className="block text-xs font-semibold mb-2 ml-0.5 uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                Register Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6366f1' }} />
                <input
                  type="text"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., 2023CS001"
                  style={{
                    width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                    paddingTop: '0.75rem', paddingBottom: '0.75rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: '#e2e8f0',
                    fontSize: '0.875rem', fontFamily: 'monospace',
                    letterSpacing: '0.05em', outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = 'rgba(99,102,241,0.04)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm animate-fade-in" style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#fca5a5'
              }}>
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '0.9rem',
                letterSpacing: '0.01em',
                color: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                background: isLoading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                boxShadow: isLoading ? 'none' : '0 4px 16px rgba(99,102,241,0.3)',
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '0.5rem'
              }}
              onMouseEnter={e => { if (!isLoading) { (e.target as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)'; (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.3)'; (e.target as HTMLButtonElement).style.transform = 'none'; }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Login to Examination
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Admin link */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-center">
              <button
                onClick={onAdminClick}
                className="text-xs font-medium transition-colors flex items-center gap-1.5"
                style={{ color: 'rgba(148,163,184,0.6)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.6)')}
              >
                Admin Panel
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-5 text-xs" style={{ color: 'rgba(100,116,139,0.5)' }}>
          © 2026 SSCET Lab Examination System · All Rights Reserved
        </p>
      </div>
    </div>
  );
}
