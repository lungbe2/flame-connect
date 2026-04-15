import React from 'react';

function LoginPage({ email, setEmail, password, setPassword, isLogin, setIsLogin, handleAuth, authMessage }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Hero Section */}
        <div className="login-hero" style={{ borderRadius: '32px 32px 0 0' }}>
          <h1>🔥 Flame Connect</h1>
          <p>Find your perfect match today</p>
        </div>
        
        {/* Login Card */}
        <div className="modern-card" style={{ borderRadius: '0 0 32px 32px' }}>
          <form onSubmit={handleAuth}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Email Address</label>
              <input
                type="email"
                className="input-modern"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Password</label>
              <input
                type="password"
                className="input-modern"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn-gradient">
              {isLogin ? '✨ Sign In ✨' : '✨ Create Account ✨'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="btn-outline"
            >
              {isLogin ? '🌸 New here? Create an account 🌸' : '🌸 Already have an account? Sign in 🌸'}
            </button>
          </div>
          
          {authMessage && (
            <div style={{ 
              marginTop: '20px', 
              padding: '12px', 
              borderRadius: '12px', 
              background: authMessage.includes('error') ? '#fee' : '#e8f5e9',
              color: authMessage.includes('error') ? '#c62828' : '#2e7d32',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {authMessage}
            </div>
          )}
          
          {/* Decorative Elements */}
          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
            <p>By signing in, you agree to our Terms & Conditions</p>
            <p style={{ marginTop: '8px' }}>❤️ Join thousands of happy couples ❤️</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
