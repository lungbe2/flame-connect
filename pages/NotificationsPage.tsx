import React from 'react';

export default function NotificationsPage({ onBack }) {
  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '5px' }}>← Back</button>
      <h1 style={{ color: '#ff6b6b' }}>Notifications</h1>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔔</div>
        <h2>No notifications yet</h2>
        <p>When someone likes you or matches with you, you'll see it here!</p>
      </div>
    </div>
  );
}
