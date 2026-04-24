import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = '/api';

const QuizRunner = () => {
  const [studentInfo] = useState(JSON.parse(localStorage.getItem('studentInfo') || '{}'));
  const [unit, setUnit] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});
  const [marks, setMarks] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [isCheated, setIsCheated] = useState(false);
  const cheatedRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [showTimer, setShowTimer] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const timerRef = useRef(null);
  const submittingRef = useRef(false);
  const navigate = useNavigate();

  const unitNames = {
    1: 'Unit 1: Hibernate',
    2: 'Unit 2: Spring',
    3: 'Unit 3: Spring Boot',
    4: 'Unit 4: React'
  };

  useEffect(() => {
    if (unit > 4) {
      submitFinalResults();
      return;
    }
    
    setLoading(true);
    const loadQuestions = async () => {
      try {
        const res = await axios.get(`${API_BASE}/questions/${unit}`);
        setQuestions(res.data);
        setCurrentIdx(0);
        setLoading(false);
        setTimeLeft(600);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    loadQuestions();
  }, [unit]);

  useEffect(() => {
    if (finished || loading) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNextUnit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [unit, loading, finished]);

  useEffect(() => {
    if (finished || loading) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !finished) {
        setIsCheated(true);
        cheatedRef.current = true;
        handleNextUnit(true, true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [finished, loading, unit]);

  const handleOptionSelect = (qId, optionIdx) => {
    setResponses({ ...responses, [qId]: optionIdx });
  };

  const calculateMarksForCurrentUnit = () => {
    let currentMarks = 0;
    questions.forEach(q => {
      if (responses[q._id] === q.correctAnswer) {
        currentMarks++;
      }
    });
    return currentMarks;
  };

  const handleNextUnit = (forceFinal = false, cheatedInAction = false) => {
    const unitMarks = calculateMarksForCurrentUnit();
    const updatedMarks = { ...marks, [unit]: unitMarks };
    setMarks(updatedMarks);
    
    if (unit < 4 && !forceFinal) {
      setUnit(unit + 1);
      setShowModal(false);
    } else {
      setFinished(true);
      submitFinalResults(unitMarks, updatedMarks, cheatedInAction);
    }
  };

  const submitFinalResults = (lastUnitMarks = 0, finalMarksObj = null, cheatedInAction = false) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const finalMarks = finalMarksObj || { ...marks, [unit]: lastUnitMarks };
    const payload = {
      studentName: studentInfo.name,
      regNo: studentInfo.regNo,
      section: parseInt(studentInfo.section),
      unit1Marks: finalMarks[1],
      unit2Marks: finalMarks[2],
      unit3Marks: finalMarks[3],
      unit4Marks: finalMarks[4],
      responses: responses,
      submissionType: (cheatedRef.current || cheatedInAction) ? 'Auto' : 'Manual'
    };

    axios.post(`${API_BASE}/submit`, payload)
      .then(() => {
        setFinished(true);
      })
      .catch(err => {
        console.error("Error submitting results: " + err.message);
      });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const answeredCount = questions.filter(q => responses[q._id] !== undefined).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (finished) {
    const isActuallyCheated = isCheated;
    return (
      <div style={{ 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--bg-main)',
        padding: '2rem'
      }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ padding: '3.5rem', textAlign: 'center', maxWidth: '650px', width: '100%' }}>
          {isActuallyCheated ? (
            <>
              <motion.div initial={{ rotate: -10 }} animate={{ rotate: 10 }} transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}>
                <AlertCircle size={80} color="#f43f5e" style={{ margin: '0 auto 2rem' }} />
              </motion.div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#f43f5e' }}>Caught in the Act!</h1>
              <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                Nice try, {studentInfo.name}! Unfortunately, your magic tricks don't work on our anti-cheat system.
                We've auto-submitted your answers so you can focus entirely on whatever elsewhere was so extremely important.
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 size={80} color="var(--primary)" style={{ margin: '0 auto 2rem' }} />
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1.2rem' }}>Submission Successful</h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Well done! Your hard work and honesty have been recorded.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                {[1, 2, 3, 4].map(u => (
                  <div key={u} className="glass-card" style={{ padding: '1.25rem', background: '#f8fafc' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Unit {u}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{marks[u]}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          <button onClick={() => window.location.href = '/'} className="btn btn-primary" style={{ padding: '1rem 3rem' }}>Return Home</button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      background: 'var(--bg-main)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--glass-border)',
        background: 'white',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '0.4rem', 
            borderRadius: '0.5rem' 
          }}>
            <Save size={18} />
          </div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{unitNames[unit]}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: '#f1f5f9', 
            padding: '0.4rem 0.8rem', 
            borderRadius: '2rem' 
          }}>
            <Clock size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{questions.length > 0 ? `${currentIdx + 1} / ${questions.length}` : '0/0'}</span>
          </div>

          {showTimer && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.1)' : '#dcfce7', 
              color: timeLeft < 60 ? '#ef4444' : '#16a34a',
              padding: '0.4rem 1.2rem', 
              borderRadius: '2rem',
              fontWeight: '700',
              fontSize: '0.9rem'
            }}>
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          <button 
            onClick={() => setShowTimer(!showTimer)}
            style={{ 
              background: 'white', 
              border: '1px solid #e2e8f0', 
              padding: '0.4rem 0.8rem', 
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {showTimer ? 'Hide timer' : 'Show timer'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        padding: '1.5rem 2rem', 
        gap: '2rem', 
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading questions...</div>
        ) : (
          <>
            {/* Question Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`${unit}-${currentIdx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card" 
                  style={{ padding: '2.5rem', minHeight: 'fit-content' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ 
                        background: 'var(--primary)', 
                        color: 'white', 
                        padding: '0.3rem 0.8rem', 
                        borderRadius: '2rem',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        Q {currentIdx + 1} of {questions.length}
                      </span>
                      {responses[currentQuestion?._id] !== undefined && (
                        <span style={{ 
                          background: '#dcfce7', 
                          color: '#16a34a', 
                          padding: '0.3rem 0.8rem', 
                          borderRadius: '2rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          <CheckCircle2 size={12} /> Answer saved
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      1.00 pts
                    </div>
                  </div>

                  <h3 style={{ 
                    marginBottom: '2rem', 
                    fontSize: '1.3rem', 
                    fontWeight: '600', 
                    lineHeight: '1.5',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    {currentQuestion?.questionText}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {currentQuestion?.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionSelect(currentQuestion._id, optIdx)}
                        style={{
                          padding: '1rem 1.25rem',
                          borderRadius: '0.75rem',
                          border: '2px solid',
                          borderColor: responses[currentQuestion._id] === optIdx ? 'var(--primary)' : '#f1f5f9',
                          background: responses[currentQuestion._id] === optIdx ? 'rgba(79, 70, 229, 0.05)' : 'white',
                          color: 'var(--text-main)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '0.4rem', 
                          background: responses[currentQuestion._id] === optIdx ? 'var(--primary)' : '#f1f5f9',
                          color: responses[currentQuestion._id] === optIdx ? 'white' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.8rem'
                        }}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: responses[currentQuestion._id] === optIdx ? '600' : '400' }}>
                          {opt}
                        </span>
                        {responses[currentQuestion._id] === optIdx && <CheckCircle2 size={16} color="var(--primary)" />}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setResponses(prev => {
                      const next = { ...prev };
                      delete next[currentQuestion._id];
                      return next;
                    })}
                    style={{ 
                      marginTop: '1.5rem', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--text-muted)', 
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <AlertCircle size={12} /> Clear my choice
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sidebar Area */}
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                  Question Palette
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIdx;
                    const isAnswered = responses[q._id] !== undefined;
                    
                    return (
                      <button
                        key={q._id}
                        onClick={() => setCurrentIdx(idx)}
                        style={{
                          aspectRatio: '1/1',
                          borderRadius: '0.6rem',
                          border: '2px solid',
                          borderColor: isCurrent ? 'var(--primary)' : isAnswered ? 'var(--primary)' : '#f1f5f9',
                          background: isAnswered ? 'var(--primary)' : 'white',
                          color: isAnswered ? 'white' : isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Answered</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid #f1f5f9' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Not answered</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid var(--primary)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Current</span>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                  <svg width="60" height="60" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <circle 
                      cx="40" cy="40" r="34" fill="none" stroke="var(--primary)" strokeWidth="8" 
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent/100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800' }}>
                    {Math.round(progressPercent)}%
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>{answeredCount}/{questions.length}</p>
                  <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Answered</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation Footer */}
      <div style={{ 
        padding: '1rem 2rem', 
        borderTop: '1px solid var(--glass-border)', 
        background: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button 
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          style={{ 
            padding: '0.6rem 1.5rem', 
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            background: 'white',
            color: currentIdx === 0 ? '#cbd5e1' : 'var(--text-main)',
            cursor: currentIdx === 0 ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Previous
        </button>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
          {currentIdx + 1} / {questions.length}
        </div>

        {currentIdx < questions.length - 1 ? (
          <button 
            onClick={() => setCurrentIdx(prev => prev + 1)}
            style={{ 
              padding: '0.6rem 2rem', 
              borderRadius: '0.75rem',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Next <ArrowRight size={18} />
          </button>
        ) : (
          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              padding: '0.6rem 2.5rem', 
              borderRadius: '0.75rem',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            {unit < 4 ? 'Submit Unit' : 'Finish Quiz'} <Save size={18} />
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card"
            style={{ padding: '2.5rem', maxWidth: '400px', textAlign: 'center' }}
          >
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              background: 'rgba(99, 102, 241, 0.1)', 
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Are you sure?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              {unit < 4 
                ? "You are about to submit this unit and move to the next. You won't be able to change these answers later." 
                : "You are about to finish the entire exam. Make sure you have reviewed all your answers."}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleNextUnit()}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default QuizRunner;
