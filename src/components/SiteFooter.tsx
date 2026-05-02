import React from 'react';

type SiteFooterProps = {
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  onCoachingClick?: () => void;
};

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: '#ff7a7a',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '13px'
};

const emailLinkStyle: React.CSSProperties = {
  color: '#d7dceb',
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '13px'
};

export default function SiteFooter({ onTermsClick, onPrivacyClick, onCoachingClick }: SiteFooterProps) {
  return (
    <footer
      style={{
        marginTop: '24px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '22px 18px 24px',
        display: 'grid',
        gap: '14px',
        color: '#b8bfd2',
        background: 'linear-gradient(180deg, #11131b 0%, #0b0d12 100%)',
        boxShadow: '0 18px 40px rgba(8,10,15,0.22)'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'start'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.06)',
                display: 'grid',
                placeItems: 'center',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <img src="/favicon.svg" alt="Flame Connect logo" style={{ width: '24px', height: '24px', display: 'block' }} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>Flame Connect</div>
          </div>
          <p style={{ margin: 0, lineHeight: 1.55, fontSize: '13px' }}>
            Adults-only dating with safer matching, abuse protection, and privacy controls built into the experience.
          </p>
        </div>

        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Contact</div>
          <div style={{ display: 'grid', gap: '6px' }}>
            <a href="mailto:info@flameconnect.co.za" style={emailLinkStyle}>
              info@flameconnect.co.za
            </a>
            <a href="mailto:support@flameconnect.co.za" style={emailLinkStyle}>
              support@flameconnect.co.za
            </a>
            <a href="mailto:dispute@flameconnect.co.za" style={emailLinkStyle}>
              dispute@flameconnect.co.za
            </a>
          </div>
          <p style={{ margin: '10px 0 0', lineHeight: 1.55, fontSize: '12px' }}>
            VIP coaching or dating tips by request: <a href="mailto:coaching@flameconnect.co.za?subject=Dating%20Coach%20Request" style={{ ...emailLinkStyle, color: '#ff9aa7' }}>coaching@flameconnect.co.za</a>
          </p>
        </div>

        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Privacy</div>
          <p style={{ margin: '0 0 10px', lineHeight: 1.55, fontSize: '13px' }}>
            We only use personal information to operate your account, improve matching, respond to support requests, and enforce safety on the platform. People under 18 are not allowed to register or use Flame Connect.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {onCoachingClick && (
              <button type="button" onClick={onCoachingClick} style={linkButtonStyle}>
                VIP Coaching
              </button>
            )}
            {onPrivacyClick && (
              <button type="button" onClick={onPrivacyClick} style={linkButtonStyle}>
                Privacy Policy
              </button>
            )}
            {onTermsClick && (
              <button type="button" onClick={onTermsClick} style={linkButtonStyle}>
                Terms of Service
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
          fontSize: '12px',
          color: '#8f97ab',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '12px'
        }}
      >
        <span>&copy; 2026 Flame Connect. Adults 18+ only.</span>
        <span>Use of this service means you agree to our privacy, safety, and moderation rules.</span>
      </div>
    </footer>
  );
}
