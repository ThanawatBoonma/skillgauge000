const SkillAssessmentTest = require('../models/SkillAssessmentTest');

// GET /api/skillAssessment/test
exports.getAssessmentExam = async (req, res) => {
    try {
        // ดึงข้อสอบตามสัดส่วนระดับความยาก
        // Level 1: 24 ข้อ
        // Level 2: 24 ข้อ
        // Level 3: 12 ข้อ
        // รวม = 60 ข้อ
        const [level1, level2, level3] = await Promise.all([
            SkillAssessmentTest.getRandomQuestionsByLevel(1, 24),
            SkillAssessmentTest.getRandomQuestionsByLevel(2, 24),
            SkillAssessmentTest.getRandomQuestionsByLevel(3, 12)
        ]);

        // นำข้อสอบมารวมกัน
        const allQuestions = [...level1, ...level2, ...level3];

        // สลับลำดับข้อสอบทั้งหมด (Shuffle) เพื่อไม่ให้เรียงตาม Level
        const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

        // นับจำนวนข้อแยกตามหมวดหมู่เพื่อตรวจสอบ (Optional: ส่งไปให้ Frontend ดูได้)
        const categoryCount = {};
        shuffledQuestions.forEach(q => {
            const type = q.skill_type || 'Uncategorized';
            categoryCount[type] = (categoryCount[type] || 0) + 1;
        });

        res.json({
            total: shuffledQuestions.length,
            structure_info: {
                level_1: level1.length,
                level_2: level2.length,
                level_3: level3.length
            },
            category_distribution: categoryCount, // ให้เห็นว่าได้หัวข้อครบตามต้องการหรือไม่
            questions: shuffledQuestions
        });

    } catch (err) {
        console.error('Get Skill Assessment Error:', err);
        res.status(500).json({ error: 'Server error while fetching questions' });
    }
};

// POST /api/skillAssessment/submit
exports.submitAssessment = async (req, res) => {
    const { answers, user_id } = req.body; 
    // answers example: { "1": "A", "2": "B" }

    if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({ error: 'No answers provided' });
    }

    try {
        const questionIds = Object.keys(answers);
        
        // ดึงเฉลย
        const correctAnswersDB = await SkillAssessmentTest.getCorrectAnswers(questionIds);
        
        const answerMap = {};
        correctAnswersDB.forEach(row => {
            answerMap[row.id] = row.answer;
        });

        let score = 0;
        const total = 60; // คะแนนเต็มตามจำนวนข้อที่กำหนด

        for (const [qid, userAns] of Object.entries(answers)) {
            if (answerMap[qid] && answerMap[qid].toUpperCase() === String(userAns).toUpperCase()) {
                score++;
            }
        }

        const percent = (score / total) * 100;

        // บันทึกผลสอบ (ถ้าต้องการ)
        // await SkillAssessmentTest.saveAssessmentResult(user_id, score, total, percent);

        res.json({
            score: score,
            total: total,
            percentage: parseFloat(percent.toFixed(2)),
            description: `ผลการประเมิน: ${score}/${total} (${percent.toFixed(2)}%)`
        });

    } catch (err) {
        console.error('Submit Assessment Error:', err);
        res.status(500).json({ error: 'Server error while grading' });
    }
};