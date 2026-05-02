import React from 'react';

const cardStyle: React.CSSProperties = {
  border: '1px solid #e8ebf3',
  borderRadius: '20px',
  background: '#fff',
  boxShadow: '0 16px 30px rgba(27, 36, 61, 0.08)'
};

export default function HomeDashboard({
  profile,
  matches = [],
  chatRequests = [],
  users = [],
  onOpenInbox,
  onOpenPeople,
  onStartVideoCall,
  onOpenCoaching
}: {
  profile: any;
  matches: any[];
  chatRequests: any[];
  users: any[];
  onOpenInbox: () => void;
  onOpenPeople: () => void;
  onStartVideoCall: (user: any) => void;
  onOpenCoaching: () => void;
}) {
  const profileName = profile?.display_name || 'there';
  const topMatch = matches[0] || chatRequests[0] || null;

  return (
    <div className="home-dashboard">
      <section className="home-dashboard-hero" style={cardStyle}>
        <div className="home-dashboard-hero-copy">
          <div className="home-dashboard-kicker">Welcome back</div>
          <h1>Hi {profileName}, your next spark starts here.</h1>
          <p>
            Browse new people, reply to chats, and jump into private video calls when the conversation feels right.
          </p>
          <div className="home-dashboard-actions">
            <button type="button" className="home-dashboard-primary" onClick={onOpenPeople}>
              Browse people
            </button>
            <button type="button" className="home-dashboard-secondary" onClick={onOpenInbox}>
              Open inbox
            </button>
            {topMatch && (
              <button type="button" className="home-dashboard-secondary" onClick={() => onStartVideoCall(topMatch)}>
                Start video call
              </button>
            )}
          </div>
        </div>
        <div className="home-dashboard-hero-stats">
          <div>
            <span>Active chats</span>
            <strong>{matches.length}</strong>
          </div>
          <div>
            <span>Requests waiting</span>
            <strong>{chatRequests.length}</strong>
          </div>
          <div>
            <span>New people nearby</span>
            <strong>{users.length}</strong>
          </div>
        </div>
      </section>

      <section className="home-dashboard-grid">
        <article style={cardStyle} className="home-dashboard-panel">
          <div className="home-dashboard-panel-head">
            <h3>Video calling</h3>
            <span>Live now</span>
          </div>
          <p>
            Move beyond messaging when you are ready. Private video calls are now available directly from your chats.
          </p>
          {topMatch ? (
            <button type="button" className="home-dashboard-inline-btn" onClick={() => onStartVideoCall(topMatch)}>
              Call {topMatch.display_name || topMatch.email?.split('@')[0] || 'match'}
            </button>
          ) : (
            <div className="home-dashboard-note">Start with a like or chat request and your first call shortcut will appear here.</div>
          )}
        </article>

        <article style={cardStyle} className="home-dashboard-panel">
          <div className="home-dashboard-panel-head">
            <h3>Chat momentum</h3>
            <span>{matches.length + chatRequests.length}</span>
          </div>
          <p>
            {chatRequests.length > 0
              ? `You have ${chatRequests.length} new request${chatRequests.length > 1 ? 's' : ''} waiting for a reply.`
              : matches.length > 0
                ? `You already have ${matches.length} active conversation${matches.length > 1 ? 's' : ''} to keep warm.`
                : 'No conversations yet. Explore profiles and start the first one today.'}
          </p>
          <button type="button" className="home-dashboard-inline-btn" onClick={onOpenInbox}>
            Go to inbox
          </button>
        </article>

        <article style={cardStyle} className="home-dashboard-panel">
          <div className="home-dashboard-panel-head">
            <h3>Discovery</h3>
            <span>{users.length}</span>
          </div>
          <p>
            {users.length > 0
              ? 'Fresh profiles are waiting in People. Browse, like, and match by vibe.'
              : 'There are no new profiles to show right now, but your chats and requests are still active.'}
          </p>
          <button type="button" className="home-dashboard-inline-btn" onClick={onOpenPeople}>
            Open people
          </button>
        </article>

        <article style={cardStyle} className="home-dashboard-panel">
          <div className="home-dashboard-panel-head">
            <h3>VIP coaching</h3>
            <span>By request</span>
          </div>
          <p>
            Need help with profile polish, conversation strategy, or dating confidence? Request support from our qualified coaching team.
          </p>
          <button type="button" className="home-dashboard-inline-btn" onClick={onOpenCoaching}>
            Open coaching page
          </button>
        </article>
      </section>
    </div>
  );
}
