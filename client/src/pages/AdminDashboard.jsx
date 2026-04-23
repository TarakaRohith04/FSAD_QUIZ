import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users, BookOpen, LogOut, ChevronRight, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = '/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Unit-1');
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]); // Store questions for matching details
  const [participants, setParticipants] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    unit: 1,
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) {
      navigate('/admin');
    }
    fetchData();
    fetchAllQuestions(); // Pre-fetch for details matching
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab.startsWith('Unit-')) {
        const unit = parseInt(activeTab.split('-')[1]);
        const res = await axios.get(`${API_BASE}/admin-questions/${unit}`);
        setQuestions(res.data);
      } else if (activeTab === 'Participants') {
        const res = await axios.get(`${API_BASE}/participants`);
        setParticipants(res.data);
      }
    } catch (err) {
      console.error('Fetch Data Error:', err);
    }
  };

  const fetchAllQuestions = async () => {
    try {
      // Fetch from all 4 units
      const [u1, u2, u3, u4] = await Promise.all([
        axios.get(`${API_BASE}/admin-questions/1`),
        axios.get(`${API_BASE}/admin-questions/2`),
        axios.get(`${API_BASE}/admin-questions/3`),
        axios.get(`${API_BASE}/admin-questions/4`)
      ]);
      setAllQuestions([...u1.data, ...u2.data, ...u3.data, ...u4.data]);
    } catch (err) {
      console.error('Fetch All Questions Error:', err);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const unit = parseInt(activeTab.split('-')[1]);
      await axios.post(`${API_BASE}/questions`, { ...newQuestion, unit });
      setShowAddForm(false);
      setNewQuestion({ unit: 1, questionText: '', options: ['', '', '', ''], correctAnswer: 0 });
      fetchData();
      fetchAllQuestions();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Unknown error occurred";
      alert("Error adding question: " + errorMsg);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Delete this question?")) {
      try {
        await axios.delete(`${API_BASE}/questions/${id}`);
        fetchData();
        fetchAllQuestions();
      } catch (err) {
        alert("Error deleting question");
      }
    }
  };

  const handleDeleteParticipant = async (id) => {
    if (window.confirm("Permanently delete this participant's record?")) {
      try {
        await axios.delete(`${API_BASE}/participants/${id}`);
        fetchData();
      } catch (err) {
        alert("Error deleting participant record");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('isAdmin');
    // Using window.location for a hard reset to the Home Page to prevent state issues
    window.location.href = '/';
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage questions and track student performance</p>
        </div>
        <div className="glass-card" style={{ display: 'flex', padding: '0.5rem' }}>
          {['Unit-1', 'Unit-2', 'Unit-3', 'Unit-4', 'Participants'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowAddForm(false);
              }}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: activeTab === tab ? 'var(--primary)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              {tab === 'Participants' ? <Users size={18} style={{ marginRight: '0.5rem' }} /> : <BookOpen size={18} style={{ marginRight: '0.5rem' }} />}
              {tab}
            </button>
          ))}
          <button onClick={logout} style={{ padding: '0.75rem 1.25rem', color: '#f43f5e', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab.startsWith('Unit-') ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem' }}>{activeTab} Questions</h2>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)} 
                  className="btn btn-primary"
                  style={{ background: showAddForm ? '#f43f5e' : 'var(--primary)' }}
                >
                  {showAddForm ? 'Close Form' : <><Plus size={20} /> Add New Question</>}
                </button>
              </div>

              {showAddForm && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  className="glass-card" 
                  style={{ padding: '2.5rem', marginBottom: '4rem', overflow: 'visible', border: '1px solid rgba(99, 102, 241, 0.3)' }}
                >
                  <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1rem' }}>Question Statement</label>
                      <textarea
                        required
                        placeholder="Type your question here..."
                        value={newQuestion.questionText}
                        onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                        style={{ 
                          padding: '1.25rem', 
                          borderRadius: '1rem', 
                          background: '#f8fafc', 
                          border: '1px solid #e2e8f0', 
                          color: 'var(--text-main)', 
                          minHeight: '120px',
                          fontSize: '1rem',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--primary)';
                          e.target.style.background = 'white';
                          e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.background = '#f8fafc';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                      {newQuestion.options.map((opt, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <label style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Option {String.fromCharCode(65 + idx)}
                          </label>
                          <input
                            required
                            type="text"
                            placeholder={`Enter answer for Option ${String.fromCharCode(65 + idx)}`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...newQuestion.options];
                              newOpts[idx] = e.target.value;
                              setNewQuestion({...newQuestion, options: newOpts});
                            }}
                            style={{ 
                              padding: '1rem', 
                              borderRadius: '0.75rem', 
                              background: 'white', 
                              border: '1px solid #e2e8f0', 
                              color: 'var(--text-main)',
                              fontSize: '1rem',
                              outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                          />
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', maxWidth: '400px' }}>
                      <label style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1rem' }}>Select Correct Answer</label>
                      
                      {/* Custom Admin Dropdown */}
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
                          fontSize: '1rem'
                        }}
                      >
                        <span>Option {String.fromCharCode(65 + newQuestion.correctAnswer)}</span>
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
                              borderRadius: '1rem', 
                              zIndex: 100, 
                              overflow: 'hidden',
                              boxShadow: '0 15px 30px -10px rgba(0,0,0,0.1)'
                            }}
                          >
                            {newQuestion.options.map((_, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => {
                                  setNewQuestion({...newQuestion, correctAnswer: idx});
                                  setIsDropdownOpen(false);
                                }}
                                style={{ 
                                  padding: '1rem', 
                                  cursor: 'pointer', 
                                  background: newQuestion.correctAnswer === idx ? 'var(--primary)' : 'transparent',
                                  color: newQuestion.correctAnswer === idx ? 'white' : 'var(--text-main)',
                                  transition: 'all 0.2s ease',
                                  fontWeight: newQuestion.correctAnswer === idx ? '600' : '400'
                                }}
                                onMouseEnter={(e) => {
                                  if (newQuestion.correctAnswer !== idx) {
                                    e.target.style.background = '#f1f5f9';
                                    e.target.style.paddingLeft = '1.25rem';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (newQuestion.correctAnswer !== idx) {
                                    e.target.style.background = 'transparent';
                                    e.target.style.paddingLeft = '1rem';
                                  }
                                }}
                              >
                                Option {String.fromCharCode(65 + idx)}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '1.25rem 3rem', fontSize: '1.1rem' }}>
                      <CheckCircle2 size={22} />
                      Save Question to {activeTab}
                    </button>
                  </form>
                </motion.div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {questions.map((q, idx) => (
                  <div key={q._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>{idx + 1}.</span> {q.questionText}</p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {q.options.map((opt, oIdx) => (
                          <span key={oIdx} style={{ fontSize: '0.85rem', color: oIdx === q.correctAnswer ? '#10b981' : 'var(--text-muted)' }}>
                            {String.fromCharCode(65 + oIdx)}: {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteQuestion(q._id)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '0.5rem' }}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Participant Logs</h2>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>
                  Total Participants: {participants.length}
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '1rem' }}>Student Name</th>
                      <th style={{ padding: '1rem' }}>Reg No</th>
                      <th style={{ padding: '1rem' }}>Section</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Scores (U1 | U2 | U3 | U4)</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Total</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p) => (
                      <tr key={p._id} className="glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: '600', borderTopLeftRadius: '1rem', borderBottomLeftRadius: '1rem' }}>{p.studentName}</td>
                        <td style={{ padding: '1.25rem 1rem' }}>{p.regNo}</td>
                        <td style={{ padding: '1.25rem 1rem' }}>Sec {p.section}</td>
                        <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{p.unit1Marks}</span> | 
                          <span style={{ color: 'var(--text-muted)' }}> {p.unit2Marks}</span> | 
                          <span style={{ color: 'var(--text-muted)' }}> {p.unit3Marks}</span> | 
                          <span style={{ color: 'var(--text-muted)' }}> {p.unit4Marks}</span>
                        </td>
                        <td style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem' }}>{p.totalMarks}</td>
                        <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '2rem', 
                            fontSize: '0.75rem', 
                            fontWeight: '700',
                            background: p.submissionType === 'Auto' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: p.submissionType === 'Auto' ? '#f43f5e' : '#10b981',
                            border: `1px solid ${p.submissionType === 'Auto' ? '#f43f5e' : '#10b981'}`
                          }}>
                            {p.submissionType === 'Auto' ? '⚠️ AUTO' : 'MANUAL'}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem 1rem', borderTopRightRadius: '1rem', borderBottomRightRadius: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => {
                                setSelectedParticipant(p);
                                setShowDetailModal(true);
                              }} 
                              className="btn btn-outline" 
                              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            >
                              View Details
                            </button>
                            <button 
                              onClick={() => handleDeleteParticipant(p._id)} 
                              style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '0.5rem' }}
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Detailed Response Modal */}
      <AnimatePresence>
        {showDetailModal && selectedParticipant && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowDetailModal(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card" 
              style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '900px', 
                maxHeight: '90vh', 
                padding: '3rem', 
                overflowY: 'auto', 
                background: 'white',
                border: 'none',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <button 
                onClick={() => setShowDetailModal(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '800' }}>{selectedParticipant.studentName}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Reg No: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{selectedParticipant.regNo}</span> | 
                    Section: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{selectedParticipant.section}</span> | 
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '2rem', 
                      fontSize: '0.75rem', 
                      fontWeight: '700',
                      background: selectedParticipant.submissionType === 'Auto' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: selectedParticipant.submissionType === 'Auto' ? '#f43f5e' : '#10b981',
                      border: `1px solid ${selectedParticipant.submissionType === 'Auto' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                    }}>
                      {selectedParticipant.submissionType === 'Auto' ? '⚠️ Auto-Submitted' : '✅ Manual Submission'}
                    </span>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{selectedParticipant.totalMarks}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Score</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '3.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '700' }}>Unit 1</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>{selectedParticipant.unit1Marks}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '700' }}>Unit 2</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>{selectedParticipant.unit2Marks}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '700' }}>Unit 3</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>{selectedParticipant.unit3Marks}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '700' }}>Unit 4</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>{selectedParticipant.unit4Marks}</p>
                </div>
              </div>

              <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem', color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '700' }}>Response Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {Object.entries(selectedParticipant.responses || {}).map(([qId, selectedIdx]) => {
                  const question = allQuestions.find(q => q._id === qId);
                  if (!question) return null;
                  const isCorrect = selectedIdx === question.correctAnswer;

                  return (
                    <div key={qId} className="glass-card" style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: `6px solid ${isCorrect ? '#10b981' : '#f43f5e'}` }}>
                      <p style={{ fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-main)', lineHeight: '1.5' }}>{question.questionText}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)', padding: '0.75rem 1rem', borderRadius: '0.75rem' }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '700' }}>Student Answer</p>
                          <p style={{ color: isCorrect ? '#059669' : '#e11d48', fontWeight: '600', fontSize: '0.95rem' }}>
                            {question.options[selectedIdx]} {isCorrect ? '✓' : '✗'}
                          </p>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem 1rem', borderRadius: '0.75rem' }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '700' }}>Correct Answer</p>
                          <p style={{ color: '#059669', fontWeight: '600', fontSize: '0.95rem' }}>{question.options[question.correctAnswer]}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setShowDetailModal(false)} className="btn btn-primary" style={{ padding: '1rem 4rem' }}>Close Viewer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
