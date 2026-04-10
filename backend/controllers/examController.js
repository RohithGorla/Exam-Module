const { validationResult } = require('express-validator');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const User = require('../models/User');

// GET /api/exams
const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/exams/:id
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Question, as: 'questions' },
      ],
    });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/exams
const createExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { title, description, duration, totalMarks, passingMarks } = req.body;
    const exam = await Exam.create({
      title, description, duration, totalMarks, passingMarks,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, message: 'Exam created', data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/exams/:id
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const { title, description, duration, totalMarks, passingMarks, isActive } = req.body;
    await exam.update({ title, description, duration, totalMarks, passingMarks, isActive });
    res.json({ success: true, message: 'Exam updated', data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/exams/:id
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    await Question.destroy({ where: { examId: exam.id } });
    await exam.destroy();
    res.json({ success: true, message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllExams, getExamById, createExam, updateExam, deleteExam };
