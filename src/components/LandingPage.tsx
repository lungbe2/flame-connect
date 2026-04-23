import React from 'react';

export default function LandingPage({ onLoginClick, onSignupClick }) {
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
            Discover nearby singles by intent, live status, and vibe. From fun chats to serious relationships, Flame Connect helps you move faster.
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

      <footer style={{ maxWidth: '1180px', margin: '24px auto 18px', padding: '20px 12px', color: '#70758a', fontSize: '14px', display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <span>2026 Flame Connect</span>
        <span>Safe matching tools, profile verification, and privacy controls</span>
      </footer>
    </div>
  );
}
