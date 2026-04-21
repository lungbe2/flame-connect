import { useState } from 'react'

export default function ChatSidebar({ 
  contacts, 
  chatRequests, 
  selectedContactId, 
  onSelectContact,
  onAcceptRequest,
  currentUserId 
}) {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter out self and remove duplicates
  const uniqueContacts = contacts.filter((contact, index, self) => 
    contact.id !== currentUserId && 
    index === self.findIndex(c => c.id === contact.id)
  )
  
  const uniqueRequests = chatRequests.filter((request, index, self) => 
    request.id !== currentUserId && 
    index === self.findIndex(r => r.id === request.id)
  )
  
  const filteredContacts = uniqueContacts.filter(c => 
    c.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredRequests = uniqueRequests.filter(r => 
    r.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div style={{
      width: '320px',
      borderRight: '1px solid #eee',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Header with Contact Count */}
      <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
        <h3 style={{ margin: 0 }}>My Contacts</h3>
        <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>{uniqueContacts.length} contacts</p>
      </div>
      
      {/* Search Box */}
      <div style={{ padding: '15px' }}>
        <input
          type="text"
          placeholder="🔍 Search contact"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '25px',
            outline: 'none',
            fontSize: '14px'
          }}
        />
      </div>
      
      {/* Chat Requests Section */}
      {filteredRequests.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ padding: '8px 15px', background: '#fef9f9', fontWeight: 'bold', fontSize: '12px', color: '#ff6b6b' }}>
            CHAT REQUESTS ({filteredRequests.length})
          </div>
          {filteredRequests.map(request => (
            <div
              key={request.id}
              style={{
                padding: '12px 15px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                background: '#fff9f9'
              }}
              onClick={() => onAcceptRequest(request)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {request.photos && request.photos.length > 0 ? (
                  <img src={request.photos[0]} alt="" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{request.display_name || request.email?.split('@')[0]}</div>
                  <div style={{ fontSize: '11px', color: '#ff6b6b' }}>is inviting you to Chat...</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAcceptRequest(request); }}
                  style={{ background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '15px', padding: '5px 12px', fontSize: '11px', cursor: 'pointer' }}
                >
                  START
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Contacts List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '10px 15px', fontWeight: 'bold', fontSize: '12px', color: '#999' }}>
          CONTACTS
        </div>
        {filteredContacts.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            No contacts found
          </div>
        ) : (
          filteredContacts.map(contact => (
            <div
              key={contact.id}
              style={{
                padding: '12px 15px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                background: selectedContactId === contact.id ? '#fef9f9' : 'white',
                transition: 'background 0.2s'
              }}
              onClick={() => onSelectContact(contact)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {contact.photos && contact.photos.length > 0 ? (
                  <img src={contact.photos[0]} alt="" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{contact.display_name || contact.email?.split('@')[0]}</span>
                    <span style={{ fontSize: '10px', color: '#999' }}>{contact.last_message_time || ''}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {contact.last_message || 'No messages yet'}
                  </div>
                  <div style={{ fontSize: '10px', color: contact.is_online ? '#4CAF50' : '#999', marginTop: '2px' }}>
                    {contact.is_online ? '🟢 Online' : '⚫ Offline'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
