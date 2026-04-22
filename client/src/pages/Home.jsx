import { Link } from 'react-router-dom';
import { Play, ShieldCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card"
        style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}
      >
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: 'fit-content', padding: '1rem', borderRadius: '1rem', margin: '0 auto 2rem' }}>
          <Info size={48} color="var(--primary)" />
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, var(--primary), #1e293b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome to the Advanced Quiz System
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: '1.6' }}>
          Test your knowledge in Hibernate, Spring, and Spring Boot. <br />
          4 Units. 40 Minutes. 1 Dynamic Exam.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            <Play size={20} />
            Start Quiz
          </Link>
          <Link to="/admin" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            <ShieldCheck size={20} />
            Admin Portal
          </Link>
        </div>
      </motion.div>

      <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        {[
          { title: 'Unit 1: Hibernate', desc: 'ORM fundamentals.' },
          { title: 'Unit 2: Spring', desc: 'Dependency Injection and Core concepts.' },
          { title: 'Unit 3: Spring Boot', desc: 'Modern web development and Auto-configuration.' },
          { title: 'Unit 4: React', desc: 'Modern User Interfaces and Hook-based logic.' }
        ].map((unit, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + (idx * 0.1) }}
            className="glass-card"
            style={{ padding: '2rem', textAlign: 'left' }}
          >
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--primary)' }}>{unit.title}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{unit.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
