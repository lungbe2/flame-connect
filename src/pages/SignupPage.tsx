import React, { useRef, useState } from 'react';
import TurnstileWidget, { type TurnstileWidgetRef } from '../components/TurnstileWidget';
import { supabase } from '../lib/supabase';

const getAgeFromBirthDate = (value: string) => {
  if (!value) {
    return null;
  }

  const birthDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  const hasHadBirthday =
    monthDifference > 0 || (monthDifference === 0 && today.getDate() >= birthDate.getDate());

  if (!hasHadBirthday) {
    age -= 1;
  }

  return age;
};

export default function SignupPage({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileWidgetRef | null>(null);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!captchaToken) {
      setMessage('Please complete the human verification first.');
      return;
    }
    setLoading(true);
    setMessage('');

    const derivedAge = getAgeFromBirthDate(birthDate);
    if (derivedAge === null) {
      setMessage('Enter a valid date of birth.');
      setLoading(false);
      captchaRef.current?.reset();
      return;
    }

    if (derivedAge < 18) {
      setMessage('Flame Connect is strictly for adults aged 18 and older.');
      setLoading(false);
      captchaRef.current?.reset();
      return;
    }

    if (!ageConfirmed) {
      setMessage('You must confirm that you are 18 or older to create an account.');
      setLoading(false);
      captchaRef.current?.reset();
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
          birth_date: birthDate,
          age_confirmed: true
        },
        captchaToken
      }
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email to verify your account, then log in.');
      setTimeout(() => onSwitchToLogin(), 3000);
    }

    setLoading(false);
    captchaRef.current?.reset();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '20px' }}>
      <div style={{ width: 'min(980px, 100%)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e9ecf4', background: '#fff' }}>
        <div style={{ padding: '42px', background: 'linear-gradient(160deg, #1f2230 0%, #2f3448 100%)', color: '#fff' }}>
          <div style={{ fontWeight: 700, color: '#ff8899', marginBottom: '16px' }}>Flame Connect</div>
          <h1 style={{ fontSize: '38px', lineHeight: 1.1, margin: 0 }}>Create your profile and start matching.</h1>
          <p style={{ marginTop: '14px', color: '#d3d7e8', lineHeight: 1.7 }}>Choose your intent, find people nearby, and start meaningful chats.</p>
        </div>
        <div style={{ padding: '42px' }}>
          <h2 style={{ margin: '0 0 18px', color: '#1f2230' }}>Create account</h2>
          <form onSubmit={handleSignup} style={{ display: 'grid', gap: '12px' }}>
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}
            />
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
                placeholder="Password (min 6 characters)"
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
            <div style={{ display: 'grid', gap: '6px' }}>
              <label htmlFor="signup-birth-date" style={{ fontSize: '13px', fontWeight: 700, color: '#49506a' }}>
                Date of birth
              </label>
              <input
                id="signup-birth-date"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}
                required
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e6e9f2', background: '#fff7f8', color: '#4b526b', lineHeight: 1.5 }}>
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(event) => setAgeConfirmed(event.target.checked)}
                style={{ marginTop: '3px' }}
                required
              />
              <span>I confirm that I am at least 18 years old and that the information I provide to Flame Connect is accurate.</span>
            </label>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#6b7288' }}>
              Privacy statement: we only use your details to run your account, improve matching, support safety reviews, and respond to support requests. People under 18 may not register or use this service.
            </p>
            <TurnstileWidget ref={captchaRef} onTokenChange={setCaptchaToken} />
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 700 }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p style={{ marginTop: '16px', color: '#646a80' }}>
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: '#e83f5b', cursor: 'pointer', fontWeight: 600 }}>
              Log in
            </button>
          </p>
          {message && <p style={{ marginTop: '10px', color: message.toLowerCase().includes('error') ? '#d93e5b' : '#2f9e55' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
