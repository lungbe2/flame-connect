import React, { useEffect, useRef, useState } from 'react';
import TurnstileWidget, { type TurnstileWidgetRef } from '../components/TurnstileWidget';
import { supabase } from '../lib/supabase';

export default function LoginPage({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileWidgetRef | null>(null);

  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery')) {
      setIsRecoveryMode(true);
      setMessage('Create your new password below.');
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setMessage('Create your new password below.');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const humanizeLoginError = (rawMessage: string) => {
    const msg = (rawMessage || '').toLowerCase();
    if (msg.includes('invalid login credentials')) {
      return 'Incorrect email or password. Double-check and try again.';
    }
    if (msg.includes('email not confirmed')) {
      return 'Your email is not confirmed yet. Open your inbox and click the verification link first.';
    }
    if (msg.includes('user not found')) {
      return 'No account found with this email. Create an account first.';
    }
    if (msg.includes('too many requests')) {
      return 'Too many login attempts. Please wait a minute and try again.';
    }
    return rawMessage || 'Unable to log in right now. Please try again.';
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!captchaToken) {
      setMessage('Please complete the human verification first.');
      return;
    }
    setLoading(true);
    setMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
      options: { captchaToken }
    });

    if (error) {
      setMessage(humanizeLoginError(error.message));
    } else {
      if (data.user) {
        await supabase.from('profiles').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', data.user.id);
      }
      onLogin();
    }

    setLoading(false);
    captchaRef.current?.reset();
  };

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!captchaToken) {
      setMessage('Please complete the human verification first.');
      return;
    }
    setLoading(true);
    setMessage('');

    const emailToReset = resetEmail.trim().toLowerCase();
    const redirectTo = `${window.location.origin}`;
    const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, { redirectTo, captchaToken });

    if (error) {
      setMessage(error.message || 'Unable to send reset link right now.');
    } else {
      setMessage('Password reset link sent. Check your email inbox.');
      setShowForgotPassword(false);
    }

    setLoading(false);
    captchaRef.current?.reset();
  };

  const handleUpdatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage(error.message || 'Unable to update password right now.');
    } else {
      setMessage('Password updated. You can now log in.');
      setIsRecoveryMode(false);
      setNewPassword('');
      setConfirmNewPassword('');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '20px' }}>
      <div style={{ width: 'min(980px, 100%)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e9ecf4', background: '#fff' }}>
        <div style={{ padding: '42px', background: 'linear-gradient(160deg, #1f2230 0%, #2f3448 100%)', color: '#fff' }}>
          <div style={{ fontWeight: 700, color: '#ff8899', marginBottom: '16px' }}>Flame Connect</div>
          <h1 style={{ fontSize: '38px', lineHeight: 1.1, margin: 0 }}>Welcome back.</h1>
          <p style={{ marginTop: '14px', color: '#d3d7e8', lineHeight: 1.7 }}>See who is online now, continue chats, and discover people close to you.</p>
        </div>
        <div style={{ padding: '42px' }}>
          <h2 style={{ margin: '0 0 18px', color: '#1f2230' }}>Log in</h2>
          {isRecoveryMode ? (
            <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gap: '12px' }}>
              <p style={{ margin: 0, color: '#646a80' }}>Set your new password.</p>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}
                required
              />
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 700 }}
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          ) : !showForgotPassword ? (
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: '12px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}
                required
              />
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  style={{ width: '100%', padding: '13px 94px 13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: '1px solid #e2e6f0',
                    background: '#fff',
                    borderRadius: '999px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#49506a'
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowForgotPassword(true);
                  setMessage('');
                  setCaptchaToken(null);
                }}
                style={{ background: 'none', border: 'none', color: '#e83f5b', cursor: 'pointer', justifySelf: 'start', padding: 0, fontWeight: 600 }}
              >
                Forgot password?
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 700 }}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
              <TurnstileWidget ref={captchaRef} onTokenChange={setCaptchaToken} />
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} style={{ display: 'grid', gap: '12px' }}>
              <p style={{ margin: 0, color: '#646a80' }}>Enter your account email and we will send you a password reset link.</p>
              <input
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}
                required
              />
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 700 }}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <TurnstileWidget ref={captchaRef} onTokenChange={setCaptchaToken} />
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setMessage('');
                  setCaptchaToken(null);
                }}
                style={{ background: 'none', border: 'none', color: '#49506a', cursor: 'pointer', justifySelf: 'start', padding: 0, fontWeight: 600 }}
              >
                Back to login
              </button>
            </form>
          )}
          <p style={{ marginTop: '16px', color: '#646a80' }}>
            New here?{' '}
            <button onClick={onSwitchToSignup} style={{ background: 'none', border: 'none', color: '#e83f5b', cursor: 'pointer', fontWeight: 600 }}>
              Create an account
            </button>
          </p>
          {message && <p style={{ marginTop: '10px', color: '#d93e5b' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
