import React from 'react';

export default function UpgradePage({ onBack }) {
  const plans = [
    { name: 'Free', price: '$0', features: ['Basic matching', 'Limited swipes', 'Standard support'] },
    { name: 'Premium', price: '$9.99', features: ['Unlimited swipes', 'See who liked you', 'Advanced filters', 'Priority support'] },
    { name: 'VIP', price: '$19.99', features: ['Everything in Premium', 'Profile boosts', 'Verified badge', 'Exclusive events'] }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '5px' }}>← Back</button>
      <h1 style={{ color: '#ff6b6b', textAlign: 'center' }}>Upgrade Your Experience</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px' }}>Get more matches and find love faster with our premium plans</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
        {plans.map(plan => (
          <div key={plan.name} style={{ width: '280px', padding: '30px', background: 'white', borderRadius: '20px', textAlign: 'center', border: '1px solid #eee' }}>
            <h2>{plan.name}</h2>
            <div style={{ fontSize: '36px', color: '#ff6b6b', marginBottom: '20px' }}>{plan.price}<span style={{ fontSize: '14px' }}>/month</span></div>
            <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
              {plan.features.map(f => <li key={f} style={{ marginBottom: '10px' }}>✓ {f}</li>)}
            </ul>
            <button style={{ width: '100%', padding: '12px', background: plan.name === 'Free' ? '#f0f0f0' : '#ff6b6b', color: plan.name === 'Free' ? '#333' : 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>
              {plan.name === 'Free' ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
