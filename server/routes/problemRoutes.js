// routes/problemRoutes.js
const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

router.get('/', problemController.getAllProblems);
router.get('/:id', problemController.getProblemById);
router.post('/:id/run', problemController.runProblemById);
router.post('/:id/submit', problemController.submitProblemById);

module.exports = router;
