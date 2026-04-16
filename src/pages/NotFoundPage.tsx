import React from 'react';

export default function NotFoundPage({ onNavigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ fontSize: '80px', marginBottom: '20px' }}>🔍</div>
      <h1 style={{ fontSize: '48px', color: '#ff6b6b', marginBottom: '10px' }}>404</h1>
      <h2 style={{ marginBottom: '20px' }}>Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>Oops! The page you're looking for doesn't exist or has been moved.</p>
      <button onClick={() => onNavigate('landing')} style={{ padding: '12px 30px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Go Home →</button>
    </div>
  );
}
