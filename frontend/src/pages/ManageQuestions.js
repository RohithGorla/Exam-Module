import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExam, addQuestion, deleteQuestion } from '../services/api';

const emptyForm = { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: 1 };

export default function ManageQuestions() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchExam = () => {
    getExam(examId).then(res => setExam(res.data.data));
  };

  useEffect(() => { fetchExam(); }, [examId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await addQuestion(examId, form);
      setSuccess('Question added!');
      setForm(emptyForm);
      fetchExam();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    await deleteQuestion(qId);
    fetchExam();
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.back} onClick={() => navigate('/admin')}>← Back to Dashboard</button>
        <h2 style={styles.title}>📋 {exam?.title}</h2>
        <p style={styles.subtitle}>{exam?.questions?.length || 0} question(s) added | {exam?.duration} mins | {exam?.totalMarks} marks</p>

        <div style={styles.layout}>
          {/* Add Question Form */}
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Add Question</h3>
            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.successMsg}>{success}</div>}
            <form onSubmit={handleAdd}>
              <div style={styles.field}>
                <label style={styles.label}>Question Text *</label>
                <textarea name="questionText" value={form.questionText} onChange={handleChange}
                  style={{ ...styles.input, height: 72, resize: 'vertical' }} placeholder="Enter your question..." required />
              </div>
              {['A', 'B', 'C', 'D'].map(opt => (
                <div key={opt} style={styles.field}>
                  <label style={styles.label}>Option {opt} {opt === 'A' || opt === 'B' ? '*' : '(optional)'}</label>
                  <input name={`option${opt}`} value={form[`option${opt}`]} onChange={handleChange}
                    style={styles.input} placeholder={`Option ${opt}`} required={opt === 'A' || opt === 'B'} />
                </div>
              ))}
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Correct Answer *</label>
                  <select name="correctAnswer" value={form.correctAnswer} onChange={handleChange} style={styles.input}>
                    {['A', 'B', 'C', 'D'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Marks</label>
                  <input name="marks" type="number" min="1" value={form.marks} onChange={handleChange} style={styles.input} />
                </div>
              </div>
              <button type="submit" style={styles.btn} disabled={loading}>
                {loading ? 'Adding...' : '+ Add Question'}
              </button>
            </form>
          </div>

          {/* Question List */}
          <div style={styles.listArea}>
            <h3 style={styles.formTitle}>Questions ({exam?.questions?.length || 0})</h3>
            {exam?.questions?.length === 0 && <p style={styles.empty}>No questions yet. Add one!</p>}
            {exam?.questions?.map((q, idx) => (
              <div key={q.id} style={styles.qCard}>
                <div style={styles.qHeader}>
                  <strong style={{ color: '#2d3748' }}>Q{idx + 1}. {q.questionText}</strong>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={styles.marksBadge}>{q.marks}m</span>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(q.id)}>✕</button>
                  </div>
                </div>
                <div style={styles.optList}>
                  {['A', 'B', 'C', 'D'].map(o => q[`option${o}`] && (
                    <span key={o} style={{ ...styles.optItem, ...(q.correctAnswer === o ? styles.optCorrect : {}) }}>
                      {o}. {q[`option${o}`]} {q.correctAnswer === o && '✔'}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f7fafc', padding: '24px 16px' },
  container: { maxWidth: 1100, margin: '0 auto' },
  back: { background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: 600, marginBottom: 12, padding: 0, fontSize: 14 },
  title: { color: '#1a202c', marginBottom: 4, fontSize: 22 },
  subtitle: { color: '#718096', marginBottom: 24, fontSize: 14 },
  layout: { display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' },
  formCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', position: 'sticky', top: 16 },
  formTitle: { color: '#2d3748', marginBottom: 16, fontSize: 17 },
  error: { background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 },
  successMsg: { background: '#f0fff4', border: '1px solid #68d391', color: '#276749', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 },
  field: { marginBottom: 12 },
  label: { display: 'block', marginBottom: 5, fontWeight: 600, color: '#4a5568', fontSize: 13 },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#2d3748' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  btn: { width: '100%', padding: '11px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  listArea: { display: 'flex', flexDirection: 'column', gap: 12 },
  qCard: { background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  qHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 },
  marksBadge: { background: '#ebf4ff', color: '#3182ce', padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  deleteBtn: { background: '#fff5f5', color: '#e53e3e', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '3px 8px', fontWeight: 700 },
  optList: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  optItem: { background: '#f7fafc', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: 8, fontSize: 13, color: '#4a5568' },
  optCorrect: { background: '#c6f6d5', border: '1px solid #68d391', color: '#276749', fontWeight: 600 },
  empty: { color: '#a0aec0', padding: 24, textAlign: 'center' },
};
