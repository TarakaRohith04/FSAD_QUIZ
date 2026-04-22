import { Link } from 'react-router-dom';
import { PencilLine } from 'lucide-react';

const Navbar = () => {
  return (
    <nav style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      zIndex: 1000
    }}>
      <div className="glass-card" style={{ 
        padding: '0.8rem 4rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'var(--primary)', padding: '0.4rem', borderRadius: '0.6rem', display: 'flex' }}>
            <PencilLine size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: '700', letterSpacing: '-0.02em' }}>QuizPortal</span>
        </Link>

        {/* Navigation Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/" className="btn btn-outline" style={{ 
            padding: '0.5rem 1.25rem', 
            fontSize: '0.9rem', 
            borderRadius: '1rem',
            border: 'none',
            background: 'transparent'
          }}>
            Home
          </Link>
          <Link to="/admin" className="btn btn-primary" style={{ 
            padding: '0.5rem 1.75rem', 
            fontSize: '0.9rem', 
            borderRadius: '1rem',
            boxShadow: '0 4px 15px -5px var(--primary)'
          }}>
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
