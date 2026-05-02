import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type AdminPageProps = {
  user: any;
  onBack: () => void;
};

type FilterMode = 'all' | 'blocked' | 'premium' | 'non-premium';

export default function AdminPage({ user, onBack }: AdminPageProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [workingUserId, setWorkingUserId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const adminEmail = 'lungbe2@gmail.com';
  const isAdmin = user?.email === adminEmail;
  const requiredPin = (import.meta as any).env?.VITE_ADMIN_PIN || '';

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    const saved = sessionStorage.getItem('admin_unlocked') === 'true';
    if (!requiredPin || saved) {
      setIsUnlocked(true);
    }
  }, [isAdmin, requiredPin]);

  useEffect(() => {
    if (isAdmin && isUnlocked) {
      fetchUsers();
      fetchReports();
    }
  }, [isAdmin, isUnlocked]);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let base = rows;
    if (filterMode === 'blocked') {
      base = base.filter((row) => row.is_blocked);
    } else if (filterMode === 'premium') {
      base = base.filter((row) => row.is_premium);
    } else if (filterMode === 'non-premium') {
      base = base.filter((row) => !row.is_premium);
    }

    if (!needle) {
      return base;
    }

    return base.filter((row) => {
      const name = (row.display_name || '').toLowerCase();
      const email = (row.email || '').toLowerCase();
      const location = (row.location_city || row.location || '').toLowerCase();
      return name.includes(needle) || email.includes(needle) || location.includes(needle);
    });
  }, [rows, query, filterMode]);

  const stats = useMemo(() => {
    const totalUsers = rows.length;
    const blockedUsers = rows.filter((row) => row.is_blocked).length;
    const onlineUsers = rows.filter((row) => row.is_online && !row.is_blocked).length;
    const premiumUsers = rows.filter((row) => row.is_premium).length;
    return { totalUsers, blockedUsers, onlineUsers, premiumUsers };
  }, [rows]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id,email,display_name,age,location_city,location,is_online,is_blocked,blocked_reason,blocked_at,is_premium,premium_until,premium_plan,created_at,last_seen,photos')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  };

  const fetchReports = async () => {
    const { data, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (fetchError) {
      setError(fetchError.message);
      setReports([]);
      return;
    }

    if (!data || data.length === 0) {
      setReports([]);
      return;
    }

    const ids = Array.from(new Set(data.flatMap((row) => [row.reporter_id, row.reported_user_id])));
    const { data: profileRows } = await supabase.from('profiles').select('id,display_name,email').in('id', ids);
    const profileMap = new Map((profileRows || []).map((row) => [row.id, row]));

    const mapped = data.map((row) => ({
      ...row,
      reporter_profile: profileMap.get(row.reporter_id) || null,
      reported_profile: profileMap.get(row.reported_user_id) || null
    }));

    setReports(mapped);
  };

  const updateReportStatus = async (reportId: string, status: 'reviewing' | 'resolved' | 'dismissed') => {
    const resolutionNote =
      status === 'resolved' || status === 'dismissed'
        ? window.prompt('Resolution note (optional):', '') || ''
        : '';

    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status,
        resolution_note: resolutionNote || null
      })
      .eq('id', reportId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await fetchReports();
  };

  const toggleBlock = async (targetUser: any) => {
    if (!targetUser?.id) {
      return;
    }
    setWorkingUserId(targetUser.id);
    setError('');

    const shouldBlock = !targetUser.is_blocked;
    const reason = shouldBlock ? window.prompt('Block reason (optional):', targetUser.blocked_reason || '') || '' : null;

    const { error: rpcError } = await supabase.rpc('admin_set_user_block_status', {
      target_user_id: targetUser.id,
      should_block: shouldBlock,
      reason
    });

    if (rpcError) {
      setError(rpcError.message);
      setWorkingUserId(null);
      return;
    }

    await fetchUsers();
    setWorkingUserId(null);
  };

  const togglePremium = async (targetUser: any) => {
    if (!targetUser?.id) {
      return;
    }

    setWorkingUserId(targetUser.id);
    setError('');

    const shouldEnable = !targetUser.is_premium;
    const plan = shouldEnable ? (window.prompt('Premium plan (monthly/yearly/lifetime):', targetUser.premium_plan || 'monthly') || 'monthly') : null;
    const daysInput = shouldEnable ? window.prompt('Premium duration in days:', '30') || '30' : '0';
    const premiumDays = Number.parseInt(daysInput, 10);

    const { error: rpcError } = await supabase.rpc('admin_set_user_premium_status', {
      target_user_id: targetUser.id,
      should_be_premium: shouldEnable,
      plan,
      premium_days: Number.isFinite(premiumDays) && premiumDays > 0 ? premiumDays : 30
    });

    if (rpcError) {
      setError(rpcError.message);
      setWorkingUserId(null);
      return;
    }

    await fetchUsers();
    setWorkingUserId(null);
  };

  const deleteUser = async (targetUser: any) => {
    if (!targetUser?.id) {
      return;
    }

    const label = targetUser.display_name || targetUser.email || 'this user';
    const confirmation = window.prompt(`Type DELETE to permanently remove ${label} and all related app data.`, '');

    if (confirmation !== 'DELETE') {
      return;
    }

    setWorkingUserId(targetUser.id);
    setError('');

    const { error: rpcError } = await supabase.rpc('admin_delete_user', {
      target_user_id: targetUser.id
    });

    if (rpcError) {
      setError(rpcError.message);
      setWorkingUserId(null);
      return;
    }

    await fetchUsers();
    await fetchReports();
    setWorkingUserId(null);
  };

  const handleUnlock = () => {
    if (!requiredPin) {
      setIsUnlocked(true);
      return;
    }
    if (pin === requiredPin) {
      setIsUnlocked(true);
      sessionStorage.setItem('admin_unlocked', 'true');
      setError('');
      return;
    }
    setError('Invalid admin PIN.');
  };

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <button onClick={onBack} style={{ padding: '12px 30px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>
          Go Back
        </button>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div style={{ maxWidth: '480px', margin: '30px auto', padding: '20px' }}>
        <div style={{ background: '#fff', border: '1px solid #e8ebf3', borderRadius: '14px', padding: '20px' }}>
          <h2 style={{ marginTop: 0 }}>Admin Login</h2>
          <p style={{ color: '#69708a' }}>Enter admin PIN to access moderation tools.</p>
          <input
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="Admin PIN"
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #dfe4ef', marginBottom: '10px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleUnlock} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '999px', background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Unlock
            </button>
            <button onClick={onBack} style={{ padding: '12px 16px', borderRadius: '999px', border: '1px solid #dfe4ef', background: '#fff', cursor: 'pointer' }}>
              Back
            </button>
          </div>
          {error && <p style={{ color: '#d93e5b', marginBottom: 0 }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ padding: '8px 14px', cursor: 'pointer', background: '#fff', border: '1px solid #dfe4ef', borderRadius: '999px' }}>
          Back to Site
        </button>
        <h1 style={{ color: '#ff6b6b', margin: 0 }}>Admin Moderation Dashboard</h1>
        <button
          onClick={async () => {
            await fetchUsers();
            await fetchReports();
          }}
          style={{ padding: '8px 14px', cursor: 'pointer', background: '#fff', border: '1px solid #dfe4ef', borderRadius: '999px' }}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
        <div style={{ background: '#fff', border: '1px solid #e8ebf3', borderRadius: '12px', padding: '14px' }}>
          <div style={{ color: '#7a8198', fontSize: '12px' }}>Total users</div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>{stats.totalUsers}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e8ebf3', borderRadius: '12px', padding: '14px' }}>
          <div style={{ color: '#7a8198', fontSize: '12px' }}>Online users</div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>{stats.onlineUsers}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e8ebf3', borderRadius: '12px', padding: '14px' }}>
          <div style={{ color: '#7a8198', fontSize: '12px' }}>Blocked users</div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>{stats.blockedUsers}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e8ebf3', borderRadius: '12px', padding: '14px' }}>
          <div style={{ color: '#7a8198', fontSize: '12px' }}>Premium users</div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>{stats.premiumUsers}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email, or location"
          style={{ width: '100%', maxWidth: '420px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #dfe4ef', background: '#fff' }}
        />
        <button onClick={() => setFilterMode('all')} style={{ border: '1px solid #dfe4ef', background: filterMode === 'all' ? '#1f2230' : '#fff', color: filterMode === 'all' ? '#fff' : '#2a3045', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer' }}>
          All
        </button>
        <button onClick={() => setFilterMode('blocked')} style={{ border: '1px solid #dfe4ef', background: filterMode === 'blocked' ? '#d93e5b' : '#fff', color: filterMode === 'blocked' ? '#fff' : '#2a3045', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer' }}>
          Blocked
        </button>
        <button onClick={() => setFilterMode('premium')} style={{ border: '1px solid #dfe4ef', background: filterMode === 'premium' ? '#2f9e55' : '#fff', color: filterMode === 'premium' ? '#fff' : '#2a3045', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer' }}>
          Premium
        </button>
        <button onClick={() => setFilterMode('non-premium')} style={{ border: '1px solid #dfe4ef', background: filterMode === 'non-premium' ? '#ff9f1a' : '#fff', color: filterMode === 'non-premium' ? '#fff' : '#2a3045', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer' }}>
          Non-premium
        </button>
      </div>

      {error && <p style={{ color: '#d93e5b' }}>{error}</p>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ background: '#fff', border: '1px solid #e8ebf3', borderRadius: '12px', padding: '12px' }}>
            <h3 style={{ margin: '2px 0 10px' }}>Moderation Queue</h3>
            {reports.length === 0 ? (
              <div style={{ color: '#7c8399', fontSize: '14px' }}>No reports in queue.</div>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                {reports.map((report) => (
                  <div key={report.id} style={{ border: '1px solid #edf0f6', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ fontWeight: 700 }}>
                      {report.reporter_profile?.display_name || report.reporter_profile?.email || report.reporter_id} reported{' '}
                      {report.reported_profile?.display_name || report.reported_profile?.email || report.reported_user_id}
                    </div>
                    <div style={{ fontSize: '13px', color: '#586079', marginTop: '3px' }}>
                      Reason: {report.reason}
                      {report.details ? ` | Details: ${report.details}` : ''}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7c8399', marginTop: '3px' }}>
                      Status: <strong>{report.status}</strong> • {new Date(report.created_at).toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => updateReportStatus(report.id, 'reviewing')} style={{ border: '1px solid #dfe4ef', background: '#fff', borderRadius: '999px', padding: '6px 10px', cursor: 'pointer' }}>
                        Mark Reviewing
                      </button>
                      <button onClick={() => updateReportStatus(report.id, 'resolved')} style={{ border: 'none', background: '#2f9e55', color: '#fff', borderRadius: '999px', padding: '6px 10px', cursor: 'pointer' }}>
                        Resolve
                      </button>
                      <button onClick={() => updateReportStatus(report.id, 'dismissed')} style={{ border: 'none', background: '#7c8399', color: '#fff', borderRadius: '999px', padding: '6px 10px', cursor: 'pointer' }}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #e8ebf3', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fc' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Premium</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Block Reason</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #eef1f6' }}>
                  <td style={{ padding: '12px' }}>
                    <strong>{row.display_name || 'Anonymous'}</strong>
                    <div style={{ color: '#7c8399', fontSize: '12px' }}>{row.age ? `${row.age} years` : 'Age not set'}</div>
                  </td>
                  <td style={{ padding: '12px' }}>{row.email || '-'}</td>
                  <td style={{ padding: '12px' }}>{row.location_city || row.location || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: row.is_blocked ? '#d93e5b' : row.is_online ? '#2f9e55' : '#7c8399', fontWeight: 700 }}>
                      {row.is_blocked ? 'Blocked' : row.is_online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {row.is_premium ? (
                      <span style={{ color: '#2f9e55', fontWeight: 700 }}>
                        Premium {row.premium_plan ? `(${row.premium_plan})` : ''}
                        {row.premium_until ? ` until ${new Date(row.premium_until).toLocaleDateString()}` : ''}
                      </span>
                    ) : (
                      <span style={{ color: '#7c8399' }}>Free</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>{row.blocked_reason || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => toggleBlock(row)}
                        disabled={workingUserId === row.id}
                        style={{
                          border: 'none',
                          borderRadius: '999px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          color: '#fff',
                          fontWeight: 700,
                          background: row.is_blocked ? '#2f9e55' : '#d93e5b'
                        }}
                      >
                        {workingUserId === row.id ? 'Saving...' : row.is_blocked ? 'Unblock' : 'Block'}
                      </button>

                      <button
                        onClick={() => togglePremium(row)}
                        disabled={workingUserId === row.id}
                        style={{
                          border: 'none',
                          borderRadius: '999px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          color: '#fff',
                          fontWeight: 700,
                          background: row.is_premium ? '#ff9f1a' : '#2f9e55'
                        }}
                      >
                        {workingUserId === row.id ? 'Saving...' : row.is_premium ? 'Remove Premium' : 'Make Premium'}
                      </button>

                      <button
                        onClick={() => deleteUser(row)}
                        disabled={workingUserId === row.id}
                        style={{
                          border: 'none',
                          borderRadius: '999px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          color: '#fff',
                          fontWeight: 700,
                          background: '#7f1d1d'
                        }}
                      >
                        {workingUserId === row.id ? 'Deleting...' : 'Delete User'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
