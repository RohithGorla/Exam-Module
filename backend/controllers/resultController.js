const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const User = require('../models/User');

// POST /api/exams/:examId/submit  — auto score calculation
const submitExam = async (req, res) => {
  try {
    const { answers } = req.body; // { "questionId": "A", ... }
    const examId = req.params.examId;

    const exam = await Exam.findByPk(examId, {
      include: [{ model: Question, as: 'questions' }],
    });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    // Check if already submitted
    const existing = await ExamResult.findOne({ where: { userId: req.user.id, examId } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already submitted this exam' });
    }

    // Auto-calculate score
    let score = 0;
    exam.questions.forEach((q) => {
      if (answers[q.id] && answers[q.id] === q.correctAnswer) {
        score += q.marks;
      }
    });

    const totalMarks = exam.totalMarks;
    const percentage = parseFloat(((score / totalMarks) * 100).toFixed(2));
    const passed = score >= exam.passingMarks;

    const result = await ExamResult.create({
      userId: req.user.id,
      examId,
      score,
      totalMarks,
      percentage,
      passed,
      answers,
    });

    res.status(201).json({
      success: true,
      message: 'Exam submitted successfully',
      data: {
        score,
        totalMarks,
        percentage,
        passed,
        resultId: result.id,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/results/my  — student's own results
const getMyResults = async (req, res) => {
  try {
    const results = await ExamResult.findAll({
      where: { userId: req.user.id },
      include: [{ model: Exam, as: 'exam', attributes: ['id', 'title', 'totalMarks'] }],
      order: [['submittedAt', 'DESC']],
    });
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/results  — admin: all results
const getAllResults = async (req, res) => {
  try {
    const results = await ExamResult.findAll({
      include: [
        { model: Exam, as: 'exam', attributes: ['id', 'title'] },
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
      ],
      order: [['submittedAt', 'DESC']],
    });
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/results/analytics  — admin analytics
const getAnalytics = async (req, res) => {
  try {
    const totalExams = await Exam.count();
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalSubmissions = await ExamResult.count();
    const passed = await ExamResult.count({ where: { passed: true } });
    const failed = totalSubmissions - passed;

    const recentResults = await ExamResult.findAll({
      limit: 5,
      order: [['submittedAt', 'DESC']],
      include: [
        { model: User, as: 'student', attributes: ['name'] },
        { model: Exam, as: 'exam', attributes: ['title'] },
      ],
    });

    res.json({
      success: true,
      data: {
        totalExams,
        totalStudents,
        totalSubmissions,
        passed,
        failed,
        passRate: totalSubmissions > 0 ? ((passed / totalSubmissions) * 100).toFixed(1) : 0,
        recentResults,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitExam, getMyResults, getAllResults, getAnalytics };
