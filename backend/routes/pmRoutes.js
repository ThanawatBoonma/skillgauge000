const express = require('express');
const router = express.Router();
const { getPMStats, getWorkersListForPM, addTaskAssessment, deleteTaskAssessment, getTaskHistoryForPM } = require('../controllers/pmDashboardController');

router.get('/stats', getPMStats);
router.get('/workers-status', getWorkersListForPM);
router.post('/task/add', addTaskAssessment);
router.delete('/task/:id', deleteTaskAssessment);
router.get('/task-history', getTaskHistoryForPM);

module.exports = router;