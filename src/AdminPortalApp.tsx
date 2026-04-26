import React, { useEffect, useRef, useState } from 'react';
import { supabase } from './lib/supabase';
import AdminPage from './pages/AdminPage';
import TurnstileWidget, { type TurnstileWidgetRef } from './components/TurnstileWidget';

const ADMIN_EMAIL = 'lungbe2@gmail.com';

export default function AdminPortalApp() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileWidgetRef | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!captchaToken) {
      setMessage('Please complete the human verification first.');
      return;
    }
    setSubmitting(true);
    setMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken }
    });
    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      captchaRef.current?.reset();
      return;
    }

    const nextUser = data?.user || null;
    if (!nextUser || nextUser.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setMessage('This account is not authorized for admin portal.');
      setSubmitting(false);
      captchaRef.current?.reset();
      return;
    }

    setUser(nextUser);
    setSubmitting(false);
    captchaRef.current?.reset();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('admin_unlocked');
    setUser(null);
    setEmail('');
    setPassword('');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading admin portal...</div>;
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '20px' }}>
        <div style={{ width: 'min(520px, 100%)', background: '#fff', border: '1px solid #e8ebf3', borderRadius: '16px', padding: '22px' }}>
          <h1 style={{ marginTop: 0, color: '#e83f5b' }}>Admin Portal</h1>
          <p style={{ color: '#6d7489' }}>This area is private and only accessible via direct URL.</p>
          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '10px' }}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Admin email"
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #dfe4ef', borderRadius: '10px', background: '#f8f9fd' }}
              required
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                style={{ width: '100%', padding: '12px 86px 12px 14px', border: '1px solid #dfe4ef', borderRadius: '10px', background: '#f8f9fd' }}
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
                  border: '1px solid #e1e6f0',
                  background: '#fff',
                  borderRadius: '999px',
                  padding: '5px 9px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                border: 'none',
                borderRadius: '999px',
                padding: '12px',
                cursor: 'pointer',
                color: '#fff',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)'
              }}
            >
              {submitting ? 'Signing in...' : 'Sign in to Admin'}
            </button>
            <TurnstileWidget ref={captchaRef} onTokenChange={setCaptchaToken} />
          </form>
          {message && <p style={{ color: '#d93e5b', marginBottom: 0 }}>{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 20px 0' }}>
        <button
          onClick={handleLogout}
          style={{ border: '1px solid #dfe4ef', background: '#fff', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>
      <AdminPage user={user} onBack={() => (window.location.href = '/')} />
    </>
  );
}
