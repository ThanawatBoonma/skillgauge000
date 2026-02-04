const express = require('express');
const router = express.Router();
const { createTask, recommendWorkers, assignWorkers, getTasksByProject } = require('../controllers/manageprojecttaskController');

router.post('/create', createTask);
router.post('/recommend', recommendWorkers);
router.post('/assign', assignWorkers);

router.get('/project/:id', getTasksByProject);

module.exports = router;