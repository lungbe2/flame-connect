import React from 'react';
import SiteFooter from '../components/SiteFooter';

export default function TermsPage({ onBack }) {
  return (
    <div style={{ maxWidth: '860px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px' }}>
          ←
        </button>
        <h1 style={{ margin: 0, color: '#e83f5b' }}>Terms of Service</h1>
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
        <h2>1. Acceptance of terms</h2>
        <p>By creating an account or using Flame Connect, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 18 years old to register or use Flame Connect. You agree to provide truthful account information, including your age and identity details. Accounts created by minors or with false age information may be suspended or removed immediately.</p>

        <h2>3. User conduct</h2>
        <p>You agree to treat other members with respect. Harassment, impersonation, fraud, hate speech, non-consensual sexual content, threats, or other abusive behavior may result in content removal, account restriction, or permanent termination.</p>

        <h2>4. Safety and moderation</h2>
        <p>We may investigate reports, moderate content, and take action on accounts that appear unsafe, deceptive, or harmful to the community. We may preserve relevant records when needed for trust and safety reviews or dispute handling.</p>

        <h2>5. Accounts and access</h2>
        <p>You are responsible for maintaining the security of your login credentials and for activity that occurs on your account. We may refuse service, limit access, or terminate accounts that violate these terms or create risk for other users.</p>

        <h2>6. Privacy</h2>
        <p>Your privacy matters to us. Please review our Privacy Policy for details on how Flame Connect collects, uses, and protects your information.</p>

        <h2>7. Changes to the service</h2>
        <p>We may update or improve the service, features, safety tools, and policies from time to time. Continued use of Flame Connect after an update means you accept the revised terms.</p>

        <h2>8. Contact</h2>
        <p style={{ marginBottom: '8px' }}>If you need support, have a general question, or want to raise a dispute, contact:</p>
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

      <SiteFooter />
    </div>
  );
}
