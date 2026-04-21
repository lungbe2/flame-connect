import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function ChatWindow({ currentUser, otherUser, matchId, onMessageSent }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const subscriptionRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!matchId) return
    
    // Fetch messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('sent_at', { ascending: true })
      setMessages(data || [])
    }
    fetchMessages()
    
    // Subscribe to new messages
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe()
    subscriptionRef.current = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
        onMessageSent?.()
      })
      .subscribe()
    
    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe()
    }
  }, [matchId])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !matchId) return
    
    setSending(true)
    const { error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: currentUser.id,
        content: newMessage.trim(),
        is_read: false
      })
    
    if (!error) {
      setNewMessage('')
      onMessageSent?.()
    }
    setSending(false)
  }

  if (!otherUser) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
          <h3>Select a conversation</h3>
          <p>Choose someone from your contacts to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f9f9f9' }}>
      {/* Chat Header */}
      <div style={{
        padding: '15px 20px',
        background: 'white',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0 }}>{otherUser.display_name || otherUser.email?.split('@')[0]}</h3>
          <span style={{ fontSize: '12px', color: otherUser.is_online ? '#4CAF50' : '#999' }}>
            {otherUser.is_online ? '🟢 Online' : '⚫ Offline'}
          </span>
        </div>
        <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>⋯</button>
      </div>
      
      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
            No messages yet. Say hi! 👋
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start',
                marginBottom: '15px'
              }}
            >
              <div
                style={{
                  maxWidth: '60%',
                  padding: '10px 15px',
                  borderRadius: '20px',
                  background: msg.sender_id === currentUser.id ? '#ff6b6b' : 'white',
                  color: msg.sender_id === currentUser.id ? 'white' : 'black',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {msg.content}
                <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>
                  {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input with Media Buttons */}
      <div style={{ padding: '15px', background: 'white', borderTop: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', justifyContent: 'center' }}>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>📷</button>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>🎥</button>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>🎵</button>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>😊</button>
        </div>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '25px',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            style={{
              padding: '10px 25px',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer'
            }}
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  )
}
