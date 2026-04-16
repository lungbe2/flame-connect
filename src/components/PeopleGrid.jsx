import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function PeopleGrid({ currentUser, onOpenChat }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedUsers, setLikedUsers] = useState([])

  useEffect(() => {
    fetchUsers()
    fetchLikedUsers()
  }, [])

  const fetchUsers = async () => {
    // Simple query to get all users except current user
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUser.id)
    
    if (!error && data) {
      setUsers(data)
    }
    setLoading(false)
  }

  const fetchLikedUsers = async () => {
    const { data } = await supabase
      .from('likes')
      .select('liked_id')
      .eq('liker_id', currentUser.id)
    setLikedUsers(data?.map(l => l.liked_id) || [])
  }

  const handleLike = async (likedUserId) => {
    await supabase.from('likes').insert({ liker_id: currentUser.id, liked_id: likedUserId })
    setLikedUsers([...likedUsers, likedUserId])
    
    // Check for match
    const { data } = await supabase
      .from('likes')
      .select('*')
      .eq('liker_id', likedUserId)
      .eq('liked_id', currentUser.id)
    
    if (data && data.length > 0) {
      await supabase.from('matches').insert({ 
        user_a: currentUser.id, 
        user_b: likedUserId, 
        status: 'accepted' 
      })
      alert('🎉 It\'s a match! 🎉')
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading users...</div>
  }

  if (users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>💕</div>
        <h2>No users found yet</h2>
        <p>Complete your profile and check back soon!</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {users.map(user => (
        <div key={user.id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          {user.photos && user.photos.length > 0 ? (
            <img src={user.photos[0]} alt={user.display_name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📷</div>
          )}
          <div style={{ padding: '15px' }}>
            <h3>{user.display_name || user.email?.split('@')[0]}, {user.age || '?'}</h3>
            <p style={{ color: '#666', marginBottom: '10px' }}>📍 {user.location_city || 'Unknown'}</p>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>{user.bio?.substring(0, 100)}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => onOpenChat(user)} 
                style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}
              >
                💬 Message
              </button>
              <button 
                onClick={() => handleLike(user.id)} 
                disabled={likedUsers.includes(user.id)}
                style={{ 
                  flex: 1, padding: '10px', 
                  background: likedUsers.includes(user.id) ? '#ccc' : '#ff6b6b', 
                  color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' 
                }}
              >
                {likedUsers.includes(user.id) ? '✓ Liked' : '❤️ Like'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
