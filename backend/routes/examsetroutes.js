const express = require('express');
const router = express.Router();
const { getExamSet, updateExamSet } = require('../controllers/examsetController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.get('/:level', getExamSet);
router.post('/:level', updateExamSet);

module.exports = router;