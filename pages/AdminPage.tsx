import React from 'react';

export default function AdminPage({ user, onBack }) {
  const isAdmin = user?.email === 'lungbe2@gmail.com';

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
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '5px' }}>← Back</button>
      <h1 style={{ color: '#ff6b6b' }}>Admin Dashboard</h1>
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3>User Statistics</h3>
        <p>Total Users: Coming soon</p>
        <p>Active Users: Coming soon</p>
      </div>
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
        <h3>Reports</h3>
        <p>No pending reports</p>
      </div>
    </div>
  );
}
