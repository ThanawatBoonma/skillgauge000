const WorkerDashboard = require('../models/WorkerDashboard');

exports.getWorkerDashboardData = async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });

    try {
        const assignedTask = await WorkerDashboard.getAssignedTask(user_id);
        const skillData = await WorkerDashboard.getSkillLevel(user_id);

        let skillLevel = 0;
        if (skillData && skillData.skill_level) {
            const levelStr = String(skillData.skill_level).replace(/\D/g, ''); 
            skillLevel = parseInt(levelStr) || 0;
        }

        res.json({ assignedTask, skillLevel });

    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// ✅ เพิ่มฟังก์ชันส่งงาน
exports.submitTaskWork = async (req, res) => {
    try {
        const { task_id } = req.body;
        const filename = req.file ? req.file.filename : null; // ชื่อไฟล์จาก Multer

        if (!task_id) return res.status(400).json({ error: 'Task ID is required' });

        await WorkerDashboard.updateTaskSubmission(task_id, filename);

        res.json({ message: 'ส่งงานเรียบร้อยแล้ว', photo: filename });

    } catch (err) {
        console.error('Submit Task Error:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งงาน' });
    }
};