import React, { useMemo, useState } from 'react';
import SiteFooter from '../components/SiteFooter';
import { VIEW_KEYS } from '../config/navigation';

type CoachingPageProps = {
  user?: any;
  profile?: any;
  onBack: () => void;
  onNavigate?: (view: string) => void;
};

const pageCardStyle: React.CSSProperties = {
  border: '1px solid #e8ebf3',
  borderRadius: '24px',
  background: '#fff',
  boxShadow: '0 16px 30px rgba(27, 36, 61, 0.08)'
};

export default function CoachingPage({ user, profile, onBack, onNavigate }: CoachingPageProps) {
  const [name, setName] = useState(profile?.display_name || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [goal, setGoal] = useState('profile-review');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const goalLabels: Record<string, string> = {
    'profile-review': 'Profile review',
    'dating-tips': 'Dating tips',
    'conversation-help': 'Conversation help',
    'vip-guidance': 'VIP guidance'
  };

  const mailtoHref = useMemo(() => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const selectedGoal = goalLabels[goal] || 'Coaching request';

    const subject = `Flame Connect Coaching Request - ${selectedGoal}`;
    const body = [
      `Name: ${trimmedName || 'Not provided'}`,
      `Email: ${trimmedEmail || 'Not provided'}`,
      `Request type: ${selectedGoal}`,
      '',
      'What help do you need?',
      trimmedMessage || 'Please contact me about coaching support.'
    ].join('\n');

    return `mailto:coaching@flameconnect.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [name, email, goal, message]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please complete your name, email, and request details.');
      return;
    }

    setError('');
    window.location.href = mailtoHref;
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '18px auto', padding: '0 10px 14px' }}>
      <section style={{ marginBottom: '14px' }}>
        <div className="brand-banner brand-banner-hero">
          <img className="brand-banner-image" src="/brand/flame-banner-clean.png" alt="Flame Connect coaching banner" />
          <div className="brand-banner-overlay" />
          <div className="brand-banner-chip">
            <img className="brand-banner-chip-logo" src="/favicon.svg" alt="Flame Connect" />
            <div>
              <div className="brand-banner-chip-title">Flame Connect Coaching</div>
              <div className="brand-banner-chip-copy">Dating tips, profile feedback, and VIP-style guidance when you want extra support.</div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          ...pageCardStyle,
          padding: '28px',
          marginBottom: '16px',
          background: 'linear-gradient(140deg, #fff7f8 0%, #ffffff 52%, #fff0f4 100%)'
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            border: '1px solid #f0d5dc',
            background: '#fff',
            color: '#1f2230',
            borderRadius: '999px',
            padding: '10px 16px',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '18px'
          }}
        >
          Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e83f5b', marginBottom: '10px' }}>VIP coaching</div>
            <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.02, letterSpacing: '-0.04em', color: '#1f2230' }}>
              Request help from Flame Connect dating coaches.
            </h1>
            <p style={{ margin: 0, color: '#60657b', lineHeight: 1.7, fontSize: '17px' }}>
              Members can request guidance for profile polish, better conversations, confidence boosts, and dating strategy from qualified coaches.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ ...pageCardStyle, padding: '16px' }}>
              <strong style={{ color: '#1f2230' }}>What you can request</strong>
              <div style={{ marginTop: '8px', color: '#60657b', lineHeight: 1.6 }}>
                Profile reviews, photo feedback, messaging help, first-date tips, and VIP-style match guidance.
              </div>
            </div>
            <div style={{ ...pageCardStyle, padding: '16px' }}>
              <strong style={{ color: '#1f2230' }}>How we respond</strong>
              <div style={{ marginTop: '8px', color: '#60657b', lineHeight: 1.6 }}>
                Requests go to <a href="mailto:coaching@flameconnect.co.za" style={{ color: '#e83f5b', fontWeight: 700, textDecoration: 'none' }}>coaching@flameconnect.co.za</a> so the team can reply directly.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ ...pageCardStyle, padding: '22px' }}>
          <h2 style={{ margin: '0 0 10px', color: '#1f2230' }}>Why request coaching?</h2>
          <div style={{ display: 'grid', gap: '10px', color: '#60657b', lineHeight: 1.65 }}>
            <div>Get a sharper profile that attracts better matches.</div>
            <div>Learn what to say when chats feel slow or awkward.</div>
            <div>Ask for guidance before a first date or video call.</div>
            <div>Get VIP-style support when you want faster progress.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ ...pageCardStyle, padding: '22px', display: 'grid', gap: '12px' }}>
          <h2 style={{ margin: 0, color: '#1f2230' }}>Send a coaching request</h2>
          <p style={{ margin: 0, color: '#60657b', lineHeight: 1.6 }}>
            This opens an email to the coaching team with your details prefilled.
          </p>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            style={{ width: '100%', padding: '13px 14px', borderRadius: '14px', border: '1px solid #e1e6f0', background: '#f9fbff' }}
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email"
            style={{ width: '100%', padding: '13px 14px', borderRadius: '14px', border: '1px solid #e1e6f0', background: '#f9fbff' }}
          />
          <select
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            style={{ width: '100%', padding: '13px 14px', borderRadius: '14px', border: '1px solid #e1e6f0', background: '#f9fbff' }}
          >
            <option value="profile-review">Profile review</option>
            <option value="dating-tips">Dating tips</option>
            <option value="conversation-help">Conversation help</option>
            <option value="vip-guidance">VIP guidance</option>
          </select>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tell the coaching team what you want help with."
            rows={6}
            style={{ width: '100%', padding: '13px 14px', borderRadius: '14px', border: '1px solid #e1e6f0', background: '#f9fbff', resize: 'vertical' }}
          />

          {error && <div style={{ color: '#d93e5b', fontWeight: 600 }}>{error}</div>}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)',
                color: '#fff',
                border: 'none',
                padding: '13px 18px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontWeight: 800,
                boxShadow: '0 12px 24px rgba(232,63,91,0.22)'
              }}
            >
              Request coaching
            </button>
            <a
              href="mailto:coaching@flameconnect.co.za"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '13px 18px',
                borderRadius: '999px',
                border: '1px solid #e1e6f0',
                background: '#fff',
                color: '#1f2230',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              Email directly
            </a>
          </div>
        </form>
      </section>

      <section>
        <SiteFooter
          onCoachingClick={() => onNavigate?.(VIEW_KEYS.COACHING)}
          onPrivacyClick={() => onNavigate?.(VIEW_KEYS.PRIVACY)}
          onTermsClick={() => onNavigate?.(VIEW_KEYS.TERMS)}
        />
      </section>
    </div>
  );
}
