const express = require('express');
const router = express.Router();

// Import Controller 
const { 
  getAllPersonnel, 
  updatePersonnel, 
  deletePersonnel 
} = require('../controllers/manageuserController'); 

// Import Middleware
const { protect, adminOnly } = require('../middleware/authMiddleware');

// บังคับว่าทุก Route ในไฟล์นี้ต้อง Login และเป็น Admin
router.use(protect);
router.use(adminOnly);

// Route: GET /api/manageusers/pulluser
router.get('/pulluser/', getAllPersonnel);

// Route: PUT /api/manageusers/updateuser/:id 
router.put('/updateuser/:id', updatePersonnel);

// Route: DELETE /api/manageusers/deleteuser/:id
router.delete('/deleteuser/:id', deletePersonnel);

module.exports = router;