const express = require('express');
const router = express.Router();

// 1. เพิ่ม getProjectById ในบรรทัดนี้
const { getMyProjects, createProject, updateProject, deleteProject, getProjectById } = require('../controllers/manageprojectController');

// GET /api/manageproject/all?user_id=...
router.get('/all', getMyProjects);

// 2. เพิ่ม Route นี้
router.get('/get/:id', getProjectById);

// POST /api/manageproject/add
router.post('/add', createProject);

// PUT /api/manageproject/update/:id
router.put('/update/:id', updateProject);

// DELETE /api/manageproject/delete/:id
router.delete('/delete/:id', deleteProject);

module.exports = router;