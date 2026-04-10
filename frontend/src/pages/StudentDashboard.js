import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams, getMyResults } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [tab, setTab] = useState('exams');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getExams(), getMyResults()])
      .then(([exRes, rRes]) => {
        setExams(exRes.data.data.filter(e => e.isActive));
        setResults(rRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const submittedExamIds = results.map(r => r.examId);

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navBrand}>📝 Exam Module</span>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👤 {user?.name}</span>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <h2 style={styles.heading}>Welcome, {user?.name}!</h2>

        <div style={styles.tabs}>
          <button style={tab === 'exams' ? styles.tabActive : styles.tab} onClick={() => setTab('exams')}>Available Exams</button>
          <button style={tab === 'results' ? styles.tabActive : styles.tab} onClick={() => setTab('results')}>My Results</button>
        </div>

        {loading ? <div style={styles.loading}>Loading...</div> : (
          <>
            {tab === 'exams' && (
              <div style={styles.grid}>
                {exams.length === 0 && <p style={styles.empty}>No exams available.</p>}
                {exams.map(exam => {
                  const done = submittedExamIds.includes(exam.id);
                  return (
                    <div key={exam.id} style={styles.card}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>{exam.title}</h3>
                        {done && <span style={styles.badge}>✔ Submitted</span>}
                      </div>
                      <p style={styles.cardDesc}>{exam.description || 'No description'}</p>
                      <div style={styles.cardMeta}>
                        <span>⏱ {exam.duration} mins</span>
                        <span>📊 {exam.totalMarks} marks</span>
                        <span>✅ Pass: {exam.passingMarks}</span>
                      </div>
                      <button
                        style={done ? styles.btnDone : styles.btnStart}
                        disabled={done}
                        onClick={() => navigate(`/exam/${exam.id}`)}
                      >
                        {done ? 'Already Submitted' : 'Start Exam'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'results' && (
              <div style={styles.tableWrap}>
                {results.length === 0 && <p style={styles.empty}>No results yet.</p>}
                {results.length > 0 && (
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.thead}>
                        <th style={styles.th}>Exam</th>
                        <th style={styles.th}>Score</th>
                        <th style={styles.th}>Percentage</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map(r => (
                        <tr key={r.id} style={styles.tr}>
                          <td style={styles.td}>{r.exam?.title}</td>
                          <td style={styles.td}>{r.score}/{r.totalMarks}</td>
                          <td style={styles.td}>{r.percentage}%</td>
                          <td style={styles.td}>
                            <span style={r.passed ? styles.pass : styles.fail}>
                              {r.passed ? '✅ Pass' : '❌ Fail'}
                            </span>
                          </td>
                          <td style={styles.td}>{new Date(r.submittedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f7fafc' },
  nav: { background: '#fff', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  navBrand: { fontWeight: 700, fontSize: 20, color: '#667eea' },
  navRight: { display: 'flex', alignItems: 'center', gap: 16 },
  navUser: { color: '#4a5568', fontWeight: 500 },
  logoutBtn: { background: '#fed7d7', color: '#c53030', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  container: { maxWidth: 960, margin: '0 auto', padding: '32px 16px' },
  heading: { color: '#1a202c', marginBottom: 24 },
  tabs: { display: 'flex', gap: 8, marginBottom: 24 },
  tab: { padding: '8px 20px', border: '2px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#718096' },
  tabActive: { padding: '8px 20px', border: '2px solid #667eea', borderRadius: 8, background: '#667eea', cursor: 'pointer', fontWeight: 600, color: '#fff' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { margin: 0, color: '#2d3748', fontSize: 17 },
  badge: { background: '#c6f6d5', color: '#276749', fontSize: 11, padding: '3px 8px', borderRadius: 12, whiteSpace: 'nowrap' },
  cardDesc: { color: '#718096', fontSize: 14, marginBottom: 12 },
  cardMeta: { display: 'flex', gap: 12, fontSize: 13, color: '#4a5568', marginBottom: 16, flexWrap: 'wrap' },
  btnStart: { width: '100%', padding: '10px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  btnDone: { width: '100%', padding: '10px', background: '#e2e8f0', color: '#a0aec0', border: 'none', borderRadius: 8, cursor: 'not-allowed', fontWeight: 600 },
  loading: { textAlign: 'center', padding: 40, color: '#718096' },
  empty: { color: '#a0aec0', textAlign: 'center', padding: 40 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  thead: { background: '#667eea' },
  th: { padding: '12px 16px', color: '#fff', textAlign: 'left', fontWeight: 600, fontSize: 14 },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', color: '#4a5568', fontSize: 14 },
  pass: { background: '#c6f6d5', color: '#276749', padding: '3px 10px', borderRadius: 12, fontWeight: 600, fontSize: 13 },
  fail: { background: '#fed7d7', color: '#c53030', padding: '3px 10px', borderRadius: 12, fontWeight: 600, fontSize: 13 },
};
