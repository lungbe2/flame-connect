import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ProfilePage({ user, profile, setProfile, onNavigate, onLogout }) {
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState(profile?.photos || [])
  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [age, setAge] = useState(profile?.age || '')
  const [gender, setGender] = useState(profile?.gender || '')
  const [lookingFor, setLookingFor] = useState(profile?.looking_for || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [location, setLocation] = useState(profile?.location_city || '')

  const uploadPhoto = async (file) => {
    if (!user) return null
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file)
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath)
      
      const updatedPhotos = [publicUrl]
      setPhotos(updatedPhotos)
      await supabase.from('profiles').update({ photos: updatedPhotos }).eq('id', user.id)
      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) return
    await uploadPhoto(file)
  }

  const saveProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        age: parseInt(age),
        gender,
        looking_for: lookingFor,
        bio,
        location_city: location,
        photos
      })
      .eq('id', user.id)
    
    if (!error) {
      setProfile({
        ...profile,
        display_name: displayName,
        age,
        gender,
        looking_for: lookingFor,
        bio,
        location_city: location,
        photos
      })
      setEditMode(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentView="profile" onNavigate={onNavigate} user={user} profile={profile} />
      
      <div style={{ flex: 1, maxWidth: '600px', margin: '0 auto', padding: '30px 20px', width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          {photos.length > 0 ? (
            <img src={photos[0]} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#f0f0f0', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📷</div>
          )}
          <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} id="profile-photo" />
          <label htmlFor="profile-photo" style={{ display: 'inline-block', color: '#ff6b6b', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }}>Change Photo</label>
          
          {editMode ? (
            <>
              <input type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
              <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
                <option value="">Looking for</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="everyone">Everyone</option>
              </select>
              <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
              <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '12px', margin: '10px 0', minHeight: '100px', border: '1px solid #ddd', borderRadius: '8px' }} />
              <button onClick={saveProfile} style={{ width: '100%', padding: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', marginTop: '10px' }}>Save Changes</button>
              <button onClick={() => setEditMode(false)} style={{ width: '100%', padding: '12px', background: '#ccc', color: 'black', border: 'none', borderRadius: '8px', marginTop: '10px' }}>Cancel</button>
            </>
          ) : (
            <>
              <h2>{profile?.display_name || user?.email?.split('@')[0]}</h2>
              <p>🟢 Online</p>
              <p>📍 {profile?.location_city || 'Not set'}</p>
              <p>{profile?.bio}</p>
              <button onClick={() => setEditMode(true)} style={{ width: '100%', padding: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', marginTop: '20px' }}>Edit Profile</button>
              <button onClick={onLogout} style={{ width: '100%', padding: '12px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px', marginTop: '10px' }}>Logout</button>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
