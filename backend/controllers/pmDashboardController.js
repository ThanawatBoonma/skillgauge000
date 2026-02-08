// backend/controllers/pmDashboardController.js
const PMDashboard = require('../models/PMDashboard');

// 1. ดึง Stats
exports.getPMStats = async (req, res) => {
    try {
        const stats = await PMDashboard.getStats();
        res.json(stats);
    } catch (err) {
        console.error('Get PM Stats Error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 2. ดึงรายชื่อช่าง
exports.getWorkersListForPM = async (req, res) => {
    try {
        const workers = await PMDashboard.getWorkersList();
        res.json(workers);
    } catch (err) {
        console.error('Get Workers List Error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 3. สร้างงานประเมิน
exports.addTaskAssessment = async (req, res) => {
    try {
        // รับข้อมูลจาก Body
        const taskData = req.body; 
        await PMDashboard.createTask(taskData);
        res.json({ message: 'Success' });
    } catch (err) {
        console.error('Add Task Error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 4. ลบงาน
exports.deleteTaskAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        await PMDashboard.deleteTask(id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('Delete Task Error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};