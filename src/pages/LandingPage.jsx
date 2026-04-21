export default function LandingPage({ onShowLogin, onShowSignup }) {
  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 50px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#ff6b6b' }}>🔥 Flame Connect</h1>
        <div>
          <button onClick={onShowLogin} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '25px', marginRight: '10px' }}>Login</button>
          <button onClick={onShowSignup} style={{ background: 'transparent', color: '#ff6b6b', border: '2px solid #ff6b6b', padding: '10px 28px', borderRadius: '25px' }}>Sign Up</button>
        </div>
      </nav>
      
      <div style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)', color: 'white', textAlign: 'center', padding: '100px 20px' }}>
        <h1 style={{ fontSize: '48px' }}>Find Your Perfect Match 🔥</h1>
        <p style={{ fontSize: '20px', marginTop: '20px' }}>Join thousands of singles looking for meaningful connections.</p>
        <button onClick={onShowSignup} style={{ background: 'white', color: '#ff6b6b', border: 'none', padding: '15px 40px', borderRadius: '50px', marginTop: '30px', fontSize: '16px', cursor: 'pointer' }}>Get Started →</button>
      </div>
      
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Why Choose Flame Connect?</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '40px', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: '250px' }}>🔒 <h3>Safe & Secure</h3><p>Your safety is our priority</p></div>
          <div style={{ maxWidth: '250px' }}>💬 <h3>Real-time Chat</h3><p>Connect instantly with matches</p></div>
          <div style={{ maxWidth: '250px' }}>📍 <h3>Location Based</h3><p>Find singles near you</p></div>
        </div>
      </div>
      
      <footer style={{ background: '#1a1a2e', color: 'white', padding: '40px', textAlign: 'center' }}>
        <p>&copy; 2024 Flame Connect. All rights reserved.</p>
      </footer>
    </div>
  )
}
