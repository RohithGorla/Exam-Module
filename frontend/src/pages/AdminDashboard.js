import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams, deleteExam, getAnalytics, getAllResults } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('analytics');
  const [exams, setExams] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getExams(), getAnalytics(), getAllResults()])
      .then(([eRes, aRes, rRes]) => {
        setExams(eRes.data.data);
        setAnalytics(aRes.data.data);
        setResults(rRes.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam and all its questions?')) return;
    await deleteExam(id);
    fetchData();
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navBrand}>📝 Exam Module — Admin</span>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👤 {user?.name}</span>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.tabBar}>
          {['analytics', 'exams', 'results'].map(t => (
            <button key={t} style={tab === t ? styles.tabActive : styles.tab} onClick={() => setTab(t)}>
              {t === 'analytics' ? '📊 Analytics' : t === 'exams' ? '📋 Exams' : '📄 Results'}
            </button>
          ))}
          <button style={styles.tabCreate} onClick={() => navigate('/admin/create-exam')}>
            ＋ New Exam
          </button>
        </div>

        {loading ? <div style={styles.loading}>Loading...</div> : (
          <>
            {tab === 'analytics' && analytics && (
              <div>
                <div style={styles.statsGrid}>
                  <StatCard icon="📋" label="Total Exams" value={analytics.totalExams} color="#667eea" />
                  <StatCard icon="👥" label="Students" value={analytics.totalStudents} color="#48bb78" />
                  <StatCard icon="📝" label="Submissions" value={analytics.totalSubmissions} color="#ed8936" />
                  <StatCard icon="✅" label="Pass Rate" value={`${analytics.passRate}%`} color="#38b2ac" />
                </div>
                <h3 style={styles.sectionTitle}>Recent Submissions</h3>
                <table style={styles.table}>
                  <thead><tr style={styles.thead}>
                    <th style={styles.th}>Student</th><th style={styles.th}>Exam</th>
                    <th style={styles.th}>Score</th><th style={styles.th}>Status</th>
                  </tr></thead>
                  <tbody>
                    {analytics.recentResults.map(r => (
                      <tr key={r.id} style={styles.tr}>
                        <td style={styles.td}>{r.student?.name}</td>
                        <td style={styles.td}>{r.exam?.title}</td>
                        <td style={styles.td}>{r.score}/{r.totalMarks} ({r.percentage}%)</td>
                        <td style={styles.td}><span style={r.passed ? styles.pass : styles.fail}>{r.passed ? 'Pass' : 'Fail'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'exams' && (
              <div>
                {exams.length === 0 && <p style={styles.empty}>No exams yet. Create one!</p>}
                <div style={styles.examGrid}>
                  {exams.map(exam => (
                    <div key={exam.id} style={styles.examCard}>
                      <div style={styles.examCardHeader}>
                        <h3 style={styles.examCardTitle}>{exam.title}</h3>
                        <span style={exam.isActive ? styles.active : styles.inactive}>
                          {exam.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p style={styles.examCardDesc}>{exam.description || 'No description'}</p>
                      <div style={styles.examMeta}>
                        <span>⏱ {exam.duration}m</span>
                        <span>📊 {exam.totalMarks} marks</span>
                        <span>✅ Pass: {exam.passingMarks}</span>
                      </div>
                      <div style={styles.examActions}>
                        <button style={styles.btnEdit} onClick={() => navigate(`/admin/exam/${exam.id}/questions`)}>
                          Manage Questions
                        </button>
                        <button style={styles.btnDelete} onClick={() => handleDelete(exam.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'results' && (
              <div style={styles.tableWrap}>
                {results.length === 0 && <p style={styles.empty}>No submissions yet.</p>}
                {results.length > 0 && (
                  <table style={styles.table}>
                    <thead><tr style={styles.thead}>
                      <th style={styles.th}>Student</th><th style={styles.th}>Email</th>
                      <th style={styles.th}>Exam</th><th style={styles.th}>Score</th>
                      <th style={styles.th}>%</th><th style={styles.th}>Status</th><th style={styles.th}>Date</th>
                    </tr></thead>
                    <tbody>
                      {results.map(r => (
                        <tr key={r.id} style={styles.tr}>
                          <td style={styles.td}>{r.student?.name}</td>
                          <td style={styles.td}>{r.student?.email}</td>
                          <td style={styles.td}>{r.exam?.title}</td>
                          <td style={styles.td}>{r.score}/{r.totalMarks}</td>
                          <td style={styles.td}>{r.percentage}%</td>
                          <td style={styles.td}><span style={r.passed ? styles.pass : styles.fail}>{r.passed ? 'Pass' : 'Fail'}</span></td>
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

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 32 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
      <div style={{ color: '#718096', fontSize: 14 }}>{label}</div>
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
  container: { maxWidth: 1100, margin: '0 auto', padding: '32px 16px' },
  tabBar: { display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' },
  tab: { padding: '8px 20px', border: '2px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#718096' },
  tabActive: { padding: '8px 20px', border: '2px solid #667eea', borderRadius: 8, background: '#667eea', cursor: 'pointer', fontWeight: 600, color: '#fff' },
  tabCreate: { padding: '8px 20px', border: '2px solid #48bb78', borderRadius: 8, background: '#48bb78', cursor: 'pointer', fontWeight: 600, color: '#fff', marginLeft: 'auto' },
  loading: { textAlign: 'center', padding: 60, color: '#718096' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20, marginBottom: 32 },
  statCard: { background: '#fff', borderRadius: 12, padding: '24px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' },
  sectionTitle: { color: '#2d3748', marginBottom: 16 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  thead: { background: '#667eea' },
  th: { padding: '12px 16px', color: '#fff', textAlign: 'left', fontWeight: 600, fontSize: 14 },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', color: '#4a5568', fontSize: 14 },
  pass: { background: '#c6f6d5', color: '#276749', padding: '3px 10px', borderRadius: 12, fontWeight: 600, fontSize: 13 },
  fail: { background: '#fed7d7', color: '#c53030', padding: '3px 10px', borderRadius: 12, fontWeight: 600, fontSize: 13 },
  examGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 },
  examCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  examCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  examCardTitle: { margin: 0, color: '#2d3748', fontSize: 17 },
  active: { background: '#c6f6d5', color: '#276749', fontSize: 11, padding: '3px 10px', borderRadius: 12 },
  inactive: { background: '#fed7d7', color: '#c53030', fontSize: 11, padding: '3px 10px', borderRadius: 12 },
  examCardDesc: { color: '#718096', fontSize: 14, marginBottom: 12 },
  examMeta: { display: 'flex', gap: 12, fontSize: 13, color: '#4a5568', marginBottom: 16, flexWrap: 'wrap' },
  examActions: { display: 'flex', gap: 8 },
  btnEdit: { flex: 1, padding: '8px', background: '#ebf4ff', color: '#3182ce', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnDelete: { padding: '8px 14px', background: '#fff5f5', color: '#c53030', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  empty: { color: '#a0aec0', textAlign: 'center', padding: 40 },
};
