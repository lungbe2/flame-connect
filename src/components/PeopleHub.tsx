import React, { useMemo } from 'react';
import PeopleGrid from './PeopleGrid';

const firstName = (user: any) => (user?.display_name || user?.email?.split('@')[0] || 'User').split(' ')[0];
const photoOf = (user: any) => (Array.isArray(user?.photos) && user.photos.length > 0 ? user.photos[0] : '');

export default function PeopleHub({ users, matches = [], chatRequests = [], onOpenChat, onLike, onSelectProfile }) {
  const stripUsers = useMemo(() => {
    const source = [...users, ...matches, ...chatRequests];
    const seen = new Set<string>();
    const deduped: any[] = [];
    source.forEach((entry) => {
      if (!entry?.id || seen.has(entry.id)) return;
      seen.add(entry.id);
      deduped.push(entry);
    });
    return deduped.slice(0, 16);
  }, [users, matches, chatRequests]);

  return (
    <div className="people-hub">
      <section className="people-hub-strip">
        {stripUsers.map((entry) => (
          <button key={`strip-${entry.id}`} type="button" className="people-hub-strip-item" onClick={() => onOpenChat(entry)}>
            {photoOf(entry) ? (
              <img src={photoOf(entry)} alt={firstName(entry)} />
            ) : (
              <div className="people-hub-avatar-fallback">{firstName(entry).charAt(0).toUpperCase()}</div>
            )}
            <span>{firstName(entry)}</span>
          </button>
        ))}
      </section>

      <section className="people-hub-layout">
        <main className="people-hub-main">
          <PeopleGrid users={users} onLike={onLike} onSelectProfile={onSelectProfile} />
        </main>

        <aside className="people-hub-right">
          <div className="people-hub-panel">
            <div className="people-hub-panel-head">
              <h3>My Contacts</h3>
              <span>{matches.length}</span>
            </div>
            <div className="people-hub-panel-list">
              {matches.slice(0, 6).map((entry) => (
                <button key={`contact-${entry.match_id || entry.id}`} type="button" className="people-hub-contact" onClick={() => onOpenChat(entry)}>
                  {photoOf(entry) ? (
                    <img src={photoOf(entry)} alt={firstName(entry)} />
                  ) : (
                    <div className="people-hub-contact-fallback">{firstName(entry).charAt(0).toUpperCase()}</div>
                  )}
                  <div>
                    <strong>{firstName(entry)}</strong>
                    <span>{entry?.is_online ? 'Online now' : 'Open chat'}</span>
                  </div>
                </button>
              ))}
              {matches.length === 0 && <p className="people-hub-empty">No contacts yet.</p>}
            </div>
          </div>

          <div className="people-hub-panel">
            <div className="people-hub-panel-head">
              <h3>Chat Requests</h3>
              <span>{chatRequests.length}</span>
            </div>
            <div className="people-hub-panel-list">
              {chatRequests.slice(0, 6).map((entry) => (
                <button key={`request-${entry.match_id || entry.id}`} type="button" className="people-hub-contact" onClick={() => onOpenChat(entry)}>
                  {photoOf(entry) ? (
                    <img src={photoOf(entry)} alt={firstName(entry)} />
                  ) : (
                    <div className="people-hub-contact-fallback">{firstName(entry).charAt(0).toUpperCase()}</div>
                  )}
                  <div>
                    <strong>{firstName(entry)}</strong>
                    <span>Wants to chat</span>
                  </div>
                </button>
              ))}
              {chatRequests.length === 0 && <p className="people-hub-empty">No new requests.</p>}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
