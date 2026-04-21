import React, { useMemo, useState } from 'react';

const relativeTime = (value?: string) => {
  if (!value) return 'recently';
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function Inbox({ matches, chatRequests = [], likedProfiles = [], unreadByUser = {}, onBrowsePeople, onSelectMatch, onOpenRequest, onOpenLikedProfile }) {
  const hasConversations = matches.length > 0;
  const hasRequests = chatRequests.length > 0;
  const hasLikedProfiles = likedProfiles.length > 0;
  const [tab, setTab] = useState<'requests' | 'active' | 'liked'>('active');

  const hasAnything = hasConversations || hasLikedProfiles || hasRequests;
  const tabs = useMemo(
    () => [
      { key: 'requests', label: 'Requests', count: chatRequests.length },
      { key: 'active', label: 'Active', count: matches.length },
      { key: 'liked', label: 'Liked by you', count: likedProfiles.length }
    ],
    [chatRequests.length, matches.length, likedProfiles.length]
  );

  if (!hasAnything) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #e8ebf3', borderRadius: '18px' }}>
        <h2 style={{ marginTop: 0 }}>No conversations yet</h2>
        <p style={{ color: '#646b82' }}>Visit the people tab and send a like to start chatting.</p>
        <button
          onClick={onBrowsePeople}
          style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', marginTop: '12px', fontWeight: 700 }}
        >
          Browse people
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key as any)}
            style={{
              border: tab === item.key ? 'none' : '1px solid #e8ebf3',
              background: tab === item.key ? 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)' : '#fff',
              color: tab === item.key ? '#fff' : '#2c334c',
              borderRadius: '999px',
              padding: '8px 12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {item.label}
            <span style={{ background: '#fff', color: '#e83f5b', borderRadius: '999px', minWidth: '18px', height: '18px', padding: '0 5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {tab === 'requests' && hasRequests && (
        <>
          {chatRequests.map((request) => (
            <button
              key={`request-${request.match_id || request.id}`}
              type="button"
              onClick={() => onOpenRequest(request)}
              style={{
                width: '100%',
                textAlign: 'left',
                border: '1px solid #ffe0e5',
                borderRadius: '14px',
                padding: '14px',
                background: '#fff8f9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <strong>{request.display_name || request.email?.split('@')[0]}</strong>
                <p style={{ margin: '4px 0 0', color: '#687089', fontSize: '14px' }}>Wants to chat - {relativeTime(request.requested_at)}</p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e83f5b' }}>Open</span>
            </button>
          ))}
        </>
      )}

      {tab === 'active' && hasConversations && (
        <>
          {matches.map((match) => (
            <button
              key={match.match_id || `${match.id}-${match.email || 'user'}`}
              type="button"
              onClick={() => onSelectMatch(match)}
              style={{
                width: '100%',
                textAlign: 'left',
                border: '1px solid #e8ebf3',
                borderRadius: '14px',
                padding: '14px',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700
                }}
              >
                {(match.display_name || match.email?.split('@')[0] || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <strong>{match.display_name || match.email?.split('@')[0]}</strong>
                <p style={{ margin: '4px 0 0', color: '#687089', fontSize: '14px' }}>
                  {match.age} years - {match.location_city || 'Anywhere'} - {relativeTime(match.matched_at)}
                </p>
              </div>
              {(unreadByUser[match.id] || 0) > 0 && (
                <span style={{ background: '#e83f5b', color: '#fff', borderRadius: '999px', minWidth: '22px', height: '22px', padding: '0 7px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                  {unreadByUser[match.id] > 99 ? '99+' : unreadByUser[match.id]}
                </span>
              )}
            </button>
          ))}
        </>
      )}

      {tab === 'liked' && hasLikedProfiles && (
        <>
          {likedProfiles.map((profile) => (
            <button
              key={`liked-${profile.id}`}
              type="button"
              onClick={() => onOpenLikedProfile(profile)}
              style={{
                width: '100%',
                textAlign: 'left',
                border: '1px solid #ffe0e5',
                borderRadius: '14px',
                padding: '14px',
                background: '#fff5f7',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '999px',
                    background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700
                  }}
                >
                  {(profile.display_name || profile.email?.split('@')[0] || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <strong>{profile.display_name || profile.email?.split('@')[0]}</strong>
                  <p style={{ margin: '4px 0 0', color: '#687089', fontSize: '14px' }}>
                    {profile.age} years - {profile.location_city || 'Anywhere'} - liked {relativeTime(profile.liked_at)}
                  </p>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e83f5b' }}>{profile.is_online ? 'Online' : 'Open chat'}</span>
            </button>
          ))}
        </>
      )}

      {tab === 'requests' && !hasRequests && <div style={{ border: '1px solid #e8ebf3', borderRadius: '14px', background: '#fff', padding: '20px', color: '#6f7792' }}>No chat requests yet.</div>}
      {tab === 'active' && !hasConversations && <div style={{ border: '1px solid #e8ebf3', borderRadius: '14px', background: '#fff', padding: '20px', color: '#6f7792' }}>No active chats yet.</div>}
      {tab === 'liked' && !hasLikedProfiles && <div style={{ border: '1px solid #e8ebf3', borderRadius: '14px', background: '#fff', padding: '20px', color: '#6f7792' }}>No liked profiles yet.</div>}
    </div>
  );
}
