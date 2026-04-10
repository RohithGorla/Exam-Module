const { validationResult } = require('express-validator');
const Question = require('../models/Question');
const Exam = require('../models/Exam');

// GET /api/exams/:examId/questions
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { examId: req.params.examId },
      order: [['id', 'ASC']],
    });
    res.json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/exams/:examId/questions
const addQuestion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const exam = await Exam.findByPk(req.params.examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, marks } = req.body;
    const question = await Question.create({
      examId: req.params.examId,
      questionText, optionA, optionB, optionC, optionD, correctAnswer,
      marks: marks || 1,
    });
    res.status(201).json({ success: true, message: 'Question added', data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/questions/:id
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, marks } = req.body;
    await question.update({ questionText, optionA, optionB, optionC, optionD, correctAnswer, marks });
    res.json({ success: true, message: 'Question updated', data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/questions/:id
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    await question.destroy();
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getQuestions, addQuestion, updateQuestion, deleteQuestion };
