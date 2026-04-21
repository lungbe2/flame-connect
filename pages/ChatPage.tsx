import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function ChatPage({ match, currentUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', match.match_id)
      .order('sent_at', { ascending: true });
    if (data) setMessages(data);
  };

  const subscribeToMessages = () => {
    subscriptionRef.current = supabase
      .channel(`match-${match.match_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${match.match_id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    await supabase.from('messages').insert({
      match_id: match.match_id,
      sender_id: currentUser.id,
      content: newMessage.trim(),
      is_read: false
    });
    setNewMessage('');
    setSending(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ccc' }}>
        <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '5px' }}>← Back</button>
        <h2 style={{ margin: 0 }}>{match.display_name || match.email?.split('@')[0]}</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', background: '#f9f9f9', borderRadius: '10px', marginBottom: '10px' }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '50px' }}>No messages yet. Say hi! 👋</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
              <div style={{ maxWidth: '70%', padding: '10px 15px', borderRadius: '20px', background: msg.sender_id === currentUser.id ? '#ff6b6b' : '#e0e0e0', color: msg.sender_id === currentUser.id ? 'white' : 'black' }}>
                {msg.content}
                <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>{new Date(msg.sent_at).toLocaleTimeString()}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '25px', fontSize: '16px' }} />
        <button type="submit" disabled={sending || !newMessage.trim()} style={{ padding: '12px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  );
}
