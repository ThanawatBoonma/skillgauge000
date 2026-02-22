const WorkerDashboard = require('../models/WorkerDashboard');

exports.getWorkerDashboardData = async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });

    try {
        const assignedTask = await WorkerDashboard.getAssignedTask(user_id);
        const skillData = await WorkerDashboard.getSkillLevel(user_id);

        let skillLevel = 0;
        
        // ✅ แก้จุดนี้ครับ: เช็ค skillData.LV แทน skill_level
        if (skillData && skillData.LV) {
            // แปลงค่า ENUM '1' เป็น int 1
            skillLevel = parseInt(skillData.LV);
        }

        res.json({ assignedTask, skillLevel });

    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// ✅ เพิ่มฟังก์ชัน API สำหรับหน้า History
exports.getWorkerHistoryData = async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });

    try {
        const history = await WorkerDashboard.getAssessmentHistory(user_id);
        res.json(history);
    } catch (err) {
        console.error("History Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// (ฟังก์ชัน submitTaskWork เดิม)
exports.submitTaskWork = async (req, res) => {
    try {
        const { task_id } = req.body;
        const filename = req.file ? req.file.filename : null;

        if (!task_id) return res.status(400).json({ error: 'Task ID is required' });

        await WorkerDashboard.updateTaskSubmission(task_id, filename);

        res.json({ message: 'ส่งงานเรียบร้อยแล้ว', photo: filename });

    } catch (err) {
        console.error('Submit Task Error:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งงาน' });
    }
};

// ✅ API ใหม่: สำหรับหน้าประวัติงานของช่าง
exports.getWorkerTaskHistoryList = async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });

    try {
        const history = await WorkerDashboard.getWorkerTaskHistory(user_id);
        
        const formattedData = history.map(item => ({
            ...item,
            date_formatted: item.updated_at ? new Date(item.updated_at).toLocaleDateString('th-TH') : '-',
            photo_url: item.submission_photo ? `http://localhost:4000/uploads/${item.submission_photo}` : null
        }));

        res.json(formattedData);
    } catch (err) {
        console.error("Worker Task History Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// ✅ อัปเดต API: เช็คระยะเวลารอคอย (จาก worker_level)
exports.checkTestCooldown = async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });

    try {
        const waitDays = await WorkerDashboard.getWaitTimeConfig();
        
        // ✅ เรียกใช้ฟังก์ชันที่ดึงจากตาราง worker_level
        const lastDateStr = await WorkerDashboard.getLastLevelUpdateDate(user_id);

        // ถ้าไม่เคยมีประวัติใน worker_level เลย (ไม่เคยสอบ) อนุญาตให้สอบได้
        if (!lastDateStr) {
            return res.json({ canTest: true });
        }

        const lastUpdateDate = new Date(lastDateStr);
        const currentDate = new Date();
        
        // คำนวณความต่างของเวลาเป็น "วัน"
        const diffTime = currentDate.getTime() - lastUpdateDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // ถ้าจำนวนวันที่ผ่านไป น้อยกว่าจำนวนวันที่ต้องรอ
        if (diffDays < waitDays) {
            const daysLeft = waitDays - diffDays;
            return res.json({ canTest: false, daysLeft: daysLeft });
        }

        res.json({ canTest: true });

    } catch (err) {
        console.error("Check Cooldown Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
};