import React from 'react';
import { formatMoodWithEmoji } from '../config/mood';

export default function Profile({ profile, user, photos, onEditProfile, onLogout, onPhotoChange }) {
  const profileName = profile?.display_name || user?.email?.split('@')[0];
  const age = profile?.age || '--';
  const gender = profile?.gender || 'Not set';
  const lookingFor = profile?.looking_for || 'Not set';

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ebf3', borderRadius: '18px', padding: '24px', textAlign: 'center' }}>
      {photos && photos.length > 0 ? (
        <img src={photos[0]} alt="Profile" style={{ width: '124px', height: '124px', borderRadius: '50%', objectFit: 'cover', marginBottom: '14px', border: '4px solid #ffe4e9' }} />
      ) : (
        <div style={{ width: '124px', height: '124px', borderRadius: '50%', background: '#f2f4f9', margin: '0 auto 14px', display: 'grid', placeItems: 'center', color: '#959bad' }}>
          No photo
        </div>
      )}

      <input type="file" accept="image/*" onChange={onPhotoChange} style={{ display: 'none' }} id="profile-photo" />
      <label htmlFor="profile-photo" style={{ display: 'inline-block', color: '#e83f5b', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}>
        Change photo
      </label>

      <h2 style={{ margin: '0 0 8px' }}>{profileName}</h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#656d84' }}>
        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: profile?.is_online ? '#3db46d' : '#afb5c5' }} />
        <span>{profile?.is_online ? 'Online' : 'Offline'}</span>
        <span>|</span>
        <span>{profile?.location_city || profile?.location || 'Location not set'}</span>
      </div>
      <p style={{ marginTop: '12px', color: '#5f677c', lineHeight: 1.6 }}>{profile?.bio || 'Add a short bio so people get to know you.'}</p>

      <div style={{ marginTop: '14px', textAlign: 'left', border: '1px solid #eceff6', borderRadius: '14px', padding: '12px', background: '#fafbff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#4e546c' }}>
          <span>Age</span>
          <strong>{age}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#4e546c' }}>
          <span>Gender</span>
          <strong>{gender}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#4e546c' }}>
          <span>Looking for</span>
          <strong>{lookingFor}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#4e546c' }}>
          <span>Mood</span>
          <strong>{formatMoodWithEmoji(profile?.mood)}</strong>
        </div>
      </div>

      <button
        onClick={onEditProfile}
        style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', marginTop: '16px', fontWeight: 700 }}
      >
        Edit profile
      </button>
      <button onClick={onLogout} style={{ width: '100%', padding: '13px', background: '#f3f5fa', color: '#373b4c', border: '1px solid #e7eaf2', borderRadius: '999px', cursor: 'pointer', marginTop: '10px' }}>
        Log out
      </button>
    </div>
  );
}
