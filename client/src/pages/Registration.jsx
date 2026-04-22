import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    section: '1'
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const sections = ['1', '2', '3'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.regNo) return;

    const regNum = parseInt(formData.regNo);
    if (isNaN(regNum) || regNum < 2501050001 || regNum > 2501050250) {
      setError('Invalid Registration Number');
      return;
    }

    setLoading(true);
    try {
      // Check if student already attempted the quiz
      const res = await axios.get(`/api/check-registration/${formData.regNo}`);

      if (res.data.exists) {
        setError('A submission already exists for this Registration Number. Only one attempt is allowed.');
        setLoading(false);
        return;
      }

      localStorage.setItem('studentInfo', JSON.stringify(formData));
      navigate('/quiz');
    } catch (err) {
      setError('Connection error. Please ensure the server is running.');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ padding: '2.5rem', width: '100%', maxWidth: '500px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary)', width: 'fit-content', padding: '1rem', borderRadius: '1rem', margin: '0 auto 1.25rem' }}>
            <UserPlus size={32} color="white" />
          </div>
          <h2>Student Registration</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Enter your details to start the exam</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Full Name</label>
            <input
              required
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ padding: '1rem', borderRadius: '0.75rem', background: 'white', border: '1px solid #e2e8f0', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Registration Number</label>
            <input
              required
              type="text"
              placeholder="e.g. 2501050001"
              value={formData.regNo}
              onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
              style={{ padding: '1rem', borderRadius: '0.75rem', background: 'white', border: '1px solid #e2e8f0', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Section</label>

            {/* Custom Dropdown */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                background: 'white',
                border: '1px solid #e2e8f0',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
            >
              <span>Section {formData.section}</span>
              <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                <ChevronDown size={18} />
              </motion.div>
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    zIndex: 100,
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow)'
                  }}
                >
                  {sections.map(sec => (
                    <div
                      key={sec}
                      onClick={() => {
                        setFormData({ ...formData, section: sec });
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: '0.85rem 1rem',
                        cursor: 'pointer',
                        background: formData.section === sec ? 'var(--primary)' : 'transparent',
                        color: formData.section === sec ? 'white' : 'var(--text-main)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (formData.section !== sec) e.target.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (formData.section !== sec) e.target.style.background = 'transparent';
                      }}
                    >
                      Section {sec}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop: '1rem', justifyContent: 'center', padding: '1.1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Processing...' : (
              <>
                Proceed to Quiz
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Registration;
