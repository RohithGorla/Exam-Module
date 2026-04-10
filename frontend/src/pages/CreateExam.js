import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExam } from '../services/api';

export default function CreateExam() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', duration: 60, totalMarks: 100, passingMarks: 40 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (parseInt(form.passingMarks) > parseInt(form.totalMarks)) {
      return setError('Passing marks cannot exceed total marks');
    }
    setLoading(true);
    try {
      const res = await createExam(form);
      navigate(`/admin/exam/${res.data.data.id}/questions`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button style={styles.back} onClick={() => navigate('/admin')}>← Back</button>
        <h2 style={styles.title}>Create New Exam</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <Field label="Exam Title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. JavaScript Fundamentals" required />
          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              style={{ ...styles.input, height: 80, resize: 'vertical' }} placeholder="Optional description" />
          </div>
          <div style={styles.row}>
            <Field label="Duration (minutes)" name="duration" type="number" value={form.duration} onChange={handleChange} min="1" required />
            <Field label="Total Marks" name="totalMarks" type="number" value={form.totalMarks} onChange={handleChange} min="1" required />
            <Field label="Passing Marks" name="passingMarks" type="number" value={form.passingMarks} onChange={handleChange} min="1" required />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Creating...' : 'Create Exam & Add Questions →'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder, required, min }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange}
        style={styles.input} placeholder={placeholder} required={required} min={min} />
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' },
  back: { background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: 600, marginBottom: 16, padding: 0 },
  title: { color: '#1a202c', marginBottom: 24, fontSize: 22 },
  error: { background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
  field: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 6, fontWeight: 600, color: '#4a5568', fontSize: 14 },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#2d3748' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  btn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
};
