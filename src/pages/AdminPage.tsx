import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPage({ user, onBack }) {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Check if user is admin (you can set this in profiles table)
  const isAdmin = user?.email === 'lungbe2@gmail.com'; // Replace with your email

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'users') {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setUsers(data);
    } else if (activeTab === 'reports') {
      // Fetch reported users (you'd need a reports table)
      setReports([]);
    }
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <button onClick={onBack} style={{ padding: '12px 30px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
          <h1 style={{ margin: 0, color: '#ff6b6b' }}>Admin Dashboard</h1>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee' }}>
        <button onClick={() => setActiveTab('users')} style={{ padding: '10px 20px', background: activeTab === 'users' ? '#ff6b6b' : 'none', color: activeTab === 'users' ? 'white' : '#333', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Users ({users.length})</button>
        <button onClick={() => setActiveTab('reports')} style={{ padding: '10px 20px', background: activeTab === 'reports' ? '#ff6b6b' : 'none', color: activeTab === 'reports' ? 'white' : '#333', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Reports ({reports.length})</button>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : activeTab === 'users' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9f9f9' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Age</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{u.display_name || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>{u.age || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{u.location_city || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{u.is_online ? '🟢 Online' : '⚫ Offline'}</td>
                  <td style={{ padding: '12px' }}>
                    <button style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Suspend</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No reports yet</p>
        </div>
      )}
    </div>
  );
}
