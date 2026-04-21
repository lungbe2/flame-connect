import React from 'react';

export default function MatchPage({ match, onSendMessage, onKeepSwiping }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ textAlign: 'center', background: 'white', borderRadius: '30px', padding: '40px', maxWidth: '400px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ color: '#ff6b6b', marginBottom: '10px' }}>It's a Match!</h1>
        <p>You and {match.display_name} have liked each other.</p>
        <button onClick={onSendMessage} style={{ width: '100%', padding: '14px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginBottom: '10px' }}>💬 Send Message</button>
        <button onClick={onKeepSwiping} style={{ width: '100%', padding: '14px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Keep Swiping</button>
      </div>
    </div>
  );
}
