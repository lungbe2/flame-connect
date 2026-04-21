import React from 'react';

export default function Inbox({ matches, onBrowsePeople, onSelectMatch }) {
  if (matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>💌</div>
        <h2>No conversations yet</h2>
        <p>Explore profiles and send a message to start chatting!</p>
        <button onClick={onBrowsePeople} style={{ padding: '12px 24px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '20px' }}>Browse People</button>
      </div>
    );
  }

  return (
    <div>
      {matches.map(match => (
        <div 
          key={match.id} 
          onClick={() => onSelectMatch(match)}
          style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', marginBottom: '10px', cursor: 'pointer' }}
        >
          <strong>{match.display_name || match.email?.split('@')[0]}</strong>
          <p>{match.age} years • {match.location_city || 'Anywhere'}</p>
        </div>
      ))}
    </div>
  );
}
