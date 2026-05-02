import React from 'react';

export default function PrivacyPage({ onBack }) {
  return (
    <div style={{ maxWidth: '860px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px' }}>
          ←
        </button>
        <h1 style={{ margin: 0, color: '#e83f5b' }}>Privacy Policy</h1>
      </div>

      <div
        style={{
          lineHeight: '1.8',
          color: '#333b52',
          background: '#fff',
          border: '1px solid #e8ebf3',
          borderRadius: '24px',
          padding: '28px'
        }}
      >
        <p style={{ marginTop: 0 }}>
          Flame Connect respects your privacy. We only collect and use personal information that helps us operate your account, match you with other adult members, support safety reviews, and respond when you contact us.
        </p>

        <h2>Information we collect</h2>
        <p>We may collect the information you provide directly to us, including your name, email address, date of birth, profile details, photos, location details, preferences, and support messages.</p>

        <h2>How we use your information</h2>
        <p>
          • To create and maintain your account
          <br />
          • To recommend matches and improve discovery
          <br />
          • To detect abuse, investigate reports, and protect the community
          <br />
          • To contact you about your account, support requests, and important service updates
        </p>

        <h2>Safety and moderation</h2>
        <p>We may review reports, profile details, and account activity when needed to investigate misuse, enforce our rules, or protect other users from fraud, harassment, or impersonation.</p>

        <h2>Age restriction</h2>
        <p>Flame Connect is for adults only. You must be at least 18 years old to register or use the service. We may suspend or remove any account that provides false age information or appears to belong to a minor.</p>

        <h2>Data security</h2>
        <p>We use industry-standard infrastructure and access controls to protect your data. Passwords are handled through secure authentication systems and are not stored in plain text.</p>

        <h2>Your choices</h2>
        <p>You can update your profile information, request support, or close your account. Where required, we may keep limited records to meet legal, security, or dispute-handling obligations.</p>

        <h2>Contact us</h2>
        <p style={{ marginBottom: '8px' }}>For privacy questions, support, or disputes, contact:</p>
        <p style={{ marginTop: 0 }}>
          <a href="mailto:info@flameconnect.co.za" style={{ color: '#d93e5b' }}>
            info@flameconnect.co.za
          </a>
          <br />
          <a href="mailto:support@flameconnect.co.za" style={{ color: '#d93e5b' }}>
            support@flameconnect.co.za
          </a>
          <br />
          <a href="mailto:dispute@flameconnect.co.za" style={{ color: '#d93e5b' }}>
            dispute@flameconnect.co.za
          </a>
        </p>

        <p style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <strong>Last updated:</strong> April 2026
        </p>
      </div>
    </div>
  );
}
