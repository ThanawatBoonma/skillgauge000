// controllers/managequestionController.js
const ManageQuestion = require('../models/ManageQuestion');

// ดึงรายการข้อสอบทั้งหมด
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await ManageQuestion.findAll();
    res.json(questions);
  } catch (err) {
    console.error('Get Questions Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// เพิ่มข้อสอบ (รองรับทั้งแบบข้อเดียว และหลายข้อพร้อมกัน)
exports.addQuestions = async (req, res) => {
  // คาดหวัง body เป็น Array ของ Objects: [ { question_text: "...", ... }, ... ]
  let questionsData = req.body;

  // ถ้าส่งมาเป็น object เดียว ให้แปลงเป็น array
  if (!Array.isArray(questionsData)) {
    questionsData = [questionsData];
  }

  if (questionsData.length === 0) {
    return res.status(400).json({ error: 'No data provided' });
  }

  try {
    // แปลง Data ให้เป็น Format array of arrays เพื่อส่งเข้า Model
    const values = questionsData.map(q => [
      q.question_text,
      q.choice_a,
      q.choice_b,
      q.choice_c,
      q.choice_d,
      q.answer,
      q.difficulty_level,
      q.skill_type || null // ถ้าไม่มีให้เป็น null
    ]);

    const result = await ManageQuestion.createBulk(values);
    
    res.status(201).json({ 
      message: `Successfully added ${result.affectedRows} questions` 
    });

  } catch (err) {
    console.error('Add Questions Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// แก้ไขข้อสอบ
exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  
  try {
    const success = await ManageQuestion.update(id, req.body);
    
    if (!success) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json({ message: 'Question updated successfully' });
  } catch (err) {
    console.error('Update Question Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ลบข้อสอบ
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const success = await ManageQuestion.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Delete Question Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};