import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExam, submitExam } from '../services/api';

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getExam(id).then((res) => {
      setExam(res.data.data);
      setTimeLeft(res.data.data.duration * 60);
    }).catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const res = await submitExam(id, answers);
      setResult(res.data.data);
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, submitting, submitted]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitted, handleSubmit]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return <div style={styles.center}>Loading exam...</div>;

  if (submitted && result) {
    return (
      <div style={styles.center}>
        <div style={styles.resultCard}>
          <div style={{ fontSize: 64 }}>{result.passed ? '🎉' : '😔'}</div>
          <h2 style={{ color: result.passed ? '#276749' : '#c53030' }}>
            {result.passed ? 'Congratulations! You Passed!' : 'Better Luck Next Time!'}
          </h2>
          <div style={styles.scoreBox}>
            <div style={styles.scoreItem}><span style={styles.scoreLabel}>Score</span><span style={styles.scoreVal}>{result.score}/{result.totalMarks}</span></div>
            <div style={styles.scoreItem}><span style={styles.scoreLabel}>Percentage</span><span style={styles.scoreVal}>{result.percentage}%</span></div>
            <div style={styles.scoreItem}><span style={styles.scoreLabel}>Status</span><span style={{ ...styles.scoreVal, color: result.passed ? '#276749' : '#c53030' }}>{result.passed ? 'PASS' : 'FAIL'}</span></div>
          </div>
          <button style={styles.btnPrimary} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const answered = Object.keys(answers).length;
  const total = exam?.questions?.length || 0;
  const danger = timeLeft <= 60;

  return (
    <div style={styles.page}>
      <div style={styles.examNav}>
        <h3 style={styles.examTitle}>{exam?.title}</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={styles.progress}>{answered}/{total} answered</span>
          <span style={{ ...styles.timer, background: danger ? '#fed7d7' : '#ebf4ff', color: danger ? '#c53030' : '#2b6cb0' }}>
            ⏱ {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div style={styles.examBody}>
        {exam?.questions?.map((q, idx) => (
          <div key={q.id} style={styles.qCard}>
            <p style={styles.qText}><strong>Q{idx + 1}.</strong> {q.questionText} <span style={styles.marks}>({q.marks} mark{q.marks > 1 ? 's' : ''})</span></p>
            <div style={styles.options}>
              {['A', 'B', 'C', 'D'].map(opt => {
                const text = q[`option${opt}`];
                if (!text) return null;
                const selected = answers[q.id] === opt;
                return (
                  <label key={opt} style={{ ...styles.option, ...(selected ? styles.optionSelected : {}) }}>
                    <input type="radio" name={`q_${q.id}`} value={opt}
                      checked={selected}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      style={{ marginRight: 10 }}
                    />
                    <strong>{opt}.</strong>&nbsp;{text}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div style={styles.submitArea}>
          <p style={styles.submitNote}>
            You have answered {answered} out of {total} questions.
            {answered < total && ` ${total - answered} question(s) unanswered.`}
          </p>
          <button style={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f7fafc' },
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' },
  examNav: { background: '#fff', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 10 },
  examTitle: { margin: 0, color: '#2d3748', fontSize: 18 },
  progress: { color: '#718096', fontSize: 14 },
  timer: { padding: '6px 16px', borderRadius: 20, fontWeight: 700, fontSize: 16 },
  examBody: { maxWidth: 760, margin: '0 auto', padding: '24px 16px' },
  qCard: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  qText: { color: '#2d3748', fontSize: 16, marginBottom: 16 },
  marks: { color: '#a0aec0', fontWeight: 400, fontSize: 13 },
  options: { display: 'flex', flexDirection: 'column', gap: 10 },
  option: { display: 'flex', alignItems: 'center', padding: '10px 16px', border: '2px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', color: '#4a5568', fontSize: 15 },
  optionSelected: { border: '2px solid #667eea', background: '#ebf4ff', color: '#3c366b', fontWeight: 600 },
  submitArea: { background: '#fff', borderRadius: 12, padding: 24, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  submitNote: { color: '#718096', marginBottom: 16 },
  btnSubmit: { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', padding: '12px 40px', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  resultCard: { background: '#fff', borderRadius: 16, padding: '48px 40px', textAlign: 'center', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' },
  scoreBox: { display: 'flex', gap: 24, justifyContent: 'center', margin: '24px 0', flexWrap: 'wrap' },
  scoreItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  scoreLabel: { color: '#718096', fontSize: 13 },
  scoreVal: { fontWeight: 700, fontSize: 22, color: '#2d3748' },
  btnPrimary: { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
};
