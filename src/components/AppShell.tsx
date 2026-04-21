import React from 'react';

type NavAction = {
  key: string;
  label: string;
  badge?: number;
  active?: boolean;
  onClick: () => void;
};

type AppShellProps = {
  children: React.ReactNode;
  navActions: NavAction[];
  maxWidth?: string;
  subtitle?: string;
  onBrandClick?: () => void;
};

export default function AppShell({ children, navActions, maxWidth = '1200px', subtitle, onBrandClick }: AppShellProps) {
  return (
    <div className="app-shell-wrap" style={{ maxWidth }}>
      <div
        className="app-shell-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '14px',
          padding: '14px 16px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid #eaedf4',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <button
            type="button"
            onClick={onBrandClick}
            style={{ color: '#e83f5b', margin: 0, fontSize: '24px', fontWeight: 800, border: 'none', background: 'none', padding: 0, cursor: onBrandClick ? 'pointer' : 'default' }}
          >
            Flame Connect
          </button>
          {subtitle && <div style={{ color: '#7c8298', fontSize: '13px', marginTop: '2px' }}>{subtitle}</div>}
        </div>
        <div className="app-shell-top-nav" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {navActions.map((action) => (
            <button
              key={action.key}
              onClick={action.onClick}
              className="app-shell-nav-btn"
              style={{
                background: action.active ? 'linear-gradient(135deg, #e83f5b 0%, #ff6a63 100%)' : '#fff',
                color: action.active ? '#fff' : '#33384b',
                border: action.active ? 'none' : '1px solid #e8ebf3',
                padding: '10px 16px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {action.label}
              {!!action.badge && action.badge > 0 && <span className="app-shell-nav-badge">{action.badge > 99 ? '99+' : action.badge}</span>}
            </button>
          ))}
        </div>
      </div>
      {children}
      <nav className="app-shell-mobile-nav">
        {navActions.map((action) => (
          <button key={`mobile-${action.key}`} type="button" onClick={action.onClick} className={`app-shell-mobile-btn ${action.active ? 'active' : ''}`}>
            <span>{action.label}</span>
            {!!action.badge && action.badge > 0 && <span className="app-shell-mobile-badge">{action.badge > 99 ? '99+' : action.badge}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
