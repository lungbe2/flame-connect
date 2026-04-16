import React from 'react';

export default function LandingPage({ onLoginClick, onSignupClick }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#ff6b6b', margin: 0 }}>🔥 Flame Connect</h1>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Home</a>
          <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Features</a>
          <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Success Stories</a>
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

      {/* Footer */}
      <footer style={{ background: '#1a1a2e', color: 'white', padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
          <div>
            <h3>🔥 Flame Connect</h3>
            <p>Find your perfect match today.</p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
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
        <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #333', color: '#aaa' }}>
          <p>&copy; 2024 Flame Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
