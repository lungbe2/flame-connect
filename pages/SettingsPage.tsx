import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SettingsPage({ user, onBack }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    setLoading(true);
    // Note: Delete user requires admin or edge function
    setMessage('Contact support to delete account.');
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}>← Back</button>
      <h1>Settings</h1>
      
      <div style={{ margin: '20px 0', padding: '20px', background: '#f9f9f9', borderRadius: '10px' }}>
        <h3>Account</h3>
        <p>Email: {user?.email}</p>
        <button onClick={() => alert('Feature coming soon')} style={{ padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Change Password</button>
      </div>
      
      <div style={{ margin: '20px 0', padding: '20px', background: '#f9f9f9', borderRadius: '10px' }}>
        <h3>Notifications</h3>
        <label><input type="checkbox" defaultChecked /> New matches</label><br />
        <label><input type="checkbox" defaultChecked /> New messages</label><br />
        <label><input type="checkbox" defaultChecked /> Likes</label>
      </div>
      
      <div style={{ margin: '20px 0', padding: '20px', background: '#fee', borderRadius: '10px' }}>
        <h3 style={{ color: 'red' }}>Danger Zone</h3>
        <button onClick={handleDeleteAccount} disabled={loading} style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Delete Account</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}
