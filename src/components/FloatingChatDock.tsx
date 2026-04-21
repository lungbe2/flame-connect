import React, { useMemo, useState } from 'react';

type FloatingChatDockProps = {
  onlineUsers: any[];
  chatRequests: any[];
  ongoingChats: any[];
  onOpenChat: (user: any) => void;
};

type TabKey = 'online' | 'requests' | 'ongoing';

const UserItem = ({ user, subtitle, onOpenChat }: { user: any; subtitle: string; onOpenChat: (user: any) => void }) => (
  <button type="button" onClick={() => onOpenChat(user)} className="floating-chat-user">
    <div className="floating-chat-user-main">
      <div className="floating-chat-user-name">{user.display_name || user.email?.split('@')[0] || 'Unknown'}</div>
      <div className="floating-chat-user-sub">{subtitle}</div>
    </div>
    <span className="floating-chat-user-cta">Open</span>
  </button>
);

export default function FloatingChatDock({ onlineUsers, chatRequests, ongoingChats, onOpenChat }: FloatingChatDockProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [tab, setTab] = useState<TabKey>('online');

  const badgeCount = useMemo(() => chatRequests.length + onlineUsers.length, [chatRequests.length, onlineUsers.length]);

  const tabMeta: Record<TabKey, { label: string; rows: any[]; subtitle: string }> = {
    online: { label: `Online (${onlineUsers.length})`, rows: onlineUsers, subtitle: 'Online now' },
    requests: { label: `Requests (${chatRequests.length})`, rows: chatRequests, subtitle: 'Sent you a request' },
    ongoing: { label: `Chats (${ongoingChats.length})`, rows: ongoingChats, subtitle: 'Continue conversation' }
  };

  const current = tabMeta[tab];
  const visibleRows = useMemo(() => {
    const seen = new Set<string>();
    const deduped: any[] = [];
    current.rows.forEach((user) => {
      const key = user?.match_id || user?.id;
      if (!key || seen.has(String(key))) {
        return;
      }
      seen.add(String(key));
      deduped.push(user);
    });
    return deduped.slice(0, 8);
  }, [current.rows]);

  return (
    <div className={`floating-chat-dock ${collapsed ? 'is-collapsed' : 'is-open'}`}>
      {collapsed ? (
        <button type="button" className="floating-chat-toggle" onClick={() => setCollapsed(false)}>
          <span>Chat</span>
          {badgeCount > 0 && <span className="floating-chat-badge">{badgeCount > 99 ? '99+' : badgeCount}</span>}
        </button>
      ) : (
        <div className="floating-chat-panel">
          <div className="floating-chat-header">
            <div>
              <div className="floating-chat-title">Active Chat</div>
              <div className="floating-chat-subtitle">Quick access to online users and chats</div>
            </div>
            <button type="button" className="floating-chat-close" onClick={() => setCollapsed(true)}>
              Close
            </button>
          </div>

          <div className="floating-chat-tabs">
            {(Object.keys(tabMeta) as TabKey[]).map((key) => (
              <button key={key} type="button" className={`floating-chat-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
                {tabMeta[key].label}
              </button>
            ))}
          </div>

          <div className="floating-chat-list">
            {visibleRows.length === 0 ? (
              <div className="floating-chat-empty">Nothing here yet.</div>
            ) : (
              visibleRows.map((user) => (
                <UserItem key={`${tab}-${user.match_id || user.id}`} user={user} subtitle={current.subtitle} onOpenChat={onOpenChat} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
