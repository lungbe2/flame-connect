import React from 'react';

export default function PrivacyPage({ onBack }) {
  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '5px' }}>← Back</button>
      <h1 style={{ color: '#ff6b6b' }}>Privacy Policy</h1>
      <h3>Information We Collect</h3>
      <p>We collect information you provide: name, email, age, location, photos, and preferences.</p>
      <h3>How We Use Your Information</h3>
      <p>• To match you with compatible users<br/>• To improve our matching algorithms<br/>• To communicate with you about your account<br/>• To ensure safety and prevent fraud</p>
      <h3>Data Security</h3>
      <p>We use industry-standard encryption to protect your data. Your password is never stored in plain text.</p>
      <h3>Your Rights</h3>
      <p>You can access, correct, or delete your personal data at any time through your account settings.</p>
      <p><strong>Last updated:</strong> April 2024</p>
    </div>
  );
}
