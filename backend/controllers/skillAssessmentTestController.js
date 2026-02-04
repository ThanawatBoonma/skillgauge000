const SkillAssessmentTest = require('../models/SkillAssessmentTest');

exports.getAssessmentExam = async (req, res) => {
    try {
        const config = await SkillAssessmentTest.getExamStructureConfig();
        
        if (!config) {
            return res.status(500).json({ error: 'Exam configuration not found' });
        }

        const totalQuestions = config.total_questions || 60;
        
        // คำนวณจำนวนข้อ (Logic เดิม)
        const qLevel1 = Math.round((config.level_1_percent / 100) * totalQuestions);
        const qLevel2 = Math.round((config.level_2_percent / 100) * totalQuestions);
        const qLevel3 = totalQuestions - qLevel1 - qLevel2;

        const [level1, level2, level3] = await Promise.all([
            SkillAssessmentTest.getRandomQuestionsByLevel(1, qLevel1),
            SkillAssessmentTest.getRandomQuestionsByLevel(2, qLevel2),
            SkillAssessmentTest.getRandomQuestionsByLevel(3, qLevel3)
        ]);

        const allQuestions = [...level1, ...level2, ...level3];
        const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

        // [แก้ไข] ส่งค่า Config ทั้งหมดกลับไป เพื่อให้ Frontend เอาไปแสดงตาราง
        res.json({
            exam_config: config, // ส่งทั้ง object (มี duration, percent ต่างๆ ครบ)
            questions: shuffledQuestions
        });

    } catch (err) {
        console.error('Get Skill Assessment Error:', err);
        res.status(500).json({ error: 'Server error while fetching questions' });
    }
};

// ... ส่วน submitAssessment เหมือนเดิม ...
exports.submitAssessment = async (req, res) => {
    // (ใช้โค้ดเดิมจากรอบที่แล้วได้เลยครับ ไม่ต้องแก้ส่วนนี้)
    const { answers, user_id } = req.body; 

    console.log(`User ID: ${user_id}, Answers Received:`, answers);

    const submittedAnswers = answers || {}; 

    try {
        const questionIds = Object.keys(submittedAnswers);
        let correctAnswersDB = [];
        if (questionIds.length > 0) {
            correctAnswersDB = await SkillAssessmentTest.getCorrectAnswers(questionIds);
        }
        
        const answerMap = {};
        correctAnswersDB.forEach(row => {
            answerMap[row.id] = row.answer;
        });

        let rawScore = 0; 
        const totalQuestions = 60; 

        for (const [qid, userAns] of Object.entries(submittedAnswers)) {
            if (answerMap[qid] && answerMap[qid].toUpperCase() === String(userAns).toUpperCase()) {
                rawScore++;
            }
        }

        const theoryScore = (rawScore / totalQuestions) * 70;

        if (user_id) {
            await SkillAssessmentTest.saveAssessmentResult(user_id, theoryScore);
        }

        res.json({ message: "Submission successful" });

    } catch (err) {
        console.error('Submit Assessment Error:', err);
        res.status(500).json({ error: 'Server error while grading' });
    }
};