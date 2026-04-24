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
  const [responses, setResponses] = useState({});
  const [marks, setMarks] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [isCheated, setIsCheated] = useState(false);
  const cheatedRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const timerRef = useRef(null);
  const submittingRef = useRef(false);
  const navigate = useNavigate();

  const unitNames = {
    1: 'Unit 1: Hibernate',
    2: 'Unit 2: Spring',
    3: 'Unit 3: Spring Boot',
    4: 'Unit 4: React'
  };

  // Fetch questions when unit changes
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
        setLoading(false);
        setTimeLeft(600);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    loadQuestions();
  }, [unit]);

  // Timer logic
  useEffect(() => {
    if (finished || loading) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNextUnit(); // Auto-submit/move on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [unit, loading, finished]);

  // Anti-Cheating Logic
  useEffect(() => {
    if (finished || loading) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !finished) {
        setIsCheated(true);
        cheatedRef.current = true;
        handleNextUnit(true, true); // Force final submission as Auto
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

  if (finished) {
    const isActuallyCheated = isCheated;
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ padding: '4rem', textAlign: 'center', maxWidth: '650px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', background: '#f8fafc' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Unit 1</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{marks[1]}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.25rem', background: '#f8fafc' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Unit 2</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{marks[2]}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.25rem', background: '#f8fafc' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Unit 3</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{marks[3]}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.25rem', background: '#f8fafc' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Unit 4</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{marks[4]}</p>
                </div>
              </div>
            </>
          )}
          <button onClick={() => window.location.href = '/'} className="btn btn-primary" style={{ padding: '1rem 3rem' }}>Return Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Quiz Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--primary)' }}>{unitNames[unit]}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Student: {studentInfo.name} ({studentInfo.regNo})</p>
        </div>
        <div className="glass-card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderColor: timeLeft < 60 ? '#ef4444' : 'var(--glass-border)' }}>
          <Clock size={20} color={timeLeft < 60 ? '#ef4444' : 'var(--text-muted)'} />
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: timeLeft < 60 ? '#ef4444' : 'var(--text-main)' }}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', marginBottom: '3rem', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${(unit / 4) * 100}%` }}
          style={{ height: '100%', background: 'var(--primary)' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No questions found for this unit.</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please contact admin or move to next unit.</p>
          <button onClick={handleNextUnit} className="btn btn-primary">
            Next Unit <ArrowRight size={20} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {questions.map((q, index) => (
            <motion.div
              key={q._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card"
              style={{ padding: '2rem' }}
            >
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{index + 1}.</span>
                {q.questionText}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleOptionSelect(q._id, optIdx)}
                    style={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid',
                      borderColor: responses[q._id] === optIdx ? 'var(--primary)' : 'var(--glass-border)',
                      background: responses[q._id] === optIdx ? 'rgba(99, 102, 241, 0.1)' : '#f8fafc',
                      color: responses[q._id] === optIdx ? 'var(--primary)' : 'var(--text-main)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontWeight: '700', marginRight: '0.5rem' }}>{String.fromCharCode(65 + optIdx)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', marginBottom: '4rem' }}>
            <button onClick={() => handleNextUnit()} className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
              {unit < 4 ? 'Save & Next Unit' : 'Finish Exam'}
              {unit < 4 ? <ArrowRight size={20} /> : <Save size={20} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizRunner;
