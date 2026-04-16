import React from 'react';

export default function PeopleGrid({ users, onLike, onSelectProfile }) {
  if (users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>💕</div>
        <h2>No users found yet</h2>
        <p>Complete your profile and check back soon!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
      {users.map(user => (
        <div key={user.id} onClick={() => onSelectProfile(user)} style={{ cursor: 'pointer', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          {user.photos && user.photos.length > 0 ? (
            <img src={user.photos[0]} alt={user.display_name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '250px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📷</div>
          )}
          <div style={{ padding: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0 }}>{user.display_name || user.email?.split('@')[0]}, {user.age || '?'}</h3>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: user.is_online ? '#4CAF50' : '#999' }}></span>
            </div>
            <p style={{ color: '#666', fontSize: '14px' }}>📍 {user.location_city || 'Unknown'}</p>
            <p style={{ fontSize: '13px', color: '#666' }}>{user.bio?.substring(0, 80)}...</p>
            <button onClick={(e) => { e.stopPropagation(); onLike(user.id); }} style={{ width: '100%', padding: '10px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '10px' }}>❤️ Like</button>
          </div>
        </div>
      ))}
    </div>
  );
}
