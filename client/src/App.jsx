import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Registration from './pages/Registration';
import QuizRunner from './pages/QuizRunner';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './index.css';

const MainContent = () => {
  const location = useLocation();
  const isQuizPage = location.pathname === '/quiz';

  useEffect(() => {
    const preventAction = (e) => {
      e.preventDefault();
      return false;
    };

    const preventKeyShortcuts = (e) => {
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I or J
        (e.ctrlKey && e.keyCode === 85) || // Ctrl+U (View Source)
        (e.ctrlKey && e.keyCode === 83) || // Ctrl+S (Save)
        (e.ctrlKey && e.keyCode === 80)    // Ctrl+P (Print)
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Global Anti-Cheating: Applies to all pages
    document.addEventListener('contextmenu', preventAction);
    document.addEventListener('copy', preventAction);
    document.addEventListener('paste', preventAction);
    document.addEventListener('cut', preventAction);
    document.addEventListener('keydown', preventKeyShortcuts);
    document.addEventListener('dragstart', preventAction);

    return () => {
      document.removeEventListener('contextmenu', preventAction);
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('paste', preventAction);
      document.removeEventListener('cut', preventAction);
      document.removeEventListener('keydown', preventKeyShortcuts);
      document.removeEventListener('dragstart', preventAction);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      {!isQuizPage && <Navbar />}
      <main style={{ flex: 1, paddingTop: '80px', paddingBottom: '6rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/quiz" element={<QuizRunner />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isQuizPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

export default App;
