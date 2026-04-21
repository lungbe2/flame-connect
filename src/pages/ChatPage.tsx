import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ChatPage({ match, currentUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [safetyPrompt, setSafetyPrompt] = useState('');
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

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', match.match_id)
      .order('sent_at', { ascending: true });

    if (data) {
      setMessages(data);

      const unreadFromOther = data
        .filter((msg) => msg.sender_id !== currentUser.id && !msg.read_at)
        .map((msg) => msg.id);

      if (unreadFromOther.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in('id', unreadFromOther);
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
            void supabase
              .from('messages')
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq('id', payload.new.id);
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

  return (
    <div style={{ margin: '0', height: '70vh', display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e8ebf3', borderRadius: '18px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderBottom: '1px solid #ecf0f7', background: '#fbfcff' }}>
        <button onClick={onBack} style={{ padding: '8px 14px', cursor: 'pointer', background: '#fff', border: '1px solid #e2e7f1', color: '#2b3044', borderRadius: '999px' }}>
          Back
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>{match?.display_name || match?.email?.split('@')[0]}</h2>
          <div style={{ fontSize: '12px', color: '#7e859a' }}>{match?.is_online ? 'Online now' : 'Conversation'}</div>
        </div>
        <button
          type="button"
          onClick={reportUser}
          style={{ marginLeft: 'auto', border: '1px solid #f0c8cf', background: '#fff5f7', color: '#d93e5b', borderRadius: '999px', padding: '7px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
        >
          Report
        </button>
      </div>

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
                  {message.sender_id === currentUser.id && (message.read_at ? ' • Read' : message.delivered_at ? ' • Delivered' : '')}
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '12px 14px', border: '1px solid #dfe4ef', borderRadius: '999px', background: '#f8f9fd' }}
          />
          <label style={{ padding: '12px 14px', border: '1px solid #dfe4ef', borderRadius: '999px', background: '#f8f9fd', cursor: 'pointer', color: '#2b3044' }}>
            Media
            <input
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={(event) => setMediaFile(event.target.files?.[0] || null)}
            />
          </label>
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && !mediaFile)}
            style={{ padding: '12px 18px', background: 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 700 }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
