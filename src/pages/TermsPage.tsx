import React from 'react';

export default function TermsPage({ onBack }) {
  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
        <h1 style={{ margin: 0, color: '#ff6b6b' }}>Terms of Service</h1>
      </div>
      
      <div style={{ lineHeight: '1.8', color: '#333' }}>
        <h2>1. Acceptance of Terms</h2>
        <p>By using Flame Connect, you agree to these terms. If you don't agree, please don't use our service.</p>
        
        <h2>2. Eligibility</h2>
        <p>You must be at least 18 years old to use Flame Connect. By using our service, you confirm that you meet this requirement.</p>
        
        <h2>3. User Conduct</h2>
        <p>You agree to treat others with respect. Harassment, hate speech, and inappropriate behavior will result in immediate account termination.</p>
        
        <h2>4. Privacy</h2>
        <p>Your privacy matters. See our Privacy Policy for details on how we handle your data.</p>
        
        <h2>5. Account Termination</h2>
        <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
        
        <h2>6. Changes to Terms</h2>
        <p>We may update these terms from time to time. Continued use means acceptance of changes.</p>
        
        <p style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}><strong>Last updated:</strong> April 2024</p>
      </div>
    </div>
  );
}
