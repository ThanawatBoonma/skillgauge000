const ManageQuestion = require('../models/ManageQuestion');

// ดึงรายการข้อสอบทั้งหมด
exports.getAllQuestions = async (req, res) => {
  try {
    // รับ query param ?category=structure
    const category = req.query.category || 'structure'; 
    const questions = await ManageQuestion.findAll(category);
    res.json(questions);
  } catch (err) {
    console.error('Get Questions Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// เพิ่มข้อสอบ
exports.addQuestions = async (req, res) => {
  let questionsData = req.body;
  if (!Array.isArray(questionsData)) questionsData = [questionsData];
  if (questionsData.length === 0) return res.status(400).json({ error: 'No data provided' });

  // รับ category จาก body ตัวแรก (สมมติว่าเพิ่มทีละหมวดหมู่)
  const category = questionsData[0].category || 'structure';

  try {
    const values = questionsData.map(q => [
      q.question_text, q.choice_a, q.choice_b, q.choice_c, q.choice_d,
      q.answer, q.difficulty_level, q.skill_type || 'general'
    ]);

    const result = await ManageQuestion.createBulk(values, category);
    res.status(201).json({ message: `Added ${result.affectedRows} questions to ${category}` });
  } catch (err) {
    console.error('Add Questions Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// แก้ไขข้อสอบ
exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  const category = req.body.category || 'structure'; // ต้องส่ง category มาด้วยตอนแก้
  
  try {
    const success = await ManageQuestion.update(id, req.body, category);
    if (!success) return res.status(404).json({ error: 'Question not found' });
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ลบข้อสอบ
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  const category = req.query.category || 'structure'; // รับจาก query param

  try {
    const success = await ManageQuestion.delete(id, category);
    if (!success) return res.status(404).json({ error: 'Question not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ดึง Setting ของ Level นั้นๆ
exports.getExamSetting = async (req, res) => {
  const { level } = req.params; // รับค่า 1, 2, 3
  try {
    const setting = await ManageQuestion.getSettingByLevel(level);
    // ถ้ายังไม่มีใน DB ให้ส่งค่า Default ไป
    if (!setting) {
      return res.json({ 
        difficulty_level: level, 
        passing_score: 60, 
        question_count: 60, 
        duration_minutes: 60 
      });
    }
    res.json(setting);
  } catch (err) {
    console.error('Get Setting Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// บันทึก Setting
exports.saveExamSetting = async (req, res) => {
  try {
    // data body: { difficulty_level: '1', passing_score: 80, ... }
    await ManageQuestion.saveSetting(req.body);
    res.json({ message: 'Exam setting saved successfully' });
  } catch (err) {
    console.error('Save Setting Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};