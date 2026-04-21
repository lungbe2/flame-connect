import React from 'react';

export default function TermsPage({ onBack }) {
  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '5px' }}>← Back</button>
      <h1 style={{ color: '#ff6b6b' }}>Terms of Service</h1>
      <h3>1. Acceptance of Terms</h3>
      <p>By using Flame Connect, you agree to these terms. If you don't agree, please don't use our service.</p>
      <h3>2. Eligibility</h3>
      <p>You must be at least 18 years old to use Flame Connect.</p>
      <h3>3. User Conduct</h3>
      <p>You agree to treat others with respect. Harassment, hate speech, and inappropriate behavior will result in immediate account termination.</p>
      <h3>4. Privacy</h3>
      <p>Your privacy matters. See our Privacy Policy for details on how we handle your data.</p>
      <h3>5. Account Termination</h3>
      <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
      <p><strong>Last updated:</strong> April 2024</p>
    </div>
  );
}
