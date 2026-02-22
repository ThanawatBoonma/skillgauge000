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

// เรียกดึงประวัติการทำงานและจัดฟอร์แมต
exports.getTaskHistoryForPM = async (req, res) => {
    try {
        const history = await PMDashboard.getTaskHistoryAll();
        
        const formattedData = history.map(item => ({
            ...item,
            date_formatted: item.updated_at ? new Date(item.updated_at).toLocaleDateString('th-TH') : '-',
            photo_url: item.submission_photo ? `http://localhost:4000/uploads/${item.submission_photo}` : null
        }));

        res.json(formattedData);
    } catch (err) {
        console.error("Get Task History PM Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
};