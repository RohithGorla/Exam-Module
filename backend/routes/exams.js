const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAllExams, getExamById, createExam, updateExam, deleteExam } = require('../controllers/examController');
const { getQuestions, addQuestion } = require('../controllers/questionController');
const { submitExam } = require('../controllers/resultController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const examValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('totalMarks').isInt({ min: 1 }).withMessage('Total marks required'),
  body('passingMarks').isInt({ min: 1 }).withMessage('Passing marks required'),
];

const questionValidation = [
  body('questionText').trim().notEmpty().withMessage('Question text required'),
  body('optionA').trim().notEmpty().withMessage('Option A required'),
  body('optionB').trim().notEmpty().withMessage('Option B required'),
  body('correctAnswer').isIn(['A', 'B', 'C', 'D']).withMessage('Correct answer must be A, B, C, or D'),
];

router.get('/', authenticate, getAllExams);
router.get('/:id', authenticate, getExamById);
router.post('/', authenticate, authorizeAdmin, examValidation, createExam);
router.put('/:id', authenticate, authorizeAdmin, updateExam);
router.delete('/:id', authenticate, authorizeAdmin, deleteExam);

router.get('/:examId/questions', authenticate, getQuestions);
router.post('/:examId/questions', authenticate, authorizeAdmin, questionValidation, addQuestion);

router.post('/:examId/submit', authenticate, submitExam);

module.exports = router;
