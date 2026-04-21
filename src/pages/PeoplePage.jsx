import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PeoplePage({ user, profile, onNavigate }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedUsers, setLikedUsers] = useState([])

  useEffect(() => {
    fetchUsers()
    fetchLikedUsers()
  }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
    
    if (!error && data) {
      setUsers(data)
    }
    setLoading(false)
  }

  const fetchLikedUsers = async () => {
    const { data } = await supabase
      .from('likes')
      .select('liked_id')
      .eq('liker_id', user.id)
    setLikedUsers(data?.map(l => l.liked_id) || [])
  }

  const handleSendMessage = async (targetUser) => {
    // Create or get match
    const { data: existing } = await supabase
      .from('matches')
      .select('id')
      .or(`and(user_a.eq.${user.id},user_b.eq.${targetUser.id}),and(user_a.eq.${targetUser.id},user_b.eq.${user.id})`)
      .maybeSingle()
    
    if (existing) {
      onNavigate('inbox')
    } else {
      const { data: newMatch } = await supabase
        .from('matches')
        .insert({ user_a: user.id, user_b: targetUser.id, status: 'pending' })
        .select()
        .single()
      
      onNavigate('inbox')
    }
  }

  const handleLike = async (likedUserId) => {
    await supabase.from('likes').insert({ liker_id: user.id, liked_id: likedUserId })
    setLikedUsers([...likedUsers, likedUserId])
    
    // Check for match
    const { data } = await supabase
      .from('likes')
      .select('*')
      .eq('liker_id', likedUserId)
      .eq('liked_id', user.id)
    
    if (data && data.length > 0) {
      await supabase.from('matches').insert({ 
        user_a: user.id, 
        user_b: likedUserId, 
        status: 'accepted' 
      })
      alert('🎉 It\'s a match! 🎉')
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentView="people" onNavigate={onNavigate} user={user} profile={profile} />
      
      <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', width: '100%' }}>
        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #fef9f9 0%, #fff 100%)',
          padding: '30px',
          borderRadius: '20px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h2>Welcome back, {profile?.display_name || user?.email?.split('@')[0]}! 👋</h2>
          <p>There are {users.length} people waiting to connect with you!</p>
        </div>
        
        {/* Users Grid */}
        <h3>Suggested Matches</h3>
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>💕</div>
            <h2>No users found yet</h2>
            <p>Complete your profile and check back soon!</p>
            <button onClick={() => onNavigate('profile')} style={{ padding: '12px 24px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Complete Your Profile</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
            {users.map(u => (
              <div key={u.id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                {u.photos && u.photos.length > 0 ? (
                  <img src={u.photos[0]} alt={u.display_name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '220px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📷</div>
                )}
                <div style={{ padding: '15px' }}>
                  <h3>{u.display_name || u.email?.split('@')[0]}, {u.age || '?'}</h3>
                  <p style={{ color: '#666', marginBottom: '10px' }}>📍 {u.location_city || 'Unknown'}</p>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>{u.bio?.substring(0, 100)}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleSendMessage(u)} 
                      style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}
                    >
                      💬 Send Message
                    </button>
                    <button 
                      onClick={() => handleLike(u.id)} 
                      disabled={likedUsers.includes(u.id)}
                      style={{ 
                        flex: 1, padding: '10px', 
                        background: likedUsers.includes(u.id) ? '#ccc' : '#ff6b6b', 
                        color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' 
                      }}
                    >
                      {likedUsers.includes(u.id) ? '✓ Liked' : '❤️ Like'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}
