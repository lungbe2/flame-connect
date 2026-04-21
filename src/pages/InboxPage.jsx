import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ChatSidebar from '../components/ChatSidebar'

export default function InboxPage({ user, profile, onNavigate }) {
  const [contacts, setContacts] = useState([])
  const [chatRequests, setChatRequests] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const subscriptionRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchContactsAndRequests()
  }, [])

  const fetchContactsAndRequests = async () => {
    setLoading(true)
    
    try {
      // Get all matches where current user is involved
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      
      if (matchesError) {
        console.error('Matches error:', matchesError)
        setLoading(false)
        return
      }
      
      const contactsMap = new Map() // Use Map to avoid duplicates
      const requestsMap = new Map()
      
      // For each match, fetch the other user's profile
      for (const match of (matchesData || [])) {
        const otherUserId = match.user_a === user.id ? match.user_b : match.user_a
        
        // Skip if trying to chat with self
        if (otherUserId === user.id) continue
        
        // Fetch the other user's profile
        const { data: otherUser, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single()
        
        if (profileError || !otherUser) continue
        
        const contactData = { 
          ...otherUser, 
          match_id: match.id,
          status: match.status 
        }
        
        // Get last message for this match
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, sent_at')
          .eq('match_id', match.id)
          .order('sent_at', { ascending: false })
          .limit(1)
        
        if (lastMsg && lastMsg.length > 0) {
          contactData.last_message = lastMsg[0].content
          contactData.last_message_time = new Date(lastMsg[0].sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        
        if (match.status === 'accepted') {
          contactsMap.set(otherUserId, contactData)
        } else if (match.status === 'pending') {
          requestsMap.set(otherUserId, contactData)
        }
      }
      
      setContacts(Array.from(contactsMap.values()))
      setChatRequests(Array.from(requestsMap.values()))
    } catch (err) {
      console.error('Error fetching contacts:', err)
    }
    
    setLoading(false)
  }

  const fetchMessages = async (contact) => {
    // Prevent opening chat with self
    if (contact.id === user.id) {
      console.error('Cannot chat with yourself')
      return
    }
    
    setSelectedContact(contact)
    
    let matchId = contact.match_id
    
    if (!matchId) {
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user_a.eq.${user.id},user_b.eq.${contact.id}),and(user_a.eq.${contact.id},user_b.eq.${user.id})`)
        .maybeSingle()
      
      if (existingMatch) {
        matchId = existingMatch.id
      } else {
        const { data: newMatch } = await supabase
          .from('matches')
          .insert({ user_a: user.id, user_b: contact.id, status: 'pending' })
          .select()
          .single()
        matchId = newMatch.id
        contact.match_id = matchId
      }
    }
    
    // Fetch messages
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('sent_at', { ascending: true })
    
    if (error) {
      console.error('Messages fetch error:', error)
    } else {
      setMessages(data || [])
    }
    
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
        // Only add message if it's not from current user (already shown)
        if (payload.new.sender_id !== user.id) {
          setMessages(prev => [...prev, payload.new])
          scrollToBottom()
        }
      })
      .subscribe()
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !selectedContact) return
    
    // Prevent sending message to self
    if (selectedContact.id === user.id) {
      console.error('Cannot send message to yourself')
      return
    }
    
    setSending(true)
    
    let matchId = selectedContact.match_id
    
    if (!matchId) {
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user_a.eq.${user.id},user_b.eq.${selectedContact.id}),and(user_a.eq.${selectedContact.id},user_b.eq.${user.id})`)
        .maybeSingle()
      
      if (existingMatch) {
        matchId = existingMatch.id
      } else {
        const { data: newMatch } = await supabase
          .from('matches')
          .insert({ user_a: user.id, user_b: selectedContact.id, status: 'pending' })
          .select()
          .single()
        matchId = newMatch.id
        selectedContact.match_id = matchId
      }
    }
    
    const messageContent = newMessage.trim()
    const { error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        content: messageContent,
        is_read: false
      })
    
    if (!error) {
      // Add message to UI immediately
      const tempMessage = {
        id: Date.now(),
        match_id: matchId,
        sender_id: user.id,
        content: messageContent,
        sent_at: new Date().toISOString(),
        is_read: false
      }
      setMessages(prev => [...prev, tempMessage])
      setNewMessage('')
      scrollToBottom()
      
      // Refresh contact list to update last message preview
      fetchContactsAndRequests()
    } else {
      console.error('Send message error:', error)
    }
    setSending(false)
  }

  const acceptChatRequest = async (request) => {
    const { error } = await supabase
      .from('matches')
      .update({ status: 'accepted' })
      .eq('id', request.match_id)
    
    if (!error) {
      // Move from requests to contacts
      setChatRequests(chatRequests.filter(r => r.id !== request.id))
      setContacts([...contacts, { ...request, status: 'accepted' }])
      fetchMessages(request)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar currentView="inbox" onNavigate={onNavigate} user={user} profile={profile} />
        <div style={{ flex: 1, textAlign: 'center', padding: '50px' }}>Loading...</div>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentView="inbox" onNavigate={onNavigate} user={user} profile={profile} />
      
      <div style={{ flex: 1, display: 'flex', height: 'calc(100vh - 140px)', minHeight: '500px' }}>
        {/* Left Sidebar - Contacts and Chat Requests */}
        <ChatSidebar
          contacts={contacts}
          chatRequests={chatRequests}
          selectedContactId={selectedContact?.id}
          onSelectContact={fetchMessages}
          onAcceptRequest={acceptChatRequest}
          currentUserId={user.id}
        />
        
        {/* Right Side - Chat Window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f9f9f9' }}>
          {!selectedContact ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
              <h3>Select a conversation</h3>
              <p>Choose someone from your contacts to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '15px 20px',
                background: 'white',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                {selectedContact.photos && selectedContact.photos.length > 0 ? (
                  <img src={selectedContact.photos[0]} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                )}
                <div>
                  <h3 style={{ margin: 0 }}>{selectedContact.display_name || selectedContact.email?.split('@')[0]}</h3>
                  <span style={{ fontSize: '12px', color: selectedContact.is_online ? '#4CAF50' : '#999' }}>
                    {selectedContact.is_online ? '🟢 Online' : '⚫ Offline'}
                  </span>
                </div>
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
                      key={msg.id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
                        marginBottom: '15px'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '60%',
                          padding: '10px 15px',
                          borderRadius: '20px',
                          background: msg.sender_id === user.id ? '#ff6b6b' : 'white',
                          color: msg.sender_id === user.id ? 'white' : 'black',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                      >
                        {msg.content}
                        <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7, textAlign: 'right' }}>
                          {formatTime(msg.sent_at)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <form onSubmit={sendMessage} style={{
                padding: '15px',
                background: 'white',
                borderTop: '1px solid #eee',
                display: 'flex',
                gap: '10px'
              }}>
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
                    outline: 'none'
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
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
