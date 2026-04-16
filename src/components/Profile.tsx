import React from 'react';

export default function Profile({ profile, user, photos, onEditProfile, onLogout, onPhotoChange }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {photos && photos.length > 0 ? (
        <img src={photos[0]} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px', border: '3px solid #ff6b6b' }} />
      ) : (
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#f0f0f0', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📷</div>
      )}
      <input type="file" accept="image/*" onChange={onPhotoChange} style={{ display: 'none' }} id="profile-photo" />
      <label htmlFor="profile-photo" style={{ display: 'inline-block', color: '#ff6b6b', cursor: 'pointer', marginBottom: '15px' }}>Change Photo</label>
      
      <h2>{profile?.display_name || user?.email?.split('@')[0]}</h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#4CAF50' }}></span>
        <span>Online</span>
        <span>•</span>
        <span>📍 {profile?.location_city || 'Cape Town'}</span>
      </div>
      <p>{profile?.bio}</p>
      
      <button onClick={onEditProfile} style={{ width: '100%', padding: '14px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '20px' }}>Edit Profile</button>
      <button onClick={onLogout} style={{ width: '100%', padding: '14px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '10px' }}>Logout</button>
    </div>
  );
}
