import React from 'react';

type SiteFooterProps = {
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
};

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: '#d93e5b',
  cursor: 'pointer',
  fontWeight: 700
};

const emailLinkStyle: React.CSSProperties = {
  color: '#4f5874',
  textDecoration: 'none',
  fontWeight: 600
};

export default function SiteFooter({ onTermsClick, onPrivacyClick }: SiteFooterProps) {
  return (
    <footer
      style={{
        marginTop: '24px',
        borderTop: '1px solid #e8ebf3',
        padding: '24px 4px 28px',
        display: 'grid',
        gap: '14px',
        color: '#667089'
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
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#20263c', marginBottom: '6px' }}>Flame Connect</div>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Flame Connect is an adults-only dating platform. We use moderation tools, abuse protections, and privacy controls to keep conversations safer and more respectful.
          </p>
        </div>

        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#20263c', marginBottom: '8px' }}>Contact</div>
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
        </div>

        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#20263c', marginBottom: '8px' }}>Privacy Statement</div>
          <p style={{ margin: '0 0 10px', lineHeight: 1.6 }}>
            We only use personal information to operate your account, improve matching, respond to support requests, and enforce safety on the platform. People under 18 are not allowed to register or use Flame Connect.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
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
          fontSize: '13px',
          color: '#7b839b'
        }}
      >
        <span>© 2026 Flame Connect. Adults 18+ only.</span>
        <span>Use of this service means you agree to our privacy, safety, and moderation rules.</span>
      </div>
    </footer>
  );
}
