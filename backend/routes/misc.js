const express = require('express');
const router = express.Router();
const { updateQuestion, deleteQuestion } = require('../controllers/questionController');
const { getMyResults, getAllResults, getAnalytics } = require('../controllers/resultController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Question management (admin)
router.put('/questions/:id', authenticate, authorizeAdmin, updateQuestion);
router.delete('/questions/:id', authenticate, authorizeAdmin, deleteQuestion);

// Results
router.get('/results', authenticate, authorizeAdmin, getAllResults);
router.get('/results/my', authenticate, getMyResults);
router.get('/results/analytics', authenticate, authorizeAdmin, getAnalytics);

module.exports = router;
