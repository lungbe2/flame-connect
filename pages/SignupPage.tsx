import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SignupPage({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { display_name: displayName || email.split('@')[0] } }
    });
    
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email to verify! Please login.');
      setTimeout(() => onSwitchToLogin(), 3000);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#ff6b6b' }}>🔥 Create Account</h1>
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
        <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>{loading ? 'Creating...' : 'Sign Up'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Already have an account? <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>Login</button>
      </p>
      {message && <p style={{ textAlign: 'center', color: message.includes('error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}
