import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function NotificationsPage({ user, onBack, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    // Fetch recent matches
    const { data: matches } = await supabase
      .from('matches')
      .select('*, profiles!matches_user_a_fkey(*), profiles!matches_user_b_fkey(*)')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(30);
    
    const notifs = [];
    if (matches) {
      matches.forEach(m => {
        const otherUser = m.user_a === user.id ? m.profiles_user_b_fkey : m.profiles_user_a_fkey;
        notifs.push({
          id: m.id,
          type: 'match',
          title: 'New Match! 🎉',
          message: `You matched with ${otherUser?.display_name || 'someone'}`,
          image: otherUser?.photos?.[0],
          userId: otherUser?.id,
          created_at: m.created_at,
          read: false
        });
      });
    }
    
    // Fetch recent likes
    const { data: likes } = await supabase
      .from('likes')
      .select('*, profiles!likes_liker_id_fkey(*)')
      .eq('liked_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (likes) {
      likes.forEach(l => {
        notifs.push({
          id: l.id,
          type: 'like',
          title: 'Someone Liked You ❤️',
          message: `${l.profiles?.display_name || 'Someone'} liked your profile`,
          image: l.profiles?.photos?.[0],
          userId: l.liker_id,
          created_at: l.created_at,
          read: false
        });
      });
    }
    
    // Sort by date
    notifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setNotifications(notifs);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    // Update local state
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
        <h1 style={{ margin: 0, color: '#ff6b6b' }}>Notifications</h1>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔔</div>
          <h2>No notifications yet</h2>
          <p>When someone likes you or matches with you, you'll see it here!</p>
        </div>
      ) : (
        notifications.map(notif => (
          <div 
            key={notif.id} 
            onClick={() => {
              markAsRead(notif.id);
              if (notif.type === 'match' && notif.userId) {
                onNavigate('chat', notif.userId);
              }
            }}
            style={{ 
              display: 'flex', 
              gap: '15px', 
              padding: '15px', 
              marginBottom: '10px', 
              background: notif.read ? 'white' : '#fef9f9',
              borderRadius: '15px',
              cursor: 'pointer',
              border: '1px solid #eee',
              transition: 'transform 0.2s'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f0f0f0', overflow: 'hidden' }}>
              {notif.image ? (
                <img src={notif.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📷</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>{notif.title}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>{notif.message}</p>
              <small style={{ color: '#999' }}>{new Date(notif.created_at).toLocaleDateString()}</small>
            </div>
            {!notif.read && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff6b6b', marginTop: '5px' }}></div>}
          </div>
        ))
      )}
    </div>
  );
}
