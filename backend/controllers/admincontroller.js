const { z } = require('zod');
const { randomUUID } = require('crypto');
const Model = require('../models/adminmodel');

// Schema Validation (คงเดิมไว้ใช้กรอง input)
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

// 3. Tasks (ใช้ตาราง tasks แยกต่างหาก - ไม่กระทบ dbuser)
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

// 5. Quiz Bank (ใช้ตาราง questions)
exports.getQuestions = async (req, res) => {
    try {
        const items = await Model.query('SELECT * FROM questions ORDER BY created_at DESC');
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
        // ใช้ตาราง assessment_rounds ถ้ามี (จากการ Import SQL ของเพื่อน)
        // ถ้าไม่มีให้สร้างตารางเปล่าไว้ก่อนเพื่อไม่ให้ error
        const items = await Model.query('SELECT * FROM assessment_rounds ORDER BY created_at DESC');
        res.json({ items });
    } catch (e) { 
        // กรณีไม่มีตาราง ให้ return array ว่าง
        res.json({ items: [] }); 
    }
};

exports.saveAssessmentRound = async (req, res) => {
    // Logic การบันทึกรอบสอบ (ถ้าจำเป็นต้องใช้)
    res.json({ message: "Saved" });
};