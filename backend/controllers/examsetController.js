const ExamSet = require('../models/examsetModel');

// GET: ดึงค่าตาม Level
exports.getExamSet = async (req, res) => {
  const { level } = req.params;
  try {
    const data = await ExamSet.getByLevel(level);
    if (!data) {
        // ถ้าหาไม่เจอ ให้คืนค่า Default 0 ไปก่อน (กัน Error)
        return res.json({ 
            level, rebar_percent: 0, concrete_percent: 0, 
            formwork_percent: 0, element_percent: 0, theory_percent: 0 
        });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST: บันทึกค่า
exports.updateExamSet = async (req, res) => {
  const { level } = req.params;
  try {
    // req.body ควรส่งมาเป็น { rebar_percent: 20, ... }
    await ExamSet.update(level, req.body);
    res.json({ message: 'Saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};