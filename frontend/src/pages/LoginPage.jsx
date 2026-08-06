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
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgGlow1}></div>
      <div style={styles.bgGlow2}></div>

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#a78bfa' }}>biotech</span>
          </div>
          <h1 style={styles.title}>Carcinova</h1>
          <p style={styles.subtitle}>Histopathology AI Platform</p>
        </div>

        {/* Toggle */}
        <div style={styles.toggleContainer}>
          <button
            onClick={() => { setIsRegister(false); setError(''); }}
            style={!isRegister ? styles.toggleActive : styles.toggleInactive}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(''); }}
            style={isRegister ? styles.toggleActive : styles.toggleInactive}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>person</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                style={styles.input}
                autoComplete="username"
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={styles.input}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span style={styles.spinner}></span>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {isRegister ? 'person_add' : 'login'}
                </span>
                {isRegister ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <p style={styles.footer}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={styles.footerLink}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </span>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0a1a 0%, #1a1025 30%, #0d1117 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  bgGlow1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
    top: '10%',
    left: '15%',
    animation: 'float1 8s ease-in-out infinite',
  },
  bgGlow2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
    bottom: '10%',
    right: '15%',
    animation: 'float2 10s ease-in-out infinite',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    width: '420px',
    padding: '40px',
    borderRadius: '20px',
    background: 'rgba(26, 20, 40, 0.85)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.05)',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f0e6ff',
    margin: '0 0 4px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#8b7da8',
    margin: 0,
  },
  toggleContainer: {
    display: 'flex',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '4px',
    marginBottom: '24px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  toggleActive: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#fff',
    transition: 'all 0.3s',
  },
  toggleInactive: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    background: 'transparent',
    color: '#8b7da8',
    transition: 'all 0.3s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#a899c2',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '0 14px',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
  inputIcon: {
    fontSize: '20px',
    color: '#7c6a99',
    marginRight: '10px',
  },
  input: {
    flex: 1,
    padding: '13px 0',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#e8dff5',
    fontSize: '15px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#fca5a5',
    fontSize: '13px',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#fff',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
    marginTop: '4px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#7c6a99',
    marginTop: '20px',
  },
  footerLink: {
    color: '#a78bfa',
    cursor: 'pointer',
    fontWeight: '600',
  },
};

export default LoginPage;
