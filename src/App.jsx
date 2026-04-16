import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import PeopleGrid from './components/PeopleGrid'

function App() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [view, setView] = useState('landing')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatUser, setChatUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [matches, setMatches] = useState([])
  
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
      
      if (profileData) {
        setProfile(profileData)
        if (!profileData.age || !profileData.bio) {
          setView('onboarding')
        } else {
          await fetchMatches(currentUser.id)
          setView('people')
        }
      } else {
        // Create profile if missing
        await supabase.from('profiles').insert({
          id: currentUser.id,
          email: currentUser.email,
          display_name: currentUser.email?.split('@')[0]
        })
        setView('onboarding')
      }
    }
    setLoading(false)
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

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthMessage('')
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthMessage(error.message)
      else {
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
  }

  const openChat = (otherUser) => {
    setChatUser(otherUser)
    setShowChat(true)
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
  }

  // Landing Page
  if (view === 'landing' && !user) {
    return (
      <div>
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 50px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#ff6b6b' }}>🔥 Flame Connect</h1>
          <div>
            <button onClick={() => setShowLoginModal(true)} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '25px', marginRight: '10px' }}>Login</button>
            <button onClick={() => setShowSignupModal(true)} style={{ background: 'transparent', color: '#ff6b6b', border: '2px solid #ff6b6b', padding: '10px 28px', borderRadius: '25px' }}>Sign Up</button>
          </div>
        </nav>
        <div style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)', color: 'white', textAlign: 'center', padding: '100px 20px' }}>
          <h1 style={{ fontSize: '48px' }}>Find Your Perfect Match 🔥</h1>
          <button onClick={() => setShowSignupModal(true)} style={{ background: 'white', color: '#ff6b6b', border: 'none', padding: '15px 40px', borderRadius: '50px', marginTop: '20px' }}>Get Started</button>
        </div>
        {/* Login Modal */}
        {showLoginModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '400px' }}>
              <h2 style={{ textAlign: 'center' }}>Login</h2>
              <form onSubmit={handleAuth}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px' }}>Login</button>
              </form>
              <button onClick={() => setShowLoginModal(false)} style={{ width: '100%', padding: '12px', marginTop: '10px', background: '#ccc', border: 'none', borderRadius: '8px' }}>Cancel</button>
              {authMessage && <p style={{ color: 'red', textAlign: 'center' }}>{authMessage}</p>}
            </div>
          </div>
        )}
        {/* Signup Modal */}
        {showSignupModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '400px' }}>
              <h2 style={{ textAlign: 'center' }}>Sign Up</h2>
              <form onSubmit={handleAuth}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px' }}>Sign Up</button>
              </form>
              <button onClick={() => setShowSignupModal(false)} style={{ width: '100%', padding: '12px', marginTop: '10px', background: '#ccc', border: 'none', borderRadius: '8px' }}>Cancel</button>
              {authMessage && <p style={{ color: 'green', textAlign: 'center' }}>{authMessage}</p>}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Onboarding
  if (view === 'onboarding') {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#ff6b6b' }}>Complete Your Profile</h1>
        <input type="text" placeholder="Display Name" style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <input type="number" placeholder="Age" style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <input type="text" placeholder="Location" style={{ width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <textarea placeholder="Bio" style={{ width: '100%', padding: '12px', margin: '10px 0', minHeight: '100px', border: '1px solid #ddd', borderRadius: '8px' }} />
        <button style={{ width: '100%', padding: '12px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px' }}>Complete Profile</button>
      </div>
    )
  }

  // Main Dashboard
  if (view === 'people') {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
          <h1 style={{ color: '#ff6b6b', margin: 0 }}>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setView('people')} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '25px' }}>People</button>
            <button onClick={() => setView('inbox')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', color: '#666' }}>Inbox</button>
            <button onClick={() => setView('profile')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', color: '#666' }}>Profile</button>
          </div>
        </div>

        {/* Welcome Message */}
        <div style={{ background: '#fef9f9', padding: '20px', borderRadius: '15px', marginBottom: '30px', textAlign: 'center' }}>
          <h2>Welcome back, {profile?.display_name || user?.email?.split('@')[0]}! 👋</h2>
        </div>

        {/* People Grid Component */}
        <PeopleGrid currentUser={user} onOpenChat={openChat} />

        {/* Footer */}
        <footer style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid #eee', textAlign: 'center', color: '#999' }}>
          <p>&copy; 2024 Flame Connect. All rights reserved.</p>
        </footer>
      </div>
    )
  }

  // Inbox View
  if (view === 'inbox') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
          <h1 style={{ color: '#ff6b6b', margin: 0 }}>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setView('people')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', color: '#666' }}>People</button>
            <button onClick={() => setView('inbox')} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '25px' }}>Inbox</button>
            <button onClick={() => setView('profile')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', color: '#666' }}>Profile</button>
          </div>
        </div>

        <h2>Your Conversations</h2>
        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💌</div>
            <h2>No conversations yet</h2>
            <p>Explore profiles and send a message to start chatting!</p>
            <button onClick={() => setView('people')} style={{ padding: '12px 24px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px' }}>Browse People</button>
          </div>
        ) : (
          matches.map(match => (
            <div key={match.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', marginBottom: '10px', cursor: 'pointer' }} onClick={() => openChat(match)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {match.photos && match.photos.length > 0 ? (
                  <img src={match.photos[0]} alt={match.display_name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f0f0f0' }}></div>
                )}
                <div>
                  <strong>{match.display_name || match.email?.split('@')[0]}</strong>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{match.age} years • {match.location_city || 'Anywhere'}</p>
                </div>
              </div>
            </div>
          ))
        )}

        <footer style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid #eee', textAlign: 'center', color: '#999' }}>
          <p>&copy; 2024 Flame Connect. All rights reserved.</p>
        </footer>
      </div>
    )
  }

  // Profile View
  if (view === 'profile') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
          <h1 style={{ color: '#ff6b6b', margin: 0 }}>🔥 Flame Connect</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setView('people')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', color: '#666' }}>People</button>
            <button onClick={() => setView('inbox')} style={{ background: 'none', border: 'none', padding: '8px 20px', borderRadius: '25px', color: '#666' }}>Inbox</button>
            <button onClick={() => setView('profile')} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '25px' }}>Profile</button>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          {profile?.photos && profile.photos.length > 0 ? (
            <img src={profile.photos[0]} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#f0f0f0', margin: '0 auto' }}>📷</div>
          )}
          <h2>{profile?.display_name || user?.email?.split('@')[0]}</h2>
          <p>🟢 Online</p>
          <p>📍 {profile?.location_city || 'Not set'}</p>
          <p>{profile?.bio}</p>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px', marginTop: '20px' }}>Logout</button>
        </div>

        <footer style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid #eee', textAlign: 'center', color: '#999' }}>
          <p>&copy; 2024 Flame Connect. All rights reserved.</p>
        </footer>
      </div>
    )
  }

  return null
}

export default App
