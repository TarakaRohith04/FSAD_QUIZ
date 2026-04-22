import { Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ marginTop: 'auto', width: '100%' }}>
      <div className="glass-card" style={{
        padding: '0.75rem 4rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          © 2026 QuizPortal. All rights reserved.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Designed by:</span>
            <a
              href="https://www.linkedin.com/in/gurram-taraka-rohith-14b034256/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.8'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Taraka Rohith
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
