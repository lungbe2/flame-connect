export default function Footer() {
  return (
    <footer style={{
      marginTop: '60px',
      paddingTop: '30px',
      paddingBottom: '30px',
      borderTop: '1px solid #eee',
      textAlign: 'center',
      color: '#999',
      background: '#fafafa'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <a href="#" style={{ color: '#999', textDecoration: 'none' }}>About Us</a>
        <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Success Stories</a>
        <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Safety Tips</a>
        <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Terms of Service</a>
        <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Privacy Policy</a>
        <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Contact</a>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        <span style={{ fontSize: '20px', cursor: 'pointer' }}>📘</span>
        <span style={{ fontSize: '20px', cursor: 'pointer' }}>🐦</span>
        <span style={{ fontSize: '20px', cursor: 'pointer' }}>📷</span>
        <span style={{ fontSize: '20px', cursor: 'pointer' }}>🎵</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <span style={{ background: '#e0e0e0', padding: '4px 12px', borderRadius: '20px', fontSize: '11px' }}>🔒 SSL Secure</span>
        <span style={{ background: '#e0e0e0', padding: '4px 12px', borderRadius: '20px', fontSize: '11px' }}>✅ Verified Profiles</span>
        <span style={{ background: '#e0e0e0', padding: '4px 12px', borderRadius: '20px', fontSize: '11px' }}>🛡️ 24/7 Support</span>
      </div>
      <p>&copy; 2024 Flame Connect. All rights reserved.</p>
    </footer>
  )
}
