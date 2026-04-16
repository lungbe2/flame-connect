import React from 'react';

export default function PrivacyPage({ onBack }) {
  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
        <h1 style={{ margin: 0, color: '#ff6b6b' }}>Privacy Policy</h1>
      </div>
      
      <div style={{ lineHeight: '1.8', color: '#333' }}>
        <h2>Information We Collect</h2>
        <p>We collect information you provide: name, email, age, location, photos, and preferences. We also collect usage data to improve our service.</p>
        
        <h2>How We Use Your Information</h2>
        <p>• To match you with compatible users<br/>
        • To improve our matching algorithms<br/>
        • To communicate with you about your account<br/>
        • To ensure safety and prevent fraud</p>
        
        <h2>Data Security</h2>
        <p>We use industry-standard encryption to protect your data. Your password is never stored in plain text.</p>
        
        <h2>Your Rights</h2>
        <p>You can access, correct, or delete your personal data at any time through your account settings.</p>
        
        <h2>Cookies</h2>
        <p>We use cookies to keep you logged in and analyze site usage. You can disable cookies in your browser.</p>
        
        <h2>Contact Us</h2>
        <p>Questions about privacy? Contact us at privacy@flameconnect.com</p>
        
        <p style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}><strong>Last updated:</strong> April 2024</p>
      </div>
    </div>
  );
}
