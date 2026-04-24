import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, LockKeyhole, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'FSAD@QUIZ') {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Access Denied: Invalid Security Key');
    }
  };

  return (
    <div className="container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      marginTop: '1rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="glass-card" 
        style={{ 
          padding: '3.5rem 2.5rem', 
          width: '100%', 
          maxWidth: '450px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background element */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'var(--primary)',
          opacity: 0.05,
          borderRadius: '50%',
          zIndex: 0
        }} />

        <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-2) 100%)', 
            width: '70px', 
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '1.25rem', 
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)'
          }}>
            <ShieldCheck size={36} color="white" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            System Gateway
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Restricted access for authorized personnel only
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Security Key
              </label>
              <LockKeyhole size={14} color="var(--text-muted)" />
            </div>
            <input 
              required
              type="password" 
              placeholder="Enter system password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              style={{ 
                padding: '1.1rem', 
                borderRadius: '1rem', 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                color: 'var(--text-main)', 
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ 
                color: '#ef4444', 
                fontSize: '0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem',
                background: 'rgba(239, 68, 68, 0.05)',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(239, 68, 68, 0.1)'
              }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="btn btn-primary" 
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', 
              padding: '1.1rem', 
              justifyContent: 'center',
              borderRadius: '1rem',
              marginTop: '0.5rem',
              boxShadow: isHovered ? '0 15px 30px -10px rgba(79, 70, 229, 0.5)' : '0 10px 15px -5px rgba(79, 70, 229, 0.3)'
            }}
          >
            Authorize Access
            <ArrowRight size={20} style={{ transform: isHovered ? 'translateX(5px)' : 'none', transition: 'transform 0.3s' }} />
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Multiple failed attempts will trigger a security lockout.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
