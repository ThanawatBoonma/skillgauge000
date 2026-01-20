const SkillAssessmentTest = require('../models/SkillAssessmentTest');

// GET /api/skillAssessment/test (เหมือนเดิม)
exports.getAssessmentExam = async (req, res) => {
    try {
        const [level1, level2, level3] = await Promise.all([
            SkillAssessmentTest.getRandomQuestionsByLevel(1, 24),
            SkillAssessmentTest.getRandomQuestionsByLevel(2, 24),
            SkillAssessmentTest.getRandomQuestionsByLevel(3, 12)
        ]);

        const allQuestions = [...level1, ...level2, ...level3];
        const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

        // ... (ส่วนนับหมวดหมู่เหมือนเดิม)

        res.json({
            total: shuffledQuestions.length,
            questions: shuffledQuestions
        });

    } catch (err) {
        console.error('Get Skill Assessment Error:', err);
        res.status(500).json({ error: 'Server error while fetching questions' });
    }
};

// POST /api/skillAssessment/submit (ปรับปรุงใหม่: ไม่ส่งคะแนนกลับ)
exports.submitAssessment = async (req, res) => {
    const { answers, user_id } = req.body; 

    if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({ error: 'No answers provided' });
    }

    try {
        const questionIds = Object.keys(answers);
        const correctAnswersDB = await SkillAssessmentTest.getCorrectAnswers(questionIds);
        
        const answerMap = {};
        correctAnswersDB.forEach(row => {
            answerMap[row.id] = row.answer;
        });

        let rawScore = 0; 
        const totalQuestions = 60; 

        for (const [qid, userAns] of Object.entries(answers)) {
            if (answerMap[qid] && answerMap[qid].toUpperCase() === String(userAns).toUpperCase()) {
                rawScore++;
            }
        }

        // คำนวณคะแนนทฤษฎีเต็ม 70
        const theoryScore = (rawScore / totalQuestions) * 70;

        // บันทึกลง DB
        if (user_id) {
            await SkillAssessmentTest.saveAssessmentResult(user_id, theoryScore);
        }

        // ตอบกลับแค่ว่าสำเร็จ (ไม่ส่ง score, percentage กลับไป)
        res.json({
            message: "Submission successful",
            status: "completed"
        });

    } catch (err) {
        console.error('Submit Assessment Error:', err);
        res.status(500).json({ error: 'Server error while grading' });
    }
};