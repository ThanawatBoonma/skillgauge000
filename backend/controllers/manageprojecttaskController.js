const ManageProjectTask = require('../models/ManageProjectTask');

// สร้างงานย่อย
exports.createTask = async (req, res) => {
    try {
        const taskId = await ManageProjectTask.createTask(req.body);
        res.status(201).json({ message: 'Task created', pj_t_id: taskId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// แนะนำช่างและจัดลำดับ (Ranking Logic)
exports.recommendWorkers = async (req, res) => {
    const { technician_type, priority } = req.body;
    try {
        let workers = await ManageProjectTask.findWorkersByType(technician_type);
        
        // แปลง skill_level เป็น int (เผื่อเป็น string จาก DB)
        workers = workers.map(w => ({...w, skill_level: parseInt(w.skill_level || 0)}));

        let sortedWorkers = [];

        if (priority === 'ทั่วไป') {
            // เรียงลำดับ: 0 (รอประเมิน), 1, 2, 3
            // Logic: เอา 0 ไว้ก่อน แล้วตามด้วย 1,2,3
            sortedWorkers = workers.sort((a, b) => {
                if (a.skill_level === 0 && b.skill_level !== 0) return -1;
                if (a.skill_level !== 0 && b.skill_level === 0) return 1;
                return a.skill_level - b.skill_level; // น้อยไปมาก
            });
        } else if (priority === 'ชำนาญ') {
            // เรียง: 3, 2, 1 (ไม่เอา 0)
            sortedWorkers = workers
                .filter(w => w.skill_level > 0)
                .sort((a, b) => b.skill_level - a.skill_level); // มากไปน้อย
        } else if (priority === 'ชำนาญงานพิเศษ') {
            // เรียง: 3, 2 (ไม่เอา 0, 1)
            sortedWorkers = workers
                .filter(w => w.skill_level >= 2)
                .sort((a, b) => b.skill_level - a.skill_level); // มากไปน้อย
        }

        res.json(sortedWorkers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// บันทึกการมอบหมายงาน
exports.assignWorkers = async (req, res) => {
    const { pj_t_id, user_ids } = req.body; // user_ids เป็น array [1, 2, 3]
    try {
        await ManageProjectTask.assignWorkers(pj_t_id, user_ids);
        res.json({ message: 'Workers assigned successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getTasksByProject = async (req, res) => {
    try {
        const { id } = req.params;
        const tasks = await ManageProjectTask.findByProjectId(id);
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};