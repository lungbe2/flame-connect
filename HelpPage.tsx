import React from 'react';

export default function HelpPage({ onBack }) {
  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '5px' }}>← Back</button>
      <h1 style={{ color: '#ff6b6b' }}>Help Center</h1>
      <div style={{ background: '#fef9f9', padding: '30px', borderRadius: '20px', textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '48px' }}>💬</div>
        <h2>Need help?</h2>
        <p>Contact our support team for assistance</p>
        <button style={{ padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Contact Support</button>
      </div>
      <h2>Frequently Asked Questions</h2>
      <div style={{ padding: '15px', margin: '10px 0', background: '#f9f9f9', borderRadius: '10px' }}>
        <strong>How does matching work?</strong>
        <p>When two users both like each other's profiles, it's a match! You'll be notified and can start chatting immediately.</p>
      </div>
      <div style={{ padding: '15px', margin: '10px 0', background: '#f9f9f9', borderRadius: '10px' }}>
        <strong>Is my data secure?</strong>
        <p>Yes! We use industry-standard encryption and never share your personal information.</p>
      </div>
      <div style={{ padding: '15px', margin: '10px 0', background: '#f9f9f9', borderRadius: '10px' }}>
        <strong>How do I report someone?</strong>
        <p>Click the three dots on any profile and select 'Report'. Our team reviews within 24 hours.</p>
      </div>
    </div>
  );
}
