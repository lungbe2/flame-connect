import React from 'react';
import { VIEW_KEYS } from '../config/navigation';
import SiteFooter from './SiteFooter';

const trustHighlights = [
  {
    title: 'Meet people nearby',
    copy: 'See singles close to your area when both sides have shared location.'
  },
  {
    title: 'Private chat and video',
    copy: 'Start with messages and move to private video calls when the connection feels right.'
  },
  {
    title: 'Safer profile discovery',
    copy: 'Adults-only signup, profile photo checks, and moderation tools help keep things more genuine.'
  },
  {
    title: 'Coaching when you want it',
    copy: 'Request dating tips, profile guidance, and one-on-one support from our coaching team.'
  }
];

const howItWorks = [
  {
    step: '01',
    title: 'Build your profile',
    copy: 'Upload a clear photo, share your vibe, and let people know what you are looking for.'
  },
  {
    step: '02',
    title: 'Discover nearby singles',
    copy: 'Browse people by distance, mood, intent, and live activity instead of guessing blindly.'
  },
  {
    step: '03',
    title: 'Chat, call, and grow',
    copy: 'Move from messages to video calls, and ask for coaching support when you need a confidence boost.'
  }
];

const coachingFeatures = [
  'Profile feedback and bio polish',
  'Conversation and first-date tips',
  'Support from qualified dating coaches'
];

export default function LandingPage({ onLoginClick, onSignupClick, onNavigate }) {
  return (
    <div className="landing-glow" style={{ paddingBottom: '14px' }}>
      <section style={{ maxWidth: '1180px', margin: '18px auto 12px', padding: '0 10px' }}>
        <div className="brand-banner brand-banner-hero">
          <img className="brand-banner-image" src="/brand/flame-banner-clean.png" alt="Flame Connect Ignite Your Love Life banner" />
          <div className="brand-banner-overlay" />
          <div className="brand-banner-chip">
            <img className="brand-banner-chip-logo" src="/favicon.svg" alt="Flame Connect" />
            <div>
              <div className="brand-banner-chip-title">Flame Connect</div>
              <div className="brand-banner-chip-copy">Meet real singles. Match by vibe. Start better conversations.</div>
            </div>
          </div>
        </div>
      </section>
      <nav
        style={{
          maxWidth: '1180px',
          margin: '0 auto 10px',
          padding: '14px 18px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid #ebeef5',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <div className="brand-lockup">
          <div className="brand-lockup-button" style={{ cursor: 'default' }}>
            <img className="brand-lockup-logo" src="/favicon.svg" alt="Flame Connect logo" />
            <span className="brand-lockup-text">Flame Connect</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={onLoginClick} style={{ background: '#fff', color: '#e83f5b', border: '1px solid #f3c7cf', padding: '10px 18px', borderRadius: '999px', cursor: 'pointer', fontWeight: 700 }}>
            Log in
          </button>
          <button
            onClick={onSignupClick}
            style={{
              background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: 800,
              boxShadow: '0 10px 20px rgba(232,63,91,0.27)'
            }}
          >
            Join free
          </button>
        </div>
      </nav>

      <section style={{ maxWidth: '1180px', margin: '10px auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', padding: '0 10px' }}>
        <div
          style={{
            borderRadius: '30px',
            padding: '56px 40px',
            background: 'linear-gradient(155deg, #ffffff 0%, #fff0f4 70%, #ffe4ea 100%)',
            border: '1px solid #f4dbe1',
            boxShadow: '0 18px 35px rgba(39,52,88,0.08)'
          }}
        >
          <div style={{ display: 'inline-block', padding: '7px 13px', borderRadius: '999px', background: '#fff', border: '1px solid #f3ccd4', color: '#e83f5b', fontWeight: 700, marginBottom: '18px' }}>
            Join free. Meet real singles. Get coaching if you want it.
          </div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 60px)', lineHeight: 0.98, letterSpacing: '-0.04em', margin: '0 0 14px', color: '#1e1f2c' }}>
            Meet real singles near you without the chaos.
          </h1>
          <p style={{ fontSize: '18px', color: '#60657b', lineHeight: 1.7, marginBottom: '24px', maxWidth: '580px' }}>
            Flame Connect helps you match by vibe, chat in private, move into video calls when the time is right, and request qualified dating support when you want an extra edge.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={onSignupClick}
              style={{
                background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px 24px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontWeight: 800,
                boxShadow: '0 12px 24px rgba(232,63,91,0.27)'
              }}
            >
              Join free today
            </button>
            <button onClick={onLoginClick} style={{ background: '#fff', color: '#202235', border: '1px solid #e8ebf3', padding: '14px 24px', borderRadius: '999px', cursor: 'pointer', fontWeight: 700 }}>
              Log in
            </button>
          </div>
        </div>

        <aside
          style={{
            borderRadius: '30px',
            padding: '24px',
            background: 'linear-gradient(160deg, #1f2230 0%, #2a2f45 100%)',
            color: '#fff',
            display: 'grid',
            gap: '12px',
            minHeight: '420px',
            alignContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffb6c0', marginBottom: '10px' }}>Why people choose it</div>
            <div style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.05 }}>Built for genuine connection.</div>
            <div style={{ fontSize: '17px', color: '#d9dbe8', marginTop: '10px', lineHeight: 1.65 }}>
              Less noise, clearer intentions, and smoother next steps from chat to coaching.
            </div>
          </div>
          <div className="trend-float" style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            Private messaging and video calls in one flow, so you do not need to jump between apps.
          </div>
          <div className="trend-float-delayed" style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            Coaching is available when you want help with your profile, confidence, or conversations.
          </div>
        </aside>
      </section>

      <section style={{ maxWidth: '1180px', margin: '10px auto', padding: '0 10px' }}>
        <div
          style={{
            borderRadius: '24px',
            border: '1px solid #ebeef5',
            background: 'linear-gradient(135deg, #1d2333 0%, #2b3248 52%, #40263c 100%)',
            color: '#fff',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffb8c4', marginBottom: '10px' }}>Real-time connection</div>
            <h3 style={{ margin: 0, fontSize: '28px', lineHeight: 1.1 }}>From first message to face-to-face.</h3>
            <p style={{ margin: '12px 0 0', color: '#d8dced', lineHeight: 1.65 }}>
              Start with messages, move to private video calls, and build trust with adults-only rules, face-photo checks, and moderation support.
            </p>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {trustHighlights.map((item) => (
              <div key={item.title} style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', padding: '14px' }}>
                <strong>{item.title}</strong>
                <div style={{ color: '#d8dced', fontSize: '14px', marginTop: '6px', lineHeight: 1.6 }}>{item.copy}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1180px', margin: '10px auto', padding: '0 10px' }}>
        <div
          style={{
            borderRadius: '24px',
            border: '1px solid #ebeef5',
            background: 'linear-gradient(140deg, #fff7f8 0%, #ffffff 55%, #fff0f4 100%)',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            alignItems: 'start'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e83f5b', marginBottom: '10px' }}>VIP support</div>
            <h3 style={{ margin: 0, fontSize: '28px', lineHeight: 1.1, color: '#1f2230' }}>Qualified dating coaches are available by request.</h3>
            <p style={{ margin: '12px 0 0', color: '#60657b', lineHeight: 1.7 }}>
              Members who want sharper profile advice, conversation guidance, or dating tips can request one-on-one help from our coaching team.
            </p>
            <ul className="landing-coaching-list">
              {coachingFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ borderRadius: '16px', border: '1px solid #f1d7dd', background: '#fff', padding: '14px' }}>
              <strong style={{ color: '#1f2230' }}>How it works</strong>
              <div style={{ color: '#60657b', fontSize: '14px', marginTop: '6px', lineHeight: 1.6 }}>
                Ask for dating tips, profile feedback, or VIP-style guidance whenever you need extra support.
              </div>
            </div>
            <div style={{ borderRadius: '16px', border: '1px solid #f1d7dd', background: '#fff', padding: '14px' }}>
              <strong style={{ color: '#1f2230' }}>Request coaching</strong>
              <div style={{ color: '#60657b', fontSize: '14px', marginTop: '6px', lineHeight: 1.6 }}>
                Email <a href="mailto:coaching@flameconnect.co.za?subject=Dating%20Coach%20Request" style={{ color: '#e83f5b', fontWeight: 700, textDecoration: 'none' }}>coaching@flameconnect.co.za</a> or open the coaching request page to send the team more detail.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.(VIEW_KEYS.COACHING)}
              style={{
                background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px 18px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontWeight: 800,
                boxShadow: '0 10px 20px rgba(232,63,91,0.2)'
              }}
            >
              Open coaching page
            </button>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1180px', margin: '8px auto 0', padding: '0 10px' }}>
        <div
          style={{
            borderRadius: '20px',
            border: '1px solid #ebeef5',
            background: 'linear-gradient(145deg, #ffffff 0%, #fff8fa 100%)',
            padding: '18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px'
          }}
        >
          {howItWorks.map((item) => (
            <div key={item.step} style={{ padding: '10px 4px' }}>
              <div style={{ color: '#e83f5b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>{item.step}</div>
              <div style={{ fontSize: '21px', fontWeight: 800, color: '#1f2230', marginTop: '8px' }}>{item.title}</div>
              <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#62687f', marginTop: '8px' }}>{item.copy}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 10px' }}>
        <SiteFooter onCoachingClick={() => onNavigate?.(VIEW_KEYS.COACHING)} onTermsClick={() => onNavigate?.(VIEW_KEYS.TERMS)} onPrivacyClick={() => onNavigate?.(VIEW_KEYS.PRIVACY)} />
      </section>
    </div>
  );
}
