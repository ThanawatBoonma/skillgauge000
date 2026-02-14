const { z } = require('zod');
const { randomUUID } = require('crypto');
const Model = require('./adminmodel'); // Import Model ที่เราสร้างตะกี้

// Schema สำหรับตรวจสอบข้อมูล (Validation)
const uuidSchema = z.string().uuid();
const taskListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  project_id: uuidSchema.optional(),
  assignee_id: uuidSchema.optional(),
  search: z.string().max(120).trim().optional()
});

// --- Controller Methods ---

// 1. Users (Admin Management List)
exports.getUsers = async (req, res) => {
    try {
        const { limit, offset, search } = req.query;
        const sql = `SELECT id, full_name, phone, email, status FROM users ${search ? 'WHERE full_name LIKE ?' : ''} LIMIT ? OFFSET ?`;
        const params = search ? [`%${search}%`, Number(limit || 50), Number(offset || 0)] : [Number(limit || 50), Number(offset || 0)];
        const items = await Model.query(sql, params);
        res.json({ items });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// 2. Workers Management (List & Delete & Status)
exports.getAllWorkers = async (req, res) => {
    try {
        // ดึงข้อมูลสำหรับตาราง AdminUsersTable
        // JOIN กับ worker_accounts เพื่อเอา email (ถ้ามี)
        const sql = `
            SELECT w.*, a.email 
            FROM workers w 
            LEFT JOIN worker_accounts a ON a.worker_id = w.id 
            ORDER BY w.id DESC
        `;
        const rows = await Model.query(sql);
        res.json({ items: rows });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error fetching workers' });
    }
};

exports.deleteWorker = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'ID required' });
        
        await Model.withTransaction(async conn => {
             await Model.execute('DELETE FROM workers WHERE id = ?', [id], conn);
             // Note: ถ้ามี FK ที่ไม่ได้ตั้ง CASCADE อาจต้องลบ table อื่นๆ ด้วย
        });
        
        res.json({ success: true, message: 'Worker deleted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error deleting worker' });
    }
};

exports.updateWorkerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g., 'permanent'
        await Model.execute('UPDATE workers SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, status });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error updating status' });
    }
};

exports.toggleAssessmentAccess = async (req, res) => {
    try {
        const { id } = req.params;
        const { enabled } = req.body;
        // สมมติว่าใน workers มี field assessment_enabled (ถ้าไม่มีต้องไปเพิ่มใน DB)
        await Model.execute('UPDATE workers SET assessment_enabled = ? WHERE id = ?', [enabled ? 1 : 0, id]);
        res.json({ success: true, assessment_enabled: enabled });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error toggling access' });
    }
};

// 3. Tasks
exports.getTasks = async (req, res) => {
    try {
        const params = taskListQuerySchema.parse(req.query);
        const filters = []; const values = [];
        if (params.status) { filters.push('t.status = ?'); values.push(params.status); }
        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const items = await Model.query(`SELECT t.*, p.name as project_name FROM tasks t JOIN projects p ON p.id = t.project_id ${where} LIMIT ? OFFSET ?`, [...values, params.limit, params.offset]);
        res.json({ items });
    } catch (e) { res.status(400).json({ message: 'Invalid query' }); }
};

exports.createTask = async (req, res) => {
    const id = randomUUID();
    await Model.execute('INSERT INTO tasks (id, title, project_id, status) VALUES (?,?,?,?)', [id, req.body.title, req.body.project_id, 'todo']);
    res.status(201).json({ id });
};

// 4. Audit Logs
exports.getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params = [];

        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }
        if (search) {
            query += ' AND (user LIKE ? OR action LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const items = await Model.query(query, params);
        
        // Count total for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1';
        const countParams = [];
        if (status && status !== 'all') { countQuery += ' AND status = ?'; countParams.push(status); }
        if (search) { countQuery += ' AND (user LIKE ? OR action LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
        
        const [countResult] = await Model.query(countQuery, countParams); 
        
        res.json({ items, total: countResult ? countResult.total : 0 });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error fetching logs' });
    }
};

// 5. Quiz Bank & Assessments (ระบบข้อสอบ)
exports.getQuestions = async (req, res) => {
    try {
        const items = await Model.query('SELECT * FROM questions ORDER BY created_at DESC');
        // ดึงตัวเลือกของแต่ละคำถาม
        for (const item of items) {
            item.options = await Model.query('SELECT text, is_correct FROM question_options WHERE question_id = ?', [item.id]);
        }
        res.json({ items });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createQuestion = async (req, res) => {
    const conn = await Model.pool.getConnection();
    try {
        await conn.beginTransaction();
        const id = randomUUID();
        const { text, category, subcategory, difficulty, options } = req.body;
        
        await Model.execute('INSERT INTO questions (id, text, category, subcategory, difficulty) VALUES (?,?,?,?,?)', [id, text, category, subcategory, difficulty], conn);
        
        if (options && Array.isArray(options)) {
            for (const opt of options) {
                await Model.execute('INSERT INTO question_options (id, question_id, text, is_correct) VALUES (UUID(), ?, ?, ?)', [id, opt.text, opt.is_correct ? 1 : 0], conn);
            }
        }
        
        await conn.commit();
        res.status(201).json({ id, message: 'Question created' });
    } catch (e) {
        await conn.rollback();
        console.error(e);
        res.status(500).json({ message: e.message });
    } finally {
        conn.release();
    }
};

exports.updateQuestion = async (req, res) => {
    const conn = await Model.pool.getConnection();
    try {
        await conn.beginTransaction();
        const { id } = req.params;
        const { text, category, subcategory, difficulty, options } = req.body;

        await Model.execute('UPDATE questions SET text=?, category=?, subcategory=?, difficulty=? WHERE id=?', [text, category, subcategory, difficulty, id], conn);
        
        // ลบ options เก่าแล้วใส่ใหม่ (ง่ายกว่าการไล่อัปเดตทีละอัน)
        await Model.execute('DELETE FROM question_options WHERE question_id=?', [id], conn);
        if (options && Array.isArray(options)) {
            for (const opt of options) {
                await Model.execute('INSERT INTO question_options (id, question_id, text, is_correct) VALUES (UUID(), ?, ?, ?)', [id, opt.text, opt.is_correct ? 1 : 0], conn);
            }
        }

        await conn.commit();
        res.json({ success: true });
    } catch (e) {
        await conn.rollback();
        console.error(e);
        res.status(500).json({ message: e.message });
    } finally {
        conn.release();
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        await Model.execute('DELETE FROM questions WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
};

exports.getAssessmentRounds = async (req, res) => {
    try {
        const items = await Model.query('SELECT * FROM assessment_rounds ORDER BY created_at DESC');
        res.json({ items });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.saveAssessmentRound = async (req, res) => {
    try {
        const id = req.params.id || randomUUID();
        const { 
            title, category, questionCount, passingScore, 
            description, frequencyMonths, durationMinutes, 
            showScore, showAnswers, showBreakdown, 
            subcategoryQuotas, difficultyWeights, criteria 
        } = req.body;

        // แปลง JSON object เป็น string ก่อนบันทึก
        const quotasStr = JSON.stringify(subcategoryQuotas || {});
        const weightsStr = JSON.stringify(difficultyWeights || {});
        const criteriaStr = JSON.stringify(criteria || {});

        if (req.method === 'POST') {
            await Model.execute(
                `INSERT INTO assessment_rounds 
                (id, title, category, question_count, passing_score, description, frequency_months, duration_minutes, show_score, show_answers, show_breakdown, subcategory_quotas, difficulty_weights, criteria, active) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`, 
                [id, title, category, questionCount, passingScore, description, frequencyMonths, durationMinutes, showScore, showAnswers, showBreakdown, quotasStr, weightsStr, criteriaStr]
            );
        } else {
            await Model.execute(
                `UPDATE assessment_rounds SET 
                title=?, category=?, question_count=?, passing_score=?, description=?, frequency_months=?, duration_minutes=?, show_score=?, show_answers=?, show_breakdown=?, subcategory_quotas=?, difficulty_weights=?, criteria=? 
                WHERE id=?`, 
                [title, category, questionCount, passingScore, description, frequencyMonths, durationMinutes, showScore, showAnswers, showBreakdown, quotasStr, weightsStr, criteriaStr, id]
            );
        }
        res.json({ id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
};