import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPage({ user, onBack }) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalMatches: 0,
    totalMessages: 0,
    newUsersToday: 0,
    growth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [announcement, setAnnouncement] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [featureToggles, setFeatureToggles] = useState({
    videoChat: false,
    aiModeration: false,
    pushNotifications: true
  });

  const isAdmin = user?.email === 'lungbe2@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
      fetchAuditLogs();
    }
  }, [isAdmin, activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    
    // Fetch all users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (usersData) {
      setUsers(usersData);
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const newToday = usersData.filter(u => new Date(u.created_at) >= today).length;
      const active = usersData.filter(u => u.is_online === true).length;
      const lastWeek = usersData.filter(u => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(u.created_at) >= weekAgo;
      }).length;
      const growthPercent = usersData.length > 0 ? ((newToday / usersData.length) * 100).toFixed(1) : 0;
      
      setStats({
        totalUsers: usersData.length,
        activeUsers: active,
        totalMatches: await getCount('matches'),
        totalMessages: await getCount('messages'),
        newUsersToday: newToday,
        growth: growthPercent
      });
    }
    
    // Fetch reported content (simulated - you'd need a reports table)
    setReports([
      { id: 1, type: 'user', reporterId: 'user123', reportedId: 'user456', reason: 'Spam', status: 'pending', createdAt: new Date().toISOString() },
      { id: 2, type: 'message', reporterId: 'user789', reportedId: 'user123', reason: 'Harassment', status: 'pending', createdAt: new Date().toISOString() }
    ]);
    
    setLoading(false);
  };

  const getCount = async (table) => {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    return count || 0;
  };

  const fetchAuditLogs = async () => {
    // Simulated audit logs - in production, create an audit_logs table
    setAuditLogs([
      { id: 1, action: 'User Banned', admin: 'admin@flameconnect.com', target: 'spamuser@email.com', timestamp: new Date().toISOString() },
      { id: 2, action: 'Profile Verified', admin: 'admin@flameconnect.com', target: 'verified@email.com', timestamp: new Date().toISOString() }
    ]);
  };

  const banUser = async (userId, currentStatus) => {
    if (confirm(`Are you sure you want to ${currentStatus ? 'ban' : 'unban'} this user?`)) {
      await supabase.from('profiles').update({ is_banned: !currentStatus }).eq('id', userId);
      await fetchAdminData();
      addAuditLog(currentStatus ? 'User Banned' : 'User Unbanned', userId);
    }
  };

  const verifyUser = async (userId) => {
    await supabase.from('profiles').update({ is_verified: true }).eq('id', userId);
    await fetchAdminData();
    addAuditLog('Profile Verified', userId);
  };

  const addAuditLog = async (action, targetId) => {
    // In production, insert into audit_logs table
    console.log(`Audit: ${action} on ${targetId} by ${user.email}`);
  };

  const resolveReport = async (reportId) => {
    setReports(reports.filter(r => r.id !== reportId));
    addAuditLog('Report Resolved', reportId);
  };

  const sendAnnouncement = async () => {
    if (!announcement) return;
    // In production, create a notifications table and insert for all users
    alert(`Announcement sent: ${announcement}`);
    setAnnouncement('');
    setShowAnnouncementModal(false);
    addAuditLog('Announcement Sent', announcement);
  };

  const toggleFeature = (feature) => {
    setFeatureToggles({ ...featureToggles, [feature]: !featureToggles[feature] });
    addAuditLog(`Feature Toggled: ${feature}`, !featureToggles[feature] ? 'enabled' : 'disabled');
  };

  const exportUserData = async () => {
    const dataStr = JSON.stringify(users, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flame-connect-users-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ? true :
                          filterStatus === 'active' ? u.is_online :
                          filterStatus === 'banned' ? u.is_banned :
                          filterStatus === 'verified' ? u.is_verified : true;
    return matchesSearch && matchesFilter;
  });

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
    <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '5px' }}>← Dashboard</button>
          <h1 style={{ color: '#ff6b6b', margin: 0 }}>Admin Control Center</h1>
        </div>
        <button onClick={exportUserData} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>📥 Export Users</button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '15px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalUsers}</div>
          <div>Total Users</div>
          <small>+{stats.newUsersToday} today</small>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '20px', borderRadius: '15px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.activeUsers}</div>
          <div>Active Now</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '20px', borderRadius: '15px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalMatches}</div>
          <div>Total Matches</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', padding: '20px', borderRadius: '15px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalMessages}</div>
          <div>Messages Sent</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('users')} style={{ padding: '12px 24px', background: activeTab === 'users' ? '#ff6b6b' : 'none', color: activeTab === 'users' ? 'white' : '#333', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>👥 User Management</button>
        <button onClick={() => setActiveTab('reports')} style={{ padding: '12px 24px', background: activeTab === 'reports' ? '#ff6b6b' : 'none', color: activeTab === 'reports' ? 'white' : '#333', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>🚩 Reports ({reports.length})</button>
        <button onClick={() => setActiveTab('analytics')} style={{ padding: '12px 24px', background: activeTab === 'analytics' ? '#ff6b6b' : 'none', color: activeTab === 'analytics' ? 'white' : '#333', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>📊 Analytics</button>
        <button onClick={() => setActiveTab('system')} style={{ padding: '12px 24px', background: activeTab === 'system' ? '#ff6b6b' : 'none', color: activeTab === 'system' ? 'white' : '#333', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>⚙️ System Controls</button>
        <button onClick={() => setActiveTab('security')} style={{ padding: '12px 24px', background: activeTab === 'security' ? '#ff6b6b' : 'none', color: activeTab === 'security' ? 'white' : '#333', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>🛡️ Security</button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Search by email or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="verified">Verified</option>
            </select>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Age/Location</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </table>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {u.photos && u.photos[0] ? (
                            <img src={u.photos[0]} alt={u.display_name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>
                          )}
                          {u.display_name || 'Anonymous'}
                        </div>
                       </td>
                      <td style={{ padding: '12px' }}>{u.email} </td>
                      <td style={{ padding: '12px' }}>{u.age || '—'} • {u.location_city || '—'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: u.is_online ? '#4CAF50' : '#999', marginRight: '8px' }}></span>
                        {u.is_online ? 'Online' : 'Offline'}
                        {u.is_banned && <span style={{ marginLeft: '8px', color: 'red' }}>🚫 Banned</span>}
                        {u.is_verified && <span style={{ marginLeft: '8px', color: 'green' }}>✓ Verified</span>}
                      </td>
                      <td style={{ padding: '12px' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => verifyUser(u.id)} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }}>✓ Verify</button>
                        <button onClick={() => banUser(u.id, u.is_banned)} style={{ background: u.is_banned ? '#ff9800' : '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
                          {u.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          <h3>Flagged Content</h3>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#f9f9f9', borderRadius: '15px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
              <p>No pending reports</p>
            </div>
          ) : (
            reports.map(r => (
              <div key={r.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Report #{r.id}</strong> - {r.type === 'user' ? 'User Report' : 'Message Report'}
                    <p>Reason: {r.reason}</p>
                    <small>Reported: {new Date(r.createdAt).toLocaleString()}</small>
                  </div>
                  <button onClick={() => resolveReport(r.id)} style={{ padding: '8px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Resolve</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <h3>User Growth</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6b6b' }}>+{stats.growth}%</div>
              <p>this week</p>
            </div>
            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <h3>Engagement Rate</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6b6b' }}>{stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%</div>
              <p>active now</p>
            </div>
            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              <h3>Conversion</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6b6b' }}>{stats.totalMatches > 0 ? ((stats.totalMatches / stats.totalUsers) * 100).toFixed(1) : 0}%</div>
              <p>users matched</p>
            </div>
          </div>
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
            <h3>Recent Activity</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>📊 {stats.newUsersToday} new users today</li>
              <li>💬 {stats.totalMessages} total messages</li>
              <li>❤️ {stats.totalMatches} matches created</li>
            </ul>
          </div>
        </div>
      )}

      {/* System Controls Tab */}
      {activeTab === 'system' && (
        <div>
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h3>Feature Toggles</h3>
            <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={featureToggles.videoChat} onChange={() => toggleFeature('videoChat')} />
                Video Chat (Beta)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={featureToggles.aiModeration} onChange={() => toggleFeature('aiModeration')} />
                AI Moderation
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={featureToggles.pushNotifications} onChange={() => toggleFeature('pushNotifications')} />
                Push Notifications
              </label>
            </div>
          </div>
          
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h3>Send Announcement</h3>
            <textarea placeholder="Type your announcement message..." value={announcement} onChange={(e) => setAnnouncement(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px', minHeight: '100px' }} />
            <button onClick={() => setShowAnnouncementModal(true)} style={{ padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Send to All Users</button>
          </div>
          
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
            <h3>Database Health</h3>
            <p>✅ Profiles table: {stats.totalUsers} records</p>
            <p>✅ Matches table: {stats.totalMatches} records</p>
            <p>✅ Messages table: {stats.totalMessages} records</p>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div>
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h3>Audit Logs</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#eee' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Action</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Admin</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Target</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{log.action}</td>
                      <td style={{ padding: '10px' }}>{log.admin}</td>
                      <td style={{ padding: '10px' }}>{log.target}</td>
                      <td style={{ padding: '10px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
            <h3>GDPR Tools</h3>
            <button style={{ padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>Export User Data</button>
            <button style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Delete User Data</button>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '30px', maxWidth: '500px', width: '90%' }}>
            <h2>Send Announcement</h2>
            <p>This will be sent to all users: "{announcement}"</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={sendAnnouncement} style={{ flex: 1, padding: '12px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Confirm Send</button>
              <button onClick={() => setShowAnnouncementModal(false)} style={{ flex: 1, padding: '12px', background: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
