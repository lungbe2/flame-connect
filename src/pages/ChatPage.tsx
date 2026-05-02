import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.4 11.2L19.5 4.4C20.7 3.9 21.9 5.1 21.4 6.3L14.6 22.4C14.1 23.6 12.4 23.5 12.1 22.2L10.7 15L3.6 13.6C2.3 13.3 2.2 11.7 3.4 11.2Z"
        fill="currentColor"
      />
      <path d="M10.7 15L21 4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChatPage({ match, currentUser, onBack, onStartVideoCall }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [safetyPrompt, setSafetyPrompt] = useState('');
  const [showProfileCard, setShowProfileCard] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);
  const contactInfoPattern = /(whatsapp|telegram|snapchat|instagram|@|\b\d{7,}\b|gmail\.com|yahoo\.com|outlook\.com)/i;

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [match?.match_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    if (!match?.match_id) {
      return;
    }

    const { data } = await supabase.from('messages').select('*').eq('match_id', match.match_id).order('sent_at', { ascending: true });

    if (data) {
      setMessages(data);

      const unreadFromOther = data.filter((msg) => msg.sender_id !== currentUser.id && !msg.read_at).map((msg) => msg.id);
      if (unreadFromOther.length > 0) {
        await supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() }).in('id', unreadFromOther);
      }
    }
  };

  const subscribeToMessages = () => {
    if (!match?.match_id) {
      return;
    }

    subscriptionRef.current = supabase
      .channel(`match-${match.match_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${match.match_id}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          if (payload.new.sender_id !== currentUser.id) {
            void supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', payload.new.id);
          }
        }
      )
      .subscribe();
  };

  const reportUser = async () => {
    const reason = window.prompt('Report reason (required):', 'Suspicious behavior');
    if (!reason || !reason.trim()) {
      return;
    }
    const details = window.prompt('Extra details (optional):', '') || '';

    const { error } = await supabase.from('reports').insert({
      reporter_id: currentUser.id,
      reported_user_id: match.id,
      reason: reason.trim(),
      details: details.trim() || null
    });

    if (error) {
      alert(`Unable to submit report: ${error.message}`);
      return;
    }
    alert('Report submitted. Thank you for keeping the community safe.');
  };

  const uploadChatMedia = async (file: File) => {
    const extension = file.name.split('.').pop();
    const filePath = `${currentUser.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const bucket = 'chat-media';

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
      mediaUrl: publicUrl,
      mediaType: file.type.startsWith('video/') ? 'video' : 'image'
    };
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!match?.match_id || sending || (!newMessage.trim() && !mediaFile)) {
      return;
    }

    setSending(true);
    let mediaPayload = { mediaUrl: null, mediaType: null };
    const plainText = newMessage.trim();

    if (contactInfoPattern.test(plainText)) {
      setSafetyPrompt('Safety tip: avoid sharing personal contact details too early. Stay in chat until trust is established.');
    } else {
      setSafetyPrompt('');
    }

    try {
      if (mediaFile) {
        mediaPayload = await uploadChatMedia(mediaFile);
      }

      await supabase.from('messages').insert({
        match_id: match.match_id,
        sender_id: currentUser.id,
        content: plainText || '',
        media_url: mediaPayload.mediaUrl,
        media_type: mediaPayload.mediaType,
        is_read: false,
        delivered_at: new Date().toISOString()
      });

      setNewMessage('');
      setMediaFile(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const profileName = match?.display_name || match?.email?.split('@')[0] || 'User';

  return (
    <div
      style={{
        position: 'relative',
        margin: '0',
        height: '70vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        border: '1px solid #e8ebf3',
        borderRadius: '18px',
        overflow: 'hidden'
      }}
    >
      <div className="chat-page-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderBottom: '1px solid #ecf0f7', background: '#fbfcff' }}>
        <button onClick={onBack} style={{ padding: '8px 14px', cursor: 'pointer', background: '#fff', border: '1px solid #e2e7f1', color: '#2b3044', borderRadius: '999px' }}>
          Back
        </button>
        <button
          type="button"
          className="chat-profile-trigger"
          onClick={() => setShowProfileCard(true)}
          style={{ border: 'none', background: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textAlign: 'left' }}
        >
          {match?.photos?.[0] ? (
            <img src={match.photos[0]} alt={profileName} style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffe2e8' }} />
          ) : (
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)'
              }}
            >
              {profileName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#20263c' }}>{profileName}</h2>
            <div style={{ fontSize: '12px', color: '#7e859a' }}>{match?.is_online ? 'Online now' : 'Conversation'}</div>
          </div>
        </button>
        <button
          type="button"
          onClick={onStartVideoCall}
          style={{
            border: '1px solid #ffd7df',
            background: 'linear-gradient(135deg, #fff2f5 0%, #fff8f8 100%)',
            color: '#d93e5b',
            borderRadius: '999px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          Video call
        </button>
        <button
          type="button"
          onClick={reportUser}
          style={{ marginLeft: 'auto', border: '1px solid #f0c8cf', background: '#fff5f7', color: '#d93e5b', borderRadius: '999px', padding: '7px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
        >
          Report
        </button>
      </div>

      {showProfileCard && (
        <div
          onClick={() => setShowProfileCard(false)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            background: 'rgba(19, 24, 36, 0.46)',
            display: 'grid',
            placeItems: 'center',
            padding: '18px'
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(420px, 100%)',
              background: '#fff',
              borderRadius: '22px',
              border: '1px solid #e8ebf3',
              boxShadow: '0 22px 38px rgba(20, 28, 45, 0.22)',
              overflow: 'hidden'
            }}
          >
            {match?.photos?.[0] ? (
              <img src={match.photos[0]} alt={profileName} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '220px', display: 'grid', placeItems: 'center', background: '#f4f6fb', color: '#8d96ab', fontWeight: 700 }}>
                No photo yet
              </div>
            )}
            <div style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', color: '#1f2437' }}>
                    {profileName}
                    {match?.age ? `, ${match.age}` : ''}
                  </h3>
                  <div style={{ marginTop: '6px', color: '#6e7690', fontSize: '14px' }}>
                    {match?.location_city || match?.location || 'Location not shared'}
                    {typeof match?.distance_km === 'number' ? ` - ${match.distance_km} km away` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileCard(false)}
                  style={{ border: '1px solid #e3e8f2', background: '#fff', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer', color: '#48506a' }}
                >
                  Close
                </button>
              </div>
              <p style={{ margin: '14px 0 0', color: '#566079', lineHeight: 1.65 }}>
                {match?.bio || 'No bio added yet.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', background: '#f8faff' }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8890a5', padding: '30px' }}>No messages yet. Start the conversation.</p>
        ) : (
          messages.map((message, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: message.sender_id === currentUser.id ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
              <div
                style={{
                  maxWidth: '72%',
                  padding: '10px 12px',
                  borderRadius: '14px',
                  borderBottomRightRadius: message.sender_id === currentUser.id ? '6px' : '14px',
                  borderBottomLeftRadius: message.sender_id === currentUser.id ? '14px' : '6px',
                  background: message.sender_id === currentUser.id ? 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)' : '#fff',
                  color: message.sender_id === currentUser.id ? '#fff' : '#2b3044',
                  border: message.sender_id === currentUser.id ? 'none' : '1px solid #e6ebf5'
                }}
              >
                {message.media_url && message.media_type === 'image' && (
                  <img src={message.media_url} alt="Shared media" style={{ width: '100%', maxWidth: '240px', borderRadius: '10px', marginBottom: message.content ? '8px' : 0 }} />
                )}
                {message.media_url && message.media_type === 'video' && (
                  <video src={message.media_url} controls style={{ width: '100%', maxWidth: '240px', borderRadius: '10px', marginBottom: message.content ? '8px' : 0 }} />
                )}
                {message.content && <div style={{ lineHeight: 1.45 }}>{message.content}</div>}
                <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.75 }}>
                  {new Date(message.sent_at).toLocaleTimeString()}
                  {message.sender_id === currentUser.id && (message.read_at ? ' - Read' : message.delivered_at ? ' - Delivered' : '')}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'grid', gap: '8px', padding: '12px', borderTop: '1px solid #ecf0f7', background: '#fff' }}>
        {safetyPrompt && <div style={{ fontSize: '12px', color: '#8a5a00', background: '#fff5db', border: '1px solid #f5ddb0', borderRadius: '10px', padding: '8px 10px' }}>{safetyPrompt}</div>}
        {mediaFile && (
          <div style={{ fontSize: '12px', color: '#5e667c' }}>
            Attached: <strong>{mediaFile.name}</strong>{' '}
            <button type="button" onClick={() => setMediaFile(null)} style={{ border: 'none', background: 'none', color: '#e83f5b', cursor: 'pointer' }}>
              Remove
            </button>
          </div>
        )}
        <div className="chat-composer-row" style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Type a message..."
            className="chat-composer-input"
            style={{ flex: 1, minWidth: 0, padding: '12px 14px', border: '1px solid #dfe4ef', borderRadius: '999px', background: '#f8f9fd' }}
          />
          <label className="chat-composer-media" style={{ padding: '12px 14px', border: '1px solid #dfe4ef', borderRadius: '999px', background: '#f8f9fd', cursor: 'pointer', color: '#2b3044' }}>
            Media
            <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={(event) => setMediaFile(event.target.files?.[0] || null)} />
          </label>
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && !mediaFile)}
            className="chat-composer-send"
            style={{
              padding: '12px 18px',
              minWidth: '56px',
              background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexShrink: 0
            }}
            aria-label={sending ? 'Sending message' : 'Send message'}
          >
            <span className="chat-send-icon">
              <SendIcon />
            </span>
            <span className="chat-send-label">{sending ? '...' : 'Send'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
