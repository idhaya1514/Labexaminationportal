import { useState } from 'react';
import { Shield, Lock, User, Loader2, ArrowLeft, AlertCircle, Eye, EyeOff, ChevronRight } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const ADMIN_USERNAME = 'sscet';
const ADMIN_PASSWORD = 'adminsscet@2026';

const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '20px',
  boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.05) inset',
};

export default function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Please enter your username'); return; }
    if (!password) { setError('Please enter your password'); return; }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Invalid credentials. Please check your username and password.');
    }
    setIsLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }} />
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        animation: 'floatOrb 9s ease-in-out infinite'
      }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[450px] h-[450px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        animation: 'floatOrb 11s ease-in-out infinite reverse'
      }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-5 text-sm font-medium transition-colors"
          style={{ color: 'rgba(148,163,184,0.5)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.5)'}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Student Login
        </button>

        <div style={{ ...cardStyle, padding: '2.5rem' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{
              background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
              boxShadow: '0 8px 24px rgba(124,58,237,0.35)'
            }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Admin Portal</h1>
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.6)', letterSpacing: '0.05em' }}>Secure Administrator Access</p>
          </div>

          <div className="mb-6" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)' }} />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#94a3b8' }}>Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7c3aed' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  autoComplete="username"
                  style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#94a3b8' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7c3aed' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '3rem' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(148,163,184,0.4)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm animate-fade-in" style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5'
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
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                background: isLoading ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)',
                border: '1px solid rgba(124,58,237,0.3)',
                boxShadow: isLoading ? 'none' : '0 4px 16px rgba(124,58,237,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s ease',
                marginTop: '0.5rem'
              }}
              onMouseEnter={e => { if (!isLoading) { (e.target as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)'; (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)'; (e.target as HTMLButtonElement).style.transform = 'none'; }}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</>
              ) : (
                <><Shield className="w-4 h-4" /> Sign In as Admin <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
