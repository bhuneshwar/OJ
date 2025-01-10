// routes/problemRoutes.js
const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { verifyToken } = require('../middleware/authMiddleware');

// Problem routes
router.get('/', verifyToken, problemController.getAllProblems);
router.get('/:id', verifyToken, problemController.getProblemById);
router.post('/:id/run', verifyToken, problemController.runProblemById);
router.post('/:id/submit', verifyToken, problemController.submitProblemById);

// Solution routes
router.get('/:id/solutions', verifyToken, problemController.getSolutionsByProblemId);
router.get('/solutions/user', verifyToken, problemController.getUserSolutions);
router.get('/:id/solutions/user', verifyToken, problemController.getUserSolutionForProblem);

module.exports = router;
