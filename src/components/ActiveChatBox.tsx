import React from 'react';

type ActiveChatBoxProps = {
  onlineUsers: any[];
  chatRequests: any[];
  ongoingChats: any[];
  onOpenChat: (user: any) => void;
};

const UserRow = ({ user, onOpenChat, label }: { user: any; onOpenChat: (user: any) => void; label?: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      padding: '10px',
      border: '1px solid #edf0f6',
      borderRadius: '12px',
      background: '#fff'
    }}
  >
    <div style={{ minWidth: 0 }}>
      <div style={{ fontWeight: 700, color: '#20253a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {user.display_name || user.email?.split('@')[0] || 'Unknown'}
      </div>
      <div style={{ fontSize: '12px', color: '#6d7489' }}>
        {label || (user.is_online ? 'Online now' : 'Recently active')}
      </div>
    </div>
    <button
      onClick={() => onOpenChat(user)}
      style={{
        border: 'none',
        borderRadius: '999px',
        padding: '8px 12px',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)',
        color: '#fff',
        fontWeight: 700
      }}
    >
      Chat
    </button>
  </div>
);

export default function ActiveChatBox({ onlineUsers, chatRequests, ongoingChats, onOpenChat }: ActiveChatBoxProps) {
  return (
    <aside
      style={{
        position: 'sticky',
        top: '14px',
        alignSelf: 'start',
        border: '1px solid #e8ebf3',
        borderRadius: '16px',
        background: '#fff',
        padding: '12px',
        display: 'grid',
        gap: '12px'
      }}
    >
      <div>
        <h3 style={{ margin: '2px 0 8px', color: '#1f2230' }}>Active Chat</h3>
        <p style={{ margin: 0, color: '#6d7489', fontSize: '13px' }}>Start chats instantly with users online now.</p>
      </div>

      <section style={{ display: 'grid', gap: '8px' }}>
        <div style={{ fontSize: '12px', color: '#7c8399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Online Users</div>
        {onlineUsers.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#8188a0' }}>No one is online right now.</div>
        ) : (
          onlineUsers.slice(0, 6).map((user) => <UserRow key={user.id} user={user} onOpenChat={onOpenChat} />)
        )}
      </section>

      <section style={{ display: 'grid', gap: '8px' }}>
        <div style={{ fontSize: '12px', color: '#7c8399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chat Requests</div>
        {chatRequests.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#8188a0' }}>No chat requests.</div>
        ) : (
          chatRequests.slice(0, 4).map((user) => <UserRow key={user.id} user={user} onOpenChat={onOpenChat} label="Sent you a request" />)
        )}
      </section>

      <section style={{ display: 'grid', gap: '8px' }}>
        <div style={{ fontSize: '12px', color: '#7c8399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ongoing Chats</div>
        {ongoingChats.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#8188a0' }}>No active conversations yet.</div>
        ) : (
          ongoingChats.slice(0, 6).map((user) => <UserRow key={user.id} user={user} onOpenChat={onOpenChat} label="Continue conversation" />)
        )}
      </section>
    </aside>
  );
}
