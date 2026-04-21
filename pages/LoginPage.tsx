import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginPage({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setMessage(error.message);
    } else {
      // Mark user online
      if (data.user) {
        await supabase.from('profiles').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', data.user.id);
      }
      onLogin();
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#ff6b6b' }}>🔥 Flame Connect</h1>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} required />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Don't have an account? <button onClick={onSwitchToSignup} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>Sign Up</button>
      </p>
      {message && <p style={{ textAlign: 'center', color: 'red' }}>{message}</p>}
    </div>
  );
}
