const express = require('express');
const router = express.Router();
const { getUserProfile, updatePassword } = require('../controllers/settingController');

router.get('/profile', getUserProfile);
router.post('/password', updatePassword);

module.exports = router;