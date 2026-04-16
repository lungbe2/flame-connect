import React, { useState } from 'react';

const faqs = [
  { q: "How does matching work?", a: "When two users both like each other's profiles, it's a match! You'll be notified and can start chatting immediately." },
  { q: "Is my data secure?", a: "Yes! We use industry-standard encryption and never share your personal information with third parties." },
  { q: "How do I report someone?", a: "Click the three dots on any profile and select 'Report'. Our team reviews all reports within 24 hours." },
  { q: "Can I block users?", a: "Yes, go to the user's profile and click 'Block'. They won't be able to see you or message you." },
  { q: "How do I delete my account?", a: "Go to Settings > Delete Account. This action is permanent and cannot be undone." },
  { q: "What are profile boosts?", a: "Boosts increase your profile visibility for 1 hour, showing you to more potential matches." }
];

export default function HelpPage({ onBack }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
        <h1 style={{ margin: 0, color: '#ff6b6b' }}>Help Center</h1>
      </div>
      
      <div style={{ background: '#fef9f9', padding: '30px', borderRadius: '20px', marginBottom: '30px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
        <h2>Need help with something?</h2>
        <p>Browse our FAQs or contact our support team</p>
        <button style={{ padding: '12px 30px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Contact Support</button>
      </div>
      
      <h2>Frequently Asked Questions</h2>
      {faqs.map((faq, idx) => (
        <div key={idx} style={{ marginBottom: '15px', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            style={{ width: '100%', padding: '15px', textAlign: 'left', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <strong>{faq.q}</strong>
            <span>{openIndex === idx ? '▲' : '▼'}</span>
          </button>
          {openIndex === idx && (
            <div style={{ padding: '15px', background: '#f9f9f9', borderTop: '1px solid #eee' }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
