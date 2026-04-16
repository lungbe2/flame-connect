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
  const [signupStep, setSignupStep] = useState(1)
  
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
        display_name: displayName,
        age: parseInt(age),
        gender,
        looking_for: lookingFor,
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
        setShowLoginModal(false)
        setTimeout(() => checkUser(), 500)
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthMessage(error.message)
      else {
        setAuthMessage('Check your email to verify!')
        setTimeout(() => setShowSignupModal(false), 2000)
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setView('landing')
    setShowLoginModal(false)
    setShowSignupModal(false)
  }

  const [message, setMessage] = useState('')
  const [showFullBio, setShowFullBio] = useState(false)

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
  }

  // LANDING PAGE - Premium Dating.com Style
  if (view === 'landing' && !user) {
    return (
      <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {/* Premium Navigation */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 20px rgba(0,0,0,0.05)' }}>
          <h1 style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, fontSize: '28px' }}>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <a href="#" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Home</a>
            <a href="#" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Features</a>
            <a href="#" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Success Stories</a>
            <button onClick={() => setShowLoginModal(true)} style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '50px', cursor: 'pointer', fontWeight: '600', transition: 'transform 0.2s' }}>Login</button>
            <button onClick={() => setShowSignupModal(true)} style={{ background: 'transparent', color: '#ff6b6b', border: '2px solid #ff6b6b', padding: '10px 28px', borderRadius: '50px', cursor: 'pointer', fontWeight: '600' }}>Sign Up</button>
          </div>
        </nav>

        {/* Hero Section with Background Image */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(255,107,107,0.9) 0%, rgba(255,142,142,0.9) 100%), url("https://images.unsplash.com/photo-1516589091380-5d8e87f6999b?q=80&w=2070")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white', 
          textAlign: 'center', 
          padding: '140px 20px',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '56px', marginBottom: '20px', fontWeight: '800' }}>Find Your Perfect Match 🔥</h1>
          <p style={{ fontSize: '22px', marginBottom: '40px', maxWidth: '600px', opacity: 0.95 }}>Join thousands of singles looking for meaningful connections. Love is just a click away!</p>
          <button onClick={() => setShowSignupModal(true)} style={{ background: 'white', color: '#ff6b6b', border: 'none', padding: '16px 48px', fontSize: '18px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>Get Started →</button>
        </div>

        {/* Features Section */}
        <div style={{ padding: '80px 20px', textAlign: 'center', background: '#fef9f9' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '50px', color: '#333' }}>Why Choose Flame Connect?</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ flex: 1, minWidth: '250px', padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔒</div>
              <h3 style={{ fontSize: '22px', marginBottom: '10px' }}>Safe & Secure</h3>
              <p style={{ color: '#666' }}>Your safety is our priority with advanced verification and moderation.</p>
            </div>
            <div style={{ flex: 1, minWidth: '250px', padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
              <h3 style={{ fontSize: '22px', marginBottom: '10px' }}>Real-time Chat</h3>
              <p style={{ color: '#666' }}>Connect instantly with matches through our real-time messaging system.</p>
            </div>
            <div style={{ flex: 1, minWidth: '250px', padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📍</div>
              <h3 style={{ fontSize: '22px', marginBottom: '10px' }}>Location Based</h3>
              <p style={{ color: '#666' }}>Find singles near you with our smart location detection.</p>
            </div>
          </div>
        </div>

        {/* Profile Cards Preview - Premium Style */}
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '20px', color: '#333' }}>Meet Some of Our Members</h2>
          <p style={{ color: '#666', marginBottom: '50px', fontSize: '18px' }}>Join thousands of singles already finding love</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            {[
              { name: 'Sarah, 28', location: 'Cape Town', interest: 'Adventure seeker', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300' },
              { name: 'Michael, 32', location: 'Johannesburg', interest: 'Food lover', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
              { name: 'Jessica, 26', location: 'Durban', interest: 'Beach enthusiast', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }
            ].map((member, i) => (
              <div key={i} style={{ width: '300px', background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}>
                <div style={{ height: '300px', background: `url(${member.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '5px' }}>{member.name}</h3>
                  <p style={{ color: '#666', marginBottom: '5px' }}>📍 {member.location}</p>
                  <p style={{ color: '#ff6b6b', fontWeight: '500' }}>{member.interest}</p>
                  <button style={{ width: '100%', padding: '12px', marginTop: '15px', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: '600' }}>View Profile</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div style={{ padding: '80px 20px', background: '#fef9f9', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '50px', color: '#333' }}>What Our Users Say</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ flex: 1, minWidth: '280px', background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '20px' }}>"I found the love of my life on Flame Connect! The platform made it so easy to connect with like-minded people."</p>
              <h4 style={{ color: '#ff6b6b' }}>- Lisa M.</h4>
            </div>
            <div style={{ flex: 1, minWidth: '280px', background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '20px' }}>"The real-time chat feature is amazing. I love how quickly I can connect with matches."</p>
              <h4 style={{ color: '#ff6b6b' }}>- David K.</h4>
            </div>
            <div style={{ flex: 1, minWidth: '280px', background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '20px' }}>"Finally, a dating app that feels safe and authentic. Highly recommend!"</p>
              <h4 style={{ color: '#ff6b6b' }}>- Rachel T.</h4>
            </div>
          </div>
        </div>

        {/* Footer with Trust Badges */}
        <footer style={{ background: '#1a1a2e', color: 'white', padding: '60px 20px 30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>🔥 Flame Connect</h3>
              <p style={{ color: '#aaa' }}>Find your perfect match today.</p>
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <span style={{ fontSize: '24px', cursor: 'pointer' }}>📘</span>
                <span style={{ fontSize: '24px', cursor: 'pointer' }}>🐦</span>
                <span style={{ fontSize: '24px', cursor: 'pointer' }}>📷</span>
              </div>
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>About Us</a></li>
                <li><a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Success Stories</a></li>
                <li><a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Safety Tips</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Terms of Service</a></li>
                <li><a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Privacy Policy</a></li>
                <li><a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Refund Policy</a></li>
              </ul>
            </div>
            <div>
              <h4>Trust Badges</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ background: '#333', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' }}>SSL Secure</span>
                <span style={{ background: '#333', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' }}>Verified Profiles</span>
                <span style={{ background: '#333', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' }}>24/7 Support</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #333', color: '#aaa' }}>
            <p>&copy; 2024 Flame Connect. All rights reserved.</p>
          </div>
        </footer>

        {/* Login Modal */}
        {showLoginModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '450px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Welcome Back</h2>
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Sign in to continue your journey</p>
              <form onSubmit={handleAuth}>
                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '12px', fontSize: '16px' }} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '12px', fontSize: '16px' }} required />
                <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginTop: '10px' }}>Login</button>
              </form>
              <button onClick={() => { setShowLoginModal(false); setShowSignupModal(true); }} style={{ width: '100%', padding: '14px', marginTop: '15px', background: 'none', border: '2px solid #ff6b6b', color: '#ff6b6b', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>Create New Account</button>
              <button onClick={() => setShowLoginModal(false)} style={{ width: '100%', padding: '12px', marginTop: '10px', background: '#f0f0f0', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>Cancel</button>
              {authMessage && <p style={{ textAlign: 'center', marginTop: '15px', color: authMessage.includes('error') ? 'red' : 'green' }}>{authMessage}</p>}
            </div>
          </div>
        )}

        {/* Signup Modal */}
        {showSignupModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '450px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Create Account</h2>
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Join Flame Connect today</p>
              <form onSubmit={handleAuth}>
                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '12px', fontSize: '16px' }} required />
                <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '12px', fontSize: '16px' }} required />
                <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginTop: '10px' }}>Sign Up</button>
              </form>
              <button onClick={() => { setShowSignupModal(false); setShowLoginModal(true); }} style={{ width: '100%', padding: '14px', marginTop: '15px', background: 'none', border: '2px solid #ff6b6b', color: '#ff6b6b', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>Already have an account? Login</button>
              <button onClick={() => setShowSignupModal(false)} style={{ width: '100%', padding: '12px', marginTop: '10px', background: '#f0f0f0', border: 'none', borderRadius: '50px', cursor: 'pointer' }}>Cancel</button>
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
        <h1 style={{ textAlign: 'center' }}>Complete Your Profile</h1>
        <input type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
          <option value="">Looking for</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="everyone">Everyone</option>
        </select>
        <input type="text" placeholder="Location (City)" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <textarea placeholder="Bio - Tell others about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', minHeight: '100px', border: '1px solid #ddd', borderRadius: '8px' }} />
        
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          {photos.length > 0 && <img src={photos[0]} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />}
          <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} id="photo-upload" />
          <label htmlFor="photo-upload" style={{ display: 'inline-block', padding: '10px 20px', background: '#4CAF50', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload Photo'}</label>
        </div>
        
        <button onClick={completeOnboarding} style={{ width: '100%', padding: '12px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Complete Profile</button>
        {message && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{message}</p>}
      </div>
    )
  }

  // PEOPLE GRID VIEW (after login)
  if (view === 'people') {
    return (
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h1 style={{ color: '#ff6b6b', margin: 0 }}>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setView('people')} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer' }}>👥 People</button>
            <button onClick={() => setView('inbox')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', color: '#666' }}>💬 Inbox</button>
            <button onClick={() => setView('profile')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', color: '#666' }}>👤 Profile</button>
          </div>
        </div>
        
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>No users found. Create another account to see profiles here!</p>
            <button onClick={() => setView('profile')} style={{ padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Complete Your Profile</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
            {users.map(u => (
              <div key={u.id} onClick={() => setSelectedProfile(u)} style={{ cursor: 'pointer', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}>
                {u.photos && u.photos.length > 0 ? (
                  <img src={u.photos[0]} alt={u.display_name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '250px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📷</div>
                )}
                <div style={{ padding: '15px' }}>
                  <h3>{u.display_name || u.email?.split('@')[0]}, {u.age}</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>📍 {u.location_city || 'Unknown'}</p>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>{u.bio?.substring(0, 80)}...</p>
                  <button onClick={(e) => { e.stopPropagation(); handleLike(u.id); }} style={{ width: '100%', padding: '10px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>❤️ Like</button>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h1 style={{ color: '#ff6b6b', margin: 0 }}>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setView('people')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', color: '#666' }}>👥 People</button>
            <button onClick={() => setView('inbox')} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer' }}>💬 Inbox</button>
            <button onClick={() => setView('profile')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', color: '#666' }}>👤 Profile</button>
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

  // PROFILE VIEW
  if (view === 'profile') {
    return (
      <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h1 style={{ color: '#ff6b6b', margin: 0 }}>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setView('people')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', color: '#666' }}>👥 People</button>
            <button onClick={() => setView('inbox')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', color: '#666' }}>💬 Inbox</button>
            <button onClick={() => setView('profile')} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer' }}>👤 Profile</button>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          {photos.length > 0 ? (
            <img src={photos[0]} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#ddd', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>
          )}
          <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} id="profile-photo" />
          <label htmlFor="profile-photo" style={{ display: 'block', color: '#ff6b6b', cursor: 'pointer', marginBottom: '15px', fontSize: '14px' }}>Change Photo</label>
          
          <h2>{profile?.display_name || user?.email?.split('@')[0]}</h2>
          <p>🟢 Online</p>
          <p>📍 {profile?.location_city || 'Cape Town'}</p>
          <p>{profile?.bio}</p>
          
          <button onClick={() => { setStep(0); setView('onboarding'); }} style={{ width: '100%', padding: '12px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' }}>Edit Profile</button>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', background: '#ccc', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>Logout</button>
        </div>
      </div>
    )
  }

  // PROFILE DETAIL VIEW
  if (selectedProfile) {
    const p = selectedProfile
    return (
      <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
        <button onClick={() => setSelectedProfile(null)} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '8px' }}>← Back</button>
        <div style={{ textAlign: 'center' }}>
          {p.photos && p.photos.length > 0 ? (
            <img src={p.photos[0]} alt={p.display_name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#ddd', margin: '0 auto' }}></div>
          )}
          <h2>{p.display_name || p.email?.split('@')[0]}, {p.age}</h2>
          <p>📍 {p.location_city || 'Location not set'}</p>
          <p>{p.bio}</p>
          <button onClick={() => handleLike(p.id)} style={{ padding: '12px 30px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '20px' }}>❤️ Send Like</button>
        </div>
      </div>
    )
  }

  return null
}

export default App
