import React from 'react';

export default function Onboarding({ 
  displayName, setDisplayName,
  age, setAge,
  gender, setGender,
  lookingFor, setLookingFor,
  location, setLocation,
  bio, setBio,
  photos, uploading,
  onPhotoUpload, onComplete,
  message
}) {
  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#ff6b6b' }}>Complete Your Profile</h1>
        <p>Tell others about yourself</p>
      </div>
      
      <input type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
      <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
      <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
        <option value="">Looking for</option>
        <option value="men">Men</option>
        <option value="women">Women</option>
        <option value="everyone">Everyone</option>
      </select>
      <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
      <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', minHeight: '100px', border: '1px solid #ddd', borderRadius: '8px' }} />
      
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        {photos.length > 0 && <img src={photos[0]} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />}
        <input type="file" accept="image/*" onChange={onPhotoUpload} style={{ display: 'none' }} id="photo-upload" />
        <label htmlFor="photo-upload" style={{ display: 'inline-block', padding: '10px 20px', background: '#4CAF50', color: 'white', borderRadius: '25px', cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload Photo'}</label>
      </div>
      
      <button onClick={onComplete} style={{ width: '100%', padding: '14px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Complete Profile</button>
      {message && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{message}</p>}
    </div>
  );
}
