import React from 'react';

export default function LandingPage({ onLoginClick, onSignupClick, onNavigate }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#ff6b6b', margin: 0 }}>🔥 Flame Connect</h1>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Home</a>
          <a href="#" style={{ textDecoration: 'none', color: '#333' }} onClick={(e) => { e.preventDefault(); onNavigate?.('explore'); }}>Explore</a>
          <a href="#" style={{ textDecoration: 'none', color: '#333' }} onClick={(e) => { e.preventDefault(); onNavigate?.('help'); }}>Help</a>
          <button onClick={onLoginClick} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 28px', borderRadius: '25px', cursor: 'pointer' }}>Login</button>
          <button onClick={onSignupClick} style={{ background: 'transparent', color: '#ff6b6b', border: '2px solid #ff6b6b', padding: '10px 28px', borderRadius: '25px', cursor: 'pointer' }}>Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)', color: 'white', textAlign: 'center', padding: '100px 20px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Find Your Perfect Match 🔥</h1>
        <p style={{ fontSize: '20px', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>Join thousands of singles looking for meaningful connections. Love is just a click away!</p>
        <button onClick={onSignupClick} style={{ background: 'white', color: '#ff6b6b', border: 'none', padding: '15px 40px', fontSize: '18px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}>Get Started →</button>
      </div>

      {/* Features */}
      <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fef9f9' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '40px' }}>Why Choose Flame Connect?</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ flex: 1, minWidth: '200px', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔒</div>
            <h3>Safe & Secure</h3>
            <p>Your safety is our priority with advanced verification.</p>
          </div>
          <div style={{ flex: 1, minWidth: '200px', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
            <h3>Real-time Chat</h3>
            <p>Connect instantly with matches through messaging.</p>
          </div>
          <div style={{ flex: 1, minWidth: '200px', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📍</div>
            <h3>Location Based</h3>
            <p>Find singles near you with location detection.</p>
          </div>
        </div>
      </div>

      {/* Footer with all links */}
      <footer style={{ background: '#1a1a2e', color: 'white', padding: '60px 20px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <h3>🔥 Flame Connect</h3>
            <p>Find your perfect match today.</p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <span style={{ fontSize: '24px', cursor: 'pointer' }}>📘</span>
              <span style={{ fontSize: '24px', cursor: 'pointer' }}>🐦</span>
              <span style={{ fontSize: '24px', cursor: 'pointer' }}>📷</span>
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><button onClick={() => onNavigate?.('help')} style={{ color: '#aaa', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>Help Center</button></li>
              <li><button onClick={() => onNavigate?.('explore')} style={{ color: '#aaa', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>Explore</button></li>
              <li><button onClick={() => onNavigate?.('upgrade')} style={{ color: '#aaa', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>Upgrade</button></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><button onClick={() => onNavigate?.('terms')} style={{ color: '#aaa', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>Terms of Service</button></li>
              <li><button onClick={() => onNavigate?.('privacy')} style={{ color: '#aaa', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>Privacy Policy</button></li>
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
    </div>
  );
}
