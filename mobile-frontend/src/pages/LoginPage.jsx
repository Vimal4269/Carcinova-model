import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (isRegister && password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Check backend connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f4f8] p-4 relative overflow-hidden font-body">
      
      {/* Background Decorative Element matching Carcinova theme */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

      {/* Main Login Card - Medical Surface Container Style */}
      <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-outline-variant relative z-10">
        
        {/* Header / Brand Branding matching Sidebar */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-inverse-surface flex items-center justify-center mb-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl text-inverse-on-surface">biotech</span>
          </div>
          <h1 className="font-headline-md text-3xl font-bold text-on-surface tracking-tight">Carcinova</h1>
          <p className="font-body-base text-on-surface-variant text-sm mt-1">Histopathology AI Platform</p>
        </div>

        {/* Tab Toggle - Sign In / Register */}
        <div className="flex bg-surface-container rounded-xl p-1 mb-6 border border-outline-variant">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              !isRegister
                ? 'bg-white text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              isRegister
                ? 'bg-white text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-xs font-semibold text-on-surface uppercase tracking-wider">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-xl">person</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full h-12 pl-11 pr-4 bg-surface border border-outline rounded-xl text-body-base text-on-surface placeholder:text-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-xs font-semibold text-on-surface uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-xl">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 pl-11 pr-4 bg-surface border border-outline rounded-xl text-body-base text-on-surface placeholder:text-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-on-primary font-label-large font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">
                  {isRegister ? 'person_add' : 'login'}
                </span>
                {isRegister ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-outline-variant pt-6">
          <p className="text-sm text-on-surface-variant">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-primary font-bold hover:underline ml-1 cursor-pointer"
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
