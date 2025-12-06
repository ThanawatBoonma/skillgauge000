const Quiz = require('../models/Quiz');

//ดึงข้อสอบ
exports.getExamPaper = async (req, res) => {
    try {
    const [level1, level2, level3] = await Promise.all([
        Quiz.getRandomQuestionsByLevel(1, 24), 
        Quiz.getRandomQuestionsByLevel(2, 24), 
        Quiz.getRandomQuestionsByLevel(3, 12)  
    ]);

    // รวมข้อสอบทั้งหมดเข้าด้วยกัน
    const allQuestions = [...level1, ...level2, ...level3];

    // สลับข้อ
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

    res.json({
        total: shuffledQuestions.length,
        questions: shuffledQuestions
    });

    } catch (err) {
        console.error('Get Exam Error:', err);
        res.status(500).json({ error: 'Server error while fetching questions' });
    }
};

// ส่งคำตอบและประเมินผล
exports.submitExam = async (req, res) => {
    // รับข้อมูลรูปแบบ: { "answers": { "101": "A", "102": "B" } } 
    const { answers } = req.body; 
  
    if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({ error: 'No answers provided' });
    }

    try {
        const questionIds = Object.keys(answers);
        
        // ดึงเฉลยจาก Database
        const correctAnswersDB = await Quiz.getCorrectAnswers(questionIds);

        // แปลงเฉลยเป็น Map { 101: 'A', 102: 'C' }
        const answerMap = {};
        correctAnswersDB.forEach(row => {
            answerMap[row.id] = row.answer;
        });

    let score = 0;
    const total = 60; 

    // ตรวจคำตอบ
    for (const [qid, userAns] of Object.entries(answers)) {
        // เทียบคำตอบ 
        if (answerMap[qid] && answerMap[qid].toUpperCase() === String(userAns).toUpperCase()) {
        score++;
        }
    }

    const percent = (score / total) * 100;

    //const savedId = await Quiz.saveQuizResult(user_id || null, score, total, percent);

    res.json({
        //result_id: savedId,
        score: score,
        total: total,
        percentage: parseFloat(percent.toFixed(2)), 
        description: `คุณได้คะแนน ${score} เต็ม ${total} (${percent.toFixed(2)}%)`
    });

    } catch (err) {
        console.error('Submit Exam Error:', err);
        res.status(500).json({ error: 'Server error while grading' });
    }
};