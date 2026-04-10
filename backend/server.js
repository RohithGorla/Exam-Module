const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');


require('./models/User');
require('./models/Exam');
require('./models/Question');
require('./models/ExamResult');

const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');
const miscRoutes = require('./routes/misc');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api', miscRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Exam Module API is running' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('✅ MySQL connected & tables synced');
    app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error(' DB connection failed:', err.message);
    process.exit(1);
  });
