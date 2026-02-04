const ManageProject = require('../models/ManageProject');

// ดึงรายชื่อโปรเจค (ของ User ที่ Login อยู่)
exports.getMyProjects = async (req, res) => {
    // สมมติว่า user_id ถูกส่งมาทาง query หรือ body (หรือถ้าระบบ Auth ดีๆ จะมาจาก req.user.id)
    // ในที่นี้รับจาก query string เพื่อความง่ายในการเชื่อมต่อกับ frontend ปัจจุบัน
    const { user_id } = req.query; 
    
    if (!user_id) return res.status(400).json({ error: 'User ID is required' });

    try {
        const projects = await ManageProject.findAllByManager(user_id);
        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// สร้างโปรเจคใหม่
exports.createProject = async (req, res) => {
    try {
        const result = await ManageProject.create(req.body);
        res.status(201).json({ message: 'Project created', pj_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// แก้ไขโปรเจค
exports.updateProject = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await ManageProject.update(id, req.body);
        if (!success) return res.status(404).json({ error: 'Project not found' });
        res.json({ message: 'Project updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// ลบโปรเจค
exports.deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await ManageProject.delete(id);
        if (!success) return res.status(404).json({ error: 'Project not found' });
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await ManageProject.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};