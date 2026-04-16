import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState('landing')
  const [users, setUsers] = useState([])
  const [matches, setMatches] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [authMessage, setAuthMessage] = useState('')

  // ========== ONLINE PRESENCE FUNCTIONS ==========
  
  // Update online status in database
  const updateOnlineStatus = useCallback(async (isOnline) => {
    if (!user) return
    console.log(`Setting online status to: ${isOnline} for user ${user.id}`)
    await supabase
      .from('profiles')
      .update({ 
        is_online: isOnline, 
        last_seen: new Date().toISOString() 
      })
      .eq('id', user.id)
  }, [user])

  // Heartbeat to keep user online while active
  const startHeartbeat = useCallback(() => {
    const interval = setInterval(() => {
      if (user) {
        supabase
          .from('profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', user.id)
          .then(() => console.log('Heartbeat sent'))
      }
    }, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [user])

  // Subscribe to online status changes of other users
  const subscribeToOnlineStatus = useCallback(() => {
    const channel = supabase
      .channel('online-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `is_online=eq.true`
      }, (payload) => {
        console.log('Online status update:', payload.new.display_name)
        // Refresh users list when someone comes online/offline
        fetchUsers()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  // ========== MAIN FUNCTIONS ==========

  useEffect(() => {
    checkUser()
    
    // Handle tab close - mark user offline
    const handleBeforeUnload = async () => {
      if (user) {
        await supabase
          .from('profiles')
          .update({ is_online: false, last_seen: new Date().toISOString() })
          .eq('id', user.id)
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession()
    const currentUser = data?.session?.user || null
    setUser(currentUser)
    
    if (currentUser) {
      // Mark user online when they log in
      await updateOnlineStatus(true)
      
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
        setLookingFor(profileData.looking_for || '')
        setBio(profileData.bio || '')
        setLocation(profileData.location_city || '')
        setStep(5)
        await fetchUsers()
        await fetchMatches(currentUser.id)
        setView('people')
      } else {
        setStep(0)
        setView('onboarding')
      }
    }
    setLoading(false)
  }

  const fetchUsers = async () => {
    console.log('Fetching users...')
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user?.id)
      .order('is_online', { ascending: false }) // Online users first
      .limit(50)
    
    if (!error && data) {
      console.log(`Found ${data.length} users`)
      setUsers(data)
    } else if (error) {
      console.error('Error fetching users:', error)
    }
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
        display_name: displayName,
        age: parseInt(age),
        gender,
        looking_for: lookingFor,
        bio,
        location_city: location,
        photos,
        is_online: true,
        last_seen: new Date().toISOString()
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setAuthMessage(error.message)
      } else {
        setAuthMessage('Logged in!')
        setShowLoginModal(false)
        // Mark user online
        if (data.user) {
          await supabase
            .from('profiles')
            .update({ is_online: true, last_seen: new Date().toISOString() })
            .eq('id', data.user.id)
        }
        setTimeout(() => checkUser(), 500)
      }
    } else {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { display_name: displayName || email.split('@')[0] }
        }
      })
      if (error) {
        setAuthMessage(error.message)
      } else {
        setAuthMessage('Check your email to verify!')
        setTimeout(() => setShowSignupModal(false), 2000)
      }
    }
  }

  const handleLogout = async () => {
    // Mark user offline before logging out
    if (user) {
      await supabase
        .from('profiles')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('id', user.id)
    }
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setView('landing')
    setShowLoginModal(false)
    setShowSignupModal(false)
  }

  const [message, setMessage] = useState('')

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
  }

  // LANDING PAGE
  if (view === 'landing' && !user) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#ff6b6b', margin: 0 }}>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Home</a>
            <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Features</a>
            <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Success Stories</a>
            <button onClick={() => setShowLoginModal(true)} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '25px', cursor: 'pointer' }}>Login</button>
            <button onClick={() => setShowSignupModal(true)} style={{ background: 'transparent', color: '#ff6b6b', border: '2px solid #ff6b6b', padding: '10px 28px', borderRadius: '25px', cursor: 'pointer' }}>Sign Up</button>
          </div>
        </nav>

        <div style={{ 
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)', 
          color: 'white', 
          textAlign: 'center', 
          padding: '100px 20px'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Find Your Perfect Match 🔥</h1>
          <p style={{ fontSize: '20px', marginBottom: '30px' }}>Join thousands of singles looking for meaningful connections.</p>
          <button onClick={() => setShowSignupModal(true)} style={{ background: 'white', color: '#ff6b6b', border: 'none', padding: '15px 40px', fontSize: '18px', borderRadius: '50px', cursor: 'pointer' }}>Get Started →</button>
        </div>

        <footer style={{ background: '#1a1a2e', color: 'white', padding: '40px 20px', textAlign: 'center' }}>
          <p>&copy; 2024 Flame Connect. All rights reserved.</p>
        </footer>

        {/* Login Modal */}
        {showLoginModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '450px', width: '90%' }}>
              <h2 style={{ textAlign: 'center' }}>Welcome Back</h2>
              <form onSubmit={handleAuth}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
                <button type="submit" style={{ width: '100%', padding: '14px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Login</button>
              </form>
              <button onClick={() => { setShowLoginModal(false); setShowSignupModal(true); }} style={{ width: '100%', padding: '14px', marginTop: '10px', background: 'none', border: '1px solid #ff6b6b', color: '#ff6b6b', borderRadius: '25px', cursor: 'pointer' }}>Create Account</button>
              <button onClick={() => setShowLoginModal(false)} style={{ width: '100%', padding: '12px', marginTop: '10px', background: '#f0f0f0', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Cancel</button>
              {authMessage && <p style={{ textAlign: 'center', marginTop: '15px', color: authMessage.includes('error') ? 'red' : 'green' }}>{authMessage}</p>}
            </div>
          </div>
        )}

        {/* Signup Modal */}
        {showSignupModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '450px', width: '90%' }}>
              <h2 style={{ textAlign: 'center' }}>Create Account</h2>
              <form onSubmit={handleAuth}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
                <button type="submit" style={{ width: '100%', padding: '14px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Sign Up</button>
              </form>
              <button onClick={() => { setShowSignupModal(false); setShowLoginModal(true); }} style={{ width: '100%', padding: '14px', marginTop: '10px', background: 'none', border: '1px solid #ff6b6b', color: '#ff6b6b', borderRadius: '25px', cursor: 'pointer' }}>Already have an account? Login</button>
              <button onClick={() => setShowSignupModal(false)} style={{ width: '100%', padding: '12px', marginTop: '10px', background: '#f0f0f0', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Cancel</button>
              {authMessage && <p style={{ textAlign: 'center', marginTop: '15px', color: authMessage.includes('error') ? 'red' : 'green' }}>{authMessage}</p>}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ONBOARDING FORM
  if (view === 'onboarding' || step < 5) {
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
          <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} id="photo-upload" />
          <label htmlFor="photo-upload" style={{ display: 'inline-block', padding: '10px 20px', background: '#4CAF50', color: 'white', borderRadius: '25px', cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload Photo'}</label>
        </div>
        
        <button onClick={completeOnboarding} style={{ width: '100%', padding: '14px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Complete Profile</button>
        {message && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{message}</p>}
      </div>
    )
  }

  // PEOPLE GRID VIEW
  if (view === 'people') {
    return (
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#ff6b6b' }}>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => { setView('people'); fetchUsers(); }} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👥 People</button>
            <button onClick={() => setView('inbox')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>💬 Inbox</button>
            <button onClick={() => setView('profile')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👤 Profile</button>
          </div>
        </div>
        
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💕</div>
            <h2>No users found yet</h2>
            <p>Complete your profile and check back soon!</p>
            <button onClick={() => setView('profile')} style={{ padding: '12px 24px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '20px' }}>Complete Your Profile</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
            {users.map(u => (
              <div key={u.id} onClick={() => setSelectedProfile(u)} style={{ cursor: 'pointer', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                {u.photos && u.photos.length > 0 ? (
                  <img src={u.photos[0]} alt={u.display_name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '250px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📷</div>
                )}
                <div style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0 }}>{u.display_name || u.email?.split('@')[0]}, {u.age || '?'}</h3>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: u.is_online ? '#4CAF50' : '#999' }}></span>
                  </div>
                  <p style={{ color: '#666', fontSize: '14px' }}>📍 {u.location_city || 'Unknown'}</p>
                  <p style={{ fontSize: '13px', color: '#666' }}>{u.bio?.substring(0, 80)}...</p>
                  <button onClick={(e) => { e.stopPropagation(); handleLike(u.id); }} style={{ width: '100%', padding: '10px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '10px' }}>❤️ Like</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // INBOX VIEW
  if (view === 'inbox') {
    return (
      <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#ff6b6b' }}>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setView('people')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👥 People</button>
            <button onClick={() => setView('inbox')} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>💬 Inbox</button>
            <button onClick={() => setView('profile')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👤 Profile</button>
          </div>
        </div>
        
        <h2>Your Conversations</h2>
        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💌</div>
            <h2>No conversations yet</h2>
            <p>Explore profiles and send a message to start chatting!</p>
            <button onClick={() => setView('people')} style={{ padding: '12px 24px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '20px' }}>Browse People</button>
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

  // PROFILE VIEW
  if (view === 'profile') {
    return (
      <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#ff6b6b' }}>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setView('people')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👥 People</button>
            <button onClick={() => setView('inbox')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>💬 Inbox</button>
            <button onClick={() => setView('profile')} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👤 Profile</button>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          {photos.length > 0 ? (
            <img src={photos[0]} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px', border: '3px solid #ff6b6b' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#f0f0f0', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📷</div>
          )}
          <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} id="profile-photo" />
          <label htmlFor="profile-photo" style={{ display: 'inline-block', color: '#ff6b6b', cursor: 'pointer', marginBottom: '15px' }}>Change Photo</label>
          
          <h2>{profile?.display_name || user?.email?.split('@')[0]}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#4CAF50' }}></span>
            <span>Online</span>
            <span>•</span>
            <span>📍 {profile?.location_city || 'Cape Town'}</span>
          </div>
          <p>{profile?.bio}</p>
          
          <button onClick={() => { setStep(0); setView('onboarding'); }} style={{ width: '100%', padding: '14px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '20px' }}>Edit Profile</button>
          <button onClick={handleLogout} style={{ width: '100%', padding: '14px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '10px' }}>Logout</button>
        </div>
      </div>
    )
  }

  // PROFILE DETAIL VIEW
  if (selectedProfile) {
    const p = selectedProfile
    return (
      <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
        <button onClick={() => setSelectedProfile(null)} style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer', background: '#f0f0f0', border: 'none', borderRadius: '25px' }}>← Back</button>
        <div style={{ textAlign: 'center' }}>
          {p.photos && p.photos.length > 0 ? (
            <img src={p.photos[0]} alt={p.display_name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ff6b6b' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#f0f0f0', margin: '0 auto' }}>📷</div>
          )}
          <h2>{p.display_name || p.email?.split('@')[0]}, {p.age}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: p.is_online ? '#4CAF50' : '#999' }}></span>
            <span>{p.is_online ? 'Online' : 'Offline'}</span>
            <span>•</span>
            <span>📍 {p.location_city || 'Unknown'}</span>
          </div>
          <p>{p.bio}</p>
          <button onClick={() => handleLike(p.id)} style={{ padding: '12px 30px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '20px' }}>❤️ Send Like</button>
        </div>
      </div>
    )
  }

  return null
}

export default App
