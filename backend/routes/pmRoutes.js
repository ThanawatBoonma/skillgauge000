const express = require('express');
const router = express.Router();
const { getPMStats, getWorkersListForPM, addTaskAssessment, deleteTaskAssessment } = require('../controllers/pmDashboardController');

router.get('/stats', getPMStats);
router.get('/workers-status', getWorkersListForPM);
router.post('/task/add', addTaskAssessment);
router.delete('/task/:id', deleteTaskAssessment);

module.exports = router;