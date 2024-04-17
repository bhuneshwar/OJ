// routes/problemRoutes.js
const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.verifyToken, problemController.getAllProblems);
router.get('/:id', authMiddleware.verifyToken, problemController.getProblemById);
router.post('/:id/run', authMiddleware.verifyToken, problemController.runProblemById);
router.post('/:id/submit', authMiddleware.verifyToken, problemController.submitProblemById);

module.exports = router;
