import { useState } from 'react'

export default function Navbar({ currentView, onNavigate, user, profile }) {
  const [showMenu, setShowMenu] = useState(false)
  
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <h1 style={{ color: '#ff6b6b', margin: 0, cursor: 'pointer' }} onClick={() => onNavigate('people')}>
        🔥 Flame Connect
      </h1>
      
      <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
        <button
          onClick={() => onNavigate('people')}
          style={{
            background: currentView === 'people' ? '#ff6b6b' : 'none',
            color: currentView === 'people' ? 'white' : '#666',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '25px',
            cursor: 'pointer'
          }}
        >
          👥 People
        </button>
        <button
          onClick={() => onNavigate('inbox')}
          style={{
            background: currentView === 'inbox' ? '#ff6b6b' : 'none',
            color: currentView === 'inbox' ? 'white' : '#666',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '25px',
            cursor: 'pointer'
          }}
        >
          💬 Inbox
        </button>
        <button
          onClick={() => onNavigate('profile')}
          style={{
            background: currentView === 'profile' ? '#ff6b6b' : 'none',
            color: currentView === 'profile' ? 'white' : '#666',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '25px',
            cursor: 'pointer'
          }}
        >
          👤 Profile
        </button>
        
        {/* Profile dropdown */}
        <div style={{ position: 'relative' }}>
          {profile?.photos && profile.photos.length > 0 ? (
            <img
              src={profile.photos[0]}
              alt="Profile"
              style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }}
              onClick={() => setShowMenu(!showMenu)}
            />
          ) : (
            <div
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setShowMenu(!showMenu)}
            >
              👤
            </div>
          )}
          
          {showMenu && (
            <div style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              padding: '10px 0',
              minWidth: '150px',
              zIndex: 200
            }}>
              <button onClick={() => { onNavigate('profile'); setShowMenu(false) }} style={{ width: '100%', padding: '10px 20px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>My Profile</button>
              <button onClick={() => { onNavigate('inbox'); setShowMenu(false) }} style={{ width: '100%', padding: '10px 20px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>Messages</button>
              <hr style={{ margin: '5px 0' }} />
              <button onClick={() => { onNavigate('logout'); setShowMenu(false) }} style={{ width: '100%', padding: '10px 20px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#ff6b6b' }}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
