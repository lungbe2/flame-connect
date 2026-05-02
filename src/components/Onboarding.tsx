import React from 'react';
import { MOOD_OPTIONS, formatMoodWithEmoji } from '../config/mood';

export default function Onboarding({
  displayName,
  setDisplayName,
  age,
  setAge,
  gender,
  setGender,
  lookingFor,
  setLookingFor,
  mood,
  setMood,
  location,
  setLocation,
  bio,
  setBio,
  photos,
  photoFaceStatus,
  uploading,
  onPhotoUpload,
  onUseCurrentLocation,
  onComplete,
  message
}) {
  const completionChecks = [
    !!displayName?.trim(),
    !!age && Number.parseInt(age, 10) >= 18,
    !!gender,
    !!lookingFor,
    !!mood,
    !!bio && bio.trim().length >= 20,
    !!location?.trim(),
    Array.isArray(photos) && photos.length > 0
  ];
  const completionScore = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);

  return (
    <div style={{ maxWidth: '560px', margin: '20px auto', padding: '12px' }}>
      <div style={{ background: '#fff', border: '1px solid #e8ebf3', borderRadius: '20px', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#1f2230', margin: '0 0 6px' }}>Set up your dating profile</h1>
          <p style={{ color: '#6a7188', margin: 0 }}>The better your profile, the better your matches.</p>
          <div style={{ marginTop: '10px', display: 'inline-block', padding: '6px 10px', borderRadius: '999px', background: '#f3f5fa', color: '#36405a', fontWeight: 700, fontSize: '12px' }}>
            Profile completion: {completionScore}%
          </div>
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}
          />
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}
          />
          <select value={gender} onChange={(event) => setGender(event.target.value)} style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
          </select>
          <select value={lookingFor} onChange={(event) => setLookingFor(event.target.value)} style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}>
            <option value="">Looking for</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="everyone">Everyone</option>
          </select>
          <select value={mood} onChange={(event) => setMood(event.target.value)} style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}>
            <option value="">Current mood / intent</option>
            {MOOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>
          <div style={{ marginTop: '-2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {MOOD_OPTIONS.map((option) => (
              <button
                key={`chip-${option.value}`}
                type="button"
                onClick={() => setMood(option.value)}
                style={{
                  border: mood === option.value ? 'none' : '1px solid #e3e7f1',
                  background: mood === option.value ? 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)' : '#fff',
                  color: mood === option.value ? '#fff' : '#46506b',
                  borderRadius: '999px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>
          {mood && (
            <div style={{ fontSize: '12px', color: '#687089', marginTop: '-2px' }}>
              Selected mood: <strong>{formatMoodWithEmoji(mood)}</strong>
            </div>
          )}
          <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '1fr auto' }}>
            <input
              type="text"
              placeholder="Location (City)"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              style={{ width: '100%', padding: '13px 14px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd' }}
            />
            <button
              type="button"
              onClick={onUseCurrentLocation}
              style={{ padding: '0 14px', borderRadius: '12px', border: '1px solid #e3e7f1', background: '#f3f5fa', cursor: 'pointer', color: '#2e3346' }}
            >
              Use GPS
            </button>
          </div>
          <textarea
            placeholder="Bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            style={{ width: '100%', padding: '13px 14px', margin: '0', minHeight: '110px', border: '1px solid #dfe4ef', borderRadius: '12px', background: '#f8f9fd', resize: 'vertical' }}
          />
          <div style={{ fontSize: '12px', color: '#7c8399', marginTop: '-4px' }}>Tip: write at least 20 characters so your profile ranks better.</div>
        </div>

        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          {photos.length > 0 && <img src={photos[0]} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ffe4e9' }} />}
          <div style={{ marginTop: '10px' }}>
            <input type="file" accept="image/*" onChange={onPhotoUpload} style={{ display: 'none' }} id="photo-upload" />
            <label htmlFor="photo-upload" style={{ display: 'inline-block', padding: '10px 18px', background: '#f3f5fa', border: '1px solid #e3e7f1', color: '#2e3346', borderRadius: '999px', cursor: 'pointer' }}>
              {uploading ? 'Uploading...' : 'Upload photo'}
            </label>
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#7c8399', lineHeight: 1.5 }}>
            Use a clear face photo. Profiles without a real personal photo will not complete setup.
          </div>
          {photoFaceStatus === 'flagged' && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#d93e5b', lineHeight: 1.5 }}>
              We could not detect a real face in that image. Please upload a clear personal face photo.
            </div>
          )}
          {photoFaceStatus === 'approved' && photos.length > 0 && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#2e8457', lineHeight: 1.5 }}>
              Face check passed. Your profile photo is ready.
            </div>
          )}
        </div>

        <button
          onClick={onComplete}
          style={{
            width: '100%',
            padding: '13px',
            background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Complete profile
        </button>
        {message && <p style={{ color: '#d93e5b', marginTop: '10px', textAlign: 'center' }}>{message}</p>}
      </div>
    </div>
  );
}
