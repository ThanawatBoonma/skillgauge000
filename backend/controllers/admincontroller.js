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
