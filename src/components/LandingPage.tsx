import React from 'react';
import { VIEW_KEYS } from '../config/navigation';
import SiteFooter from './SiteFooter';

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
            Trendy dating. Better matches.
          </div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 60px)', lineHeight: 0.98, letterSpacing: '-0.04em', margin: '0 0 14px', color: '#1e1f2c' }}>
            Find chemistry that feels effortless.
          </h1>
          <p style={{ fontSize: '18px', color: '#60657b', lineHeight: 1.7, marginBottom: '24px', maxWidth: '580px' }}>
            Discover nearby singles by intent, live status, and vibe. From fun chats to serious relationships, Flame Connect helps you move faster with messaging, private video calls, and guided support when you want it.
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
              Start now
            </button>
            <button onClick={onLoginClick} style={{ background: '#fff', color: '#202235', border: '1px solid #e8ebf3', padding: '14px 24px', borderRadius: '999px', cursor: 'pointer', fontWeight: 700 }}>
              I have an account
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
            <div style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffb6c0', marginBottom: '10px' }}>Live Activity</div>
            <div style={{ fontSize: '46px', fontWeight: 800, lineHeight: 1 }}>9,000+</div>
            <div style={{ fontSize: '18px', color: '#d9dbe8', marginTop: '8px' }}>new conversations started this week</div>
          </div>
          <div className="trend-float" style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            "Found someone genuine in my city within 3 days."
          </div>
          <div className="trend-float-delayed" style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            "The mood filters helped me match exactly what I wanted."
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
            <h3 style={{ margin: 0, fontSize: '28px', lineHeight: 1.1 }}>Chat, call, and connect in real time.</h3>
            <p style={{ margin: '12px 0 0', color: '#d8dced', lineHeight: 1.65 }}>
              Start with messages, move to private video calls, and build trust with profile photo checks and adults-only safety rules.
            </p>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', padding: '14px' }}>
              <strong>Private messaging</strong>
              <div style={{ color: '#d8dced', fontSize: '14px', marginTop: '6px', lineHeight: 1.6 }}>Warm up the conversation before you meet.</div>
            </div>
            <div style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', padding: '14px' }}>
              <strong>Video calls</strong>
              <div style={{ color: '#d8dced', fontSize: '14px', marginTop: '6px', lineHeight: 1.6 }}>Go face to face when the vibe feels right.</div>
            </div>
            <div style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.08)', padding: '14px' }}>
              <strong>Safer profiles</strong>
              <div style={{ color: '#d8dced', fontSize: '14px', marginTop: '6px', lineHeight: 1.6 }}>Face-photo checks help keep discovery more genuine.</div>
            </div>
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
            background: '#fff',
            padding: '18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px'
          }}
        >
          <div>
            <div style={{ color: '#a4a9bb', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Members</div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: '#1f2230' }}>2.1M+</div>
          </div>
          <div>
            <div style={{ color: '#a4a9bb', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daily Likes</div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: '#1f2230' }}>410k</div>
          </div>
          <div>
            <div style={{ color: '#a4a9bb', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Verified Profiles</div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: '#1f2230' }}>89%</div>
          </div>
          <div>
            <div style={{ color: '#a4a9bb', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg. Reply Time</div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: '#1f2230' }}>6m</div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 10px' }}>
        <SiteFooter onCoachingClick={() => onNavigate?.(VIEW_KEYS.COACHING)} onTermsClick={() => onNavigate?.(VIEW_KEYS.TERMS)} onPrivacyClick={() => onNavigate?.(VIEW_KEYS.PRIVACY)} />
      </section>
    </div>
  );
}
