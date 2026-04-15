import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState('people')
  const [users, setUsers] = useState([])
  const [matches, setMatches] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [authMessage, setAuthMessage] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession()
    const currentUser = data?.session?.user || null
    setUser(currentUser)
    
    if (currentUser) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
      
      if (profileData && profileData.age) {
        setProfile(profileData)
        setPhotos(profileData.photos || [])
        setDisplayName(profileData.display_name || '')
        setAge(profileData.age || '')
        setGender(profileData.gender || '')
        setBio(profileData.bio || '')
        setLocation(profileData.location_city || '')
        setStep(5)
        await fetchUsers()
        await fetchMatches(currentUser.id)
      } else {
        setStep(0)
      }
    }
    setLoading(false)
  }

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user?.id)
      .limit(50)
    if (data) setUsers(data)
  }

  const fetchMatches = async (userId) => {
    const { data } = await supabase
      .from('matches')
      .select('*, profiles!matches_user_a_fkey(*), profiles!matches_user_b_fkey(*)')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .eq('status', 'accepted')
    
    if (data) {
      const matchProfiles = data.map(match => {
        return match.user_a === userId ? match.profiles_user_b_fkey : match.profiles_user_a_fkey
      })
      setMatches(matchProfiles)
    }
  }

  const handleLike = async (likedUserId) => {
    await supabase.from('likes').insert({ liker_id: user.id, liked_id: likedUserId })
    const { data } = await supabase
      .from('likes')
      .select('*')
      .eq('liker_id', likedUserId)
      .eq('liked_id', user.id)
    
    if (data && data.length > 0) {
      await supabase.from('matches').insert({ user_a: user.id, user_b: likedUserId, status: 'accepted' })
      alert('🎉 It\'s a match! 🎉')
      await fetchMatches(user.id)
    }
  }

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
      setMessage('Photo uploaded!')
      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      setMessage('Failed to upload photo.')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be less than 5MB.')
      return
    }
    await uploadPhoto(file)
  }

  const completeOnboarding = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName || email.split('@')[0],
        age: parseInt(age),
        gender,
        bio,
        location_city: location,
        photos
      })
      .eq('id', user.id)
    
    if (error) {
      setMessage(error.message)
    } else {
      setStep(5)
      await checkUser()
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthMessage('')
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthMessage(error.message)
      else {
        setAuthMessage('Logged in!')
        setTimeout(() => checkUser(), 500)
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthMessage(error.message)
      else setAuthMessage('Check your email to verify!')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setView('people')
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
  }

  // Login Page
  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center' }}>🔥 Flame Connect</h1>
        <form onSubmit={handleAuth}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0' }} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0' }} required />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} style={{ width: '100%', padding: '10px', marginTop: '10px', cursor: 'pointer' }}>{isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}</button>
        {authMessage && <p style={{ textAlign: 'center', marginTop: '10px', color: authMessage.includes('error') ? 'red' : 'green' }}>{authMessage}</p>}
      </div>
    )
  }

  // Onboarding Step 0
  if (step === 0) {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <h1>🔥 Flame Connect</h1>
        <h3>Complete Your Profile</h3>
        <input type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0' }} />
        <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0' }} />
        <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0' }}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0' }} />
        <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', minHeight: '100px' }} />
        
        <div style={{ margin: '20px 0' }}>
          {photos.length > 0 && <img src={photos[0]} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />}
          <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} id="photo-upload" />
          <label htmlFor="photo-upload" style={{ display: 'inline-block', padding: '10px 20px', background: '#4CAF50', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload Photo'}</label>
        </div>
        
        <button onClick={completeOnboarding} style={{ padding: '12px 30px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Complete Profile</button>
        {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
      </div>
    )
  }

  // Profile Detail View
  if (selectedProfile) {
    const p = selectedProfile
    return (
      <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
        <button onClick={() => setSelectedProfile(null)} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}>← Back</button>
        <div style={{ textAlign: 'center' }}>
          {p.photos && p.photos.length > 0 ? (
            <img src={p.photos[0]} alt={p.display_name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#ddd', margin: '0 auto' }}></div>
          )}
          <h2>{p.display_name || p.email?.split('@')[0]}, {p.age}</h2>
          <p>{p.location_city || 'Location not set'}</p>
          <p>{p.bio}</p>
          <button onClick={() => handleLike(p.id)} style={{ padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>❤️ Send Like</button>
        </div>
      </div>
    )
  }

  // Profile View (Settings)
  if (view === 'profile') {
    return (
      <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setView('people')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>SEARCH</button>
            <button onClick={() => setView('inbox')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>INBOX</button>
            <button onClick={() => setView('profile')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#ff6b6b' }}>PROFILE</button>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          {photos.length > 0 ? (
            <img src={photos[0]} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#ddd', margin: '0 auto' }}></div>
          )}
          <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} id="profile-photo" />
          <label htmlFor="profile-photo" style={{ display: 'block', padding: '5px', color: '#ff6b6b', cursor: 'pointer', fontSize: '12px' }}>Change Photo</label>
          
          <h2>{profile?.display_name || user.email?.split('@')[0]}</h2>
          <p>🟢 Online</p>
          <p>📍 {profile?.location_city || 'Cape Town'}</p>
          
          <button onClick={() => setStep(0)} style={{ width: '100%', padding: '10px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}>Edit Profile</button>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#ccc', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>Logout</button>
        </div>
      </div>
    )
  }

  // Inbox View
  if (view === 'inbox') {
    return (
      <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setView('people')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>SEARCH</button>
            <button onClick={() => setView('inbox')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#ff6b6b' }}>INBOX</button>
            <button onClick={() => setView('profile')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>PROFILE</button>
          </div>
        </div>
        
        <h2>Your Conversations</h2>
        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No conversations yet</p>
            <p>Explore profiles and send a message to start chatting!</p>
            <button onClick={() => setView('people')} style={{ padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Browse People</button>
          </div>
        ) : (
          matches.map(match => (
            <div key={match.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', marginBottom: '10px' }}>
              <strong>{match.display_name || match.email?.split('@')[0]}</strong>
              <p>{match.age} years • {match.location_city || 'Anywhere'}</p>
            </div>
          ))
        )}
      </div>
    )
  }

  // People Grid View (Default)
  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🔥 Flame Connect</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => setView('people')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#ff6b6b' }}>SEARCH</button>
          <button onClick={() => setView('inbox')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>INBOX</button>
          <button onClick={() => setView('profile')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>PROFILE</button>
        </div>
      </div>
      
      {users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>No users found.</p>
          <p>Create another account to see profiles here!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {users.map(u => (
            <div key={u.id} onClick={() => setSelectedProfile(u)} style={{ cursor: 'pointer', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', background: 'white' }}>
              {u.photos && u.photos.length > 0 ? (
                <img src={u.photos[0]} alt={u.display_name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>
              )}
              <div style={{ padding: '12px' }}>
                <h3>{u.display_name || u.email?.split('@')[0]}, {u.age}</h3>
                <p style={{ color: '#666', fontSize: '12px' }}>📍 {u.location_city || 'Unknown'}</p>
                <p style={{ fontSize: '13px', color: '#666' }}>{u.bio?.substring(0, 60)}...</p>
                <button onClick={(e) => { e.stopPropagation(); handleLike(u.id); }} style={{ width: '100%', padding: '8px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>❤️ Like</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
