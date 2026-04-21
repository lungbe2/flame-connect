import React, { useEffect, useMemo, useState } from 'react';
import { formatMoodWithEmoji } from '../config/mood';

export default function PeopleGrid({ users, onLike, onSelectProfile }) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth <= 768);
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  const visibleUsers = useMemo(() => users.filter((entry) => !dismissedIds.has(entry.id)), [users, dismissedIds]);
  const mobileUser = isMobile ? visibleUsers[0] : null;

  const markSeen = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setSwipeX(0);
    setTouchStartX(null);
  };

  const handlePass = (id: string) => {
    markSeen(id);
  };

  const handleLike = (id: string) => {
    markSeen(id);
    onLike(id);
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!mobileUser) return;
    setTouchStartX(event.touches[0].clientX);
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    setSwipeX(event.touches[0].clientX - touchStartX);
  };

  const onTouchEnd = () => {
    if (!mobileUser) return;
    if (swipeX > 70) {
      handleLike(mobileUser.id);
    } else if (swipeX < -70) {
      handlePass(mobileUser.id);
    } else {
      setSwipeX(0);
      setTouchStartX(null);
    }
  };

  if (visibleUsers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', border: '1px solid #e8ebf3', borderRadius: '18px', background: '#fff' }}>
        <h2 style={{ marginTop: 0 }}>No matches to show yet</h2>
        <p style={{ color: '#636b82' }}>Complete your profile details and check back in a few minutes.</p>
      </div>
    );
  }

  if (isMobile && mobileUser) {
    return (
      <div className="people-mobile-wrap">
        <div
          className="people-mobile-card"
          onClick={() => onSelectProfile(mobileUser)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ transform: `translateX(${swipeX}px) rotate(${swipeX * 0.02}deg)` }}
        >
          {mobileUser.photos && mobileUser.photos.length > 0 ? (
            <div style={{ position: 'relative' }}>
              <img src={mobileUser.photos[0]} alt={mobileUser.display_name} style={{ width: '100%', height: '380px', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '90px', background: 'linear-gradient(0deg, rgba(0,0,0,0.58) 10%, rgba(0,0,0,0) 100%)' }} />
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(31,34,48,0.78)', color: '#fff', fontSize: '12px', borderRadius: '999px', padding: '6px 10px' }}>
                {mobileUser.is_online ? 'Online now' : 'Offline'}
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '380px', background: '#f3f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8f94a8' }}>
              No photo yet
            </div>
          )}
          <div style={{ padding: '14px 14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>
                {mobileUser.display_name || mobileUser.email?.split('@')[0]}, {mobileUser.age || '?'}
              </h3>
              <span style={{ width: '10px', height: '10px', borderRadius: '999px', background: mobileUser.is_online ? '#3db46d' : '#afb5c5', flexShrink: 0 }} />
            </div>
            <p style={{ color: '#6b7085', fontSize: '14px', margin: '8px 0' }}>
              {mobileUser.location_city || mobileUser.location || 'Unknown location'}
              {typeof mobileUser.distance_km === 'number' ? ` - ${mobileUser.distance_km} km away` : ''}
            </p>
            <p style={{ fontSize: '13px', color: '#5e667c', minHeight: '38px', margin: 0 }}>{(mobileUser.bio || 'Open to meeting new people').slice(0, 112)}</p>
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '999px', background: '#fff1f4', color: '#e83f5b', fontWeight: 600 }}>{formatMoodWithEmoji(mobileUser.mood)}</span>
              <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '999px', background: '#f3f5fa', color: '#4d546d', fontWeight: 600 }}>
                {mobileUser.last_seen ? `Active ${new Date(mobileUser.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Active recently'}
              </span>
            </div>
          </div>
        </div>
        <div className="people-mobile-actions">
          <button
            type="button"
            className="people-mobile-btn pass"
            onClick={() => handlePass(mobileUser.id)}
          >
            Pass
          </button>
          <button
            type="button"
            className="people-mobile-btn like"
            onClick={() => handleLike(mobileUser.id)}
          >
            Like
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
      {visibleUsers.map((user) => (
        <div
          key={user.id}
          onClick={() => onSelectProfile(user)}
          style={{
            cursor: 'pointer',
            background: '#fff',
            borderRadius: '18px',
            overflow: 'hidden',
            border: '1px solid #e8ebf3',
            boxShadow: '0 10px 20px rgba(30, 40, 70, 0.06)'
          }}
        >
          {user.photos && user.photos.length > 0 ? (
            <div style={{ position: 'relative' }}>
              <img src={user.photos[0]} alt={user.display_name} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '90px', background: 'linear-gradient(0deg, rgba(0,0,0,0.58) 10%, rgba(0,0,0,0) 100%)' }} />
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(31,34,48,0.78)', color: '#fff', fontSize: '12px', borderRadius: '999px', padding: '6px 10px' }}>
                {user.is_online ? 'Online now' : 'Offline'}
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '280px', background: '#f3f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8f94a8' }}>
              No photo yet
            </div>
          )}

          <div style={{ padding: '14px 14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '19px' }}>
                {user.display_name || user.email?.split('@')[0]}, {user.age || '?'}
              </h3>
              <span style={{ width: '10px', height: '10px', borderRadius: '999px', background: user.is_online ? '#3db46d' : '#afb5c5', flexShrink: 0 }} />
            </div>
            <p style={{ color: '#6b7085', fontSize: '14px', margin: '8px 0' }}>
              {user.location_city || user.location || 'Unknown location'}
              {typeof user.distance_km === 'number' ? ` - ${user.distance_km} km away` : ''}
            </p>
            <p style={{ fontSize: '13px', color: '#5e667c', minHeight: '38px', margin: 0 }}>{(user.bio || 'Open to meeting new people').slice(0, 88)}</p>
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '999px', background: '#fff1f4', color: '#e83f5b', fontWeight: 600 }}>{formatMoodWithEmoji(user.mood)}</span>
              <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '999px', background: '#f3f5fa', color: '#4d546d', fontWeight: 600 }}>
                {user.last_seen ? `Active ${new Date(user.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Active recently'}
              </span>
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleLike(user.id);
              }}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '12px',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                color: '#fff',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)'
              }}
            >
              Send Like
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
