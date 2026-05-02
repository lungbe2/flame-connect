import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './lib/supabase';
import AdminPage from './pages/AdminPage';
import TurnstileWidget, { type TurnstileWidgetRef } from './components/TurnstileWidget';

const ADMIN_EMAIL = 'lungbe2@gmail.com';
const MFA_ISSUER = 'Flame Connect';

const getQrCodePayload = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { type: 'none' as const, value: '' };
  }

  if (trimmed.startsWith('<svg')) {
    return { type: 'svg' as const, value: trimmed };
  }

  if (trimmed.startsWith('data:image')) {
    return { type: 'image' as const, value: trimmed };
  }

  return { type: 'image' as const, value: `data:image/svg+xml;utf8,${encodeURIComponent(trimmed)}` };
};

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
  const [accessStep, setAccessStep] = useState<'login' | 'enroll' | 'verify' | 'ready'>('login');
  const [totpFactorId, setTotpFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  const resetMfaState = useCallback(() => {
    setTotpFactorId('');
    setQrCode('');
    setManualSecret('');
    setVerifyCode('');
  }, []);

  const syncAdminAccess = useCallback(async (nextUser: any) => {
    if (!nextUser || nextUser.email !== ADMIN_EMAIL) {
      setAccessStep('login');
      resetMfaState();
      return;
    }

    const [{ data: aalData, error: aalError }, { data: factorsData, error: factorsError }] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors()
    ]);

    if (aalError || factorsError) {
      setMessage(aalError?.message || factorsError?.message || 'Unable to check MFA status right now.');
      setAccessStep('login');
      resetMfaState();
      return;
    }

    const verifiedTotpFactor = factorsData?.totp?.[0] || null;
    if (verifiedTotpFactor) {
      setTotpFactorId(verifiedTotpFactor.id);
      setQrCode('');
      setManualSecret('');
      setVerifyCode('');

      if (aalData?.currentLevel === 'aal2') {
        setAccessStep('ready');
      } else {
        setAccessStep('verify');
      }
      return;
    }

    const staleUnverifiedFactor = factorsData?.all?.find((factor) => factor.factor_type === 'totp' && factor.status === 'unverified');
    if (staleUnverifiedFactor) {
      await supabase.auth.mfa.unenroll({ factorId: staleUnverifiedFactor.id });
    }

    const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: MFA_ISSUER,
      friendlyName: 'Admin Authenticator'
    });

    if (enrollError || !enrollData) {
      setMessage(enrollError?.message || 'Unable to start MFA setup right now.');
      setAccessStep('login');
      resetMfaState();
      return;
    }

    setTotpFactorId(enrollData.id);
    setQrCode(enrollData.totp.qr_code);
    setManualSecret(enrollData.totp.secret);
    setVerifyCode('');
    setAccessStep('enroll');
  }, [resetMfaState]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      if (currentUser?.email === ADMIN_EMAIL) {
        await syncAdminAccess(currentUser);
      } else {
        setAccessStep('login');
      }
      setLoading(false);
    };
    init();
  }, [syncAdminAccess]);

  const completeMfaChallenge = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!totpFactorId) {
      setMessage('No authenticator factor is available. Please sign in again.');
      return;
    }
    if (verifyCode.trim().length !== 6) {
      setMessage('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
    if (challengeError || !challengeData) {
      setMessage(challengeError?.message || 'Unable to start MFA verification.');
      setSubmitting(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totpFactorId,
      challengeId: challengeData.id,
      code: verifyCode.trim()
    });

    if (verifyError) {
      setMessage(verifyError.message || 'Incorrect verification code.');
      setSubmitting(false);
      return;
    }

    setVerifyCode('');
    setSubmitting(false);
    setAccessStep('ready');
  };

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
    await syncAdminAccess(nextUser);
    setSubmitting(false);
    captchaRef.current?.reset();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('admin_unlocked');
    setUser(null);
    setEmail('');
    setPassword('');
    setCaptchaToken(null);
    resetMfaState();
    setAccessStep('login');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading admin portal...</div>;
  }

  if (!user || accessStep === 'login') {
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

  if (accessStep === 'enroll' || accessStep === 'verify') {
    const qrCodePayload = getQrCodePayload(qrCode);
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '20px' }}>
        <div style={{ width: 'min(560px, 100%)', background: '#fff', border: '1px solid #e8ebf3', borderRadius: '18px', padding: '24px' }}>
          <h1 style={{ marginTop: 0, color: '#e83f5b' }}>
            {accessStep === 'enroll' ? 'Set up admin MFA' : 'Verify admin sign-in'}
          </h1>
          {accessStep === 'enroll' ? (
            <>
              <p style={{ color: '#667089', lineHeight: 1.6 }}>
                Scan this QR code with Google Authenticator, Microsoft Authenticator, Authy, or another TOTP app. Then enter the 6-digit code to finish setup.
              </p>
              {qrCodePayload.type !== 'none' && (
                <div style={{ display: 'grid', placeItems: 'center', padding: '14px', borderRadius: '16px', background: '#fff7f9', border: '1px solid #f3d4da', marginBottom: '14px' }}>
                  {qrCodePayload.type === 'svg' ? (
                    <div
                      aria-label="Admin MFA QR code"
                      style={{ width: '220px', height: '220px', maxWidth: '100%', display: 'grid', placeItems: 'center' }}
                      dangerouslySetInnerHTML={{ __html: qrCodePayload.value }}
                    />
                  ) : (
                    <img src={qrCodePayload.value} alt="Admin MFA QR code" style={{ width: '220px', height: '220px', maxWidth: '100%' }} />
                  )}
                </div>
              )}
              <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '12px', background: '#f8f9fd', border: '1px solid #e2e7f2' }}>
                <div style={{ fontSize: '12px', color: '#6b738c', marginBottom: '6px' }}>Manual setup code</div>
                <code style={{ wordBreak: 'break-all', color: '#20263c', fontSize: '14px' }}>{manualSecret}</code>
              </div>
            </>
          ) : (
            <p style={{ color: '#667089', lineHeight: 1.6 }}>
              Enter the 6-digit code from your authenticator app to unlock the admin dashboard.
            </p>
          )}

          <form onSubmit={completeMfaChallenge} style={{ display: 'grid', gap: '12px' }}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={verifyCode}
              onChange={(event) => setVerifyCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd', letterSpacing: '0.32em', fontSize: '22px', textAlign: 'center' }}
              required
            />
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
              {submitting ? 'Verifying...' : accessStep === 'enroll' ? 'Finish MFA setup' : 'Verify and continue'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              style={{ border: '1px solid #dfe4ef', background: '#fff', borderRadius: '999px', padding: '12px', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancel
            </button>
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
