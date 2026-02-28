const SkillAssessmentTest = require('../models/SkillAssessmentTest');
const pool = require('../config/db'); // เรียก pool มาใช้ query เช็คสถานะ

// ✅ 1. เพิ่มฟังก์ชันเช็คสถานะ (Check Status)
exports.checkExamStatus = async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });

    try {
        // ดึงการสอบครั้งล่าสุดของ User คนนี้
        const sql = `
            SELECT * FROM skill_assessment_results 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        const [rows] = await pool.query(sql, [user_id]);
        const latest = rows[0];

        // กรณีที่ 1: ไม่เคยสอบเลย -> ให้สอบ Level 1
        if (!latest) {
            return res.json({ status: 'can_test', nextLevel: 1 });
        }

        // กรณีที่ 2: สอบไปแล้ว แต่รอ Foreman ประเมิน (practical_score เป็น NULL) -> ห้ามสอบ
        if (latest.practical_score === null) {
            return res.json({ status: 'pending_practical' });
        }

        // กรณีที่ 3: ประเมินเสร็จแล้ว เช็ค Level ปัจจุบัน
        // แปลง skill_level เป็น int ก่อน
        const currentLevel = parseInt(latest.skill_level) || 0;

        if (currentLevel >= 3) {
            return res.json({ status: 'max_level' }); // ตันที่ Level 3
        } else {
            // ให้สอบ Level ถัดไป (เช่น จบ 1 -> ไป 2)
            return res.json({ status: 'can_test', nextLevel: currentLevel + 1 });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};
// ดึงข้อสอบ
exports.getAssessmentExam = async (req, res) => {
    try {
        const requestLevel = parseInt(req.query.level) || 1;

        // 1. ดึง Config
        const config = await SkillAssessmentTest.getExamStructureConfigByLevel(requestLevel);
        
        // ถ้าไม่เจอ Config ให้ใช้ค่า Default
        const totalQuestions = config ? (config.total_questions || 30) : 30;
        
        // กำหนดสัดส่วน (ถ้าไม่มี config ให้ใช้ค่า Default)
        const pRebar = config ? config.cat_rebar_percent : 20;
        const pConcrete = config ? config.cat_concrete_percent : 20;
        const pFormwork = config ? config.cat_formwork_percent : 20;
        const pElement = config ? config.cat_element_percent : 20;
        const pTheory = config ? config.cat_theory_percent : 20;

        // คำนวณจำนวนข้อ
        const qRebar = Math.round((pRebar / 100) * totalQuestions);
        const qConcrete = Math.round((pConcrete / 100) * totalQuestions);
        const qFormwork = Math.round((pFormwork / 100) * totalQuestions);
        const qElement = Math.round((pElement / 100) * totalQuestions);
        const qTheory = totalQuestions - qRebar - qConcrete - qFormwork - qElement;

        // 2. สุ่มข้อสอบแยกหมวด
        const [g1, g2, g3, g4, g5] = await Promise.all([
            SkillAssessmentTest.getRandomQuestionsByLevelAndCategory(requestLevel, 'งานเหล็กเสริม', qRebar),
            SkillAssessmentTest.getRandomQuestionsByLevelAndCategory(requestLevel, 'งานคอนกรีต', qConcrete),
            SkillAssessmentTest.getRandomQuestionsByLevelAndCategory(requestLevel, 'งานไม้แบบ', qFormwork),
            SkillAssessmentTest.getRandomQuestionsByLevelAndCategory(requestLevel, 'องค์อาคาร', qElement),
            SkillAssessmentTest.getRandomQuestionsByLevelAndCategory(requestLevel, 'การออกแบบ/ทฤษฎี', qTheory)
        ]);

        const allQuestions = [...g1, ...g2, ...g3, ...g4, ...g5].sort(() => Math.random() - 0.5);

        res.json({
            exam_config: config || { duration_minutes: 60, total_questions: 30 },
            questions: allQuestions
        });

    } catch (err) {
        console.error('Get Exam Error:', err);
        res.status(500).json({ error: 'Server error while fetching questions' });
    }
};

// ตรวจคำตอบและบันทึกผล
exports.submitAssessment = async (req, res) => {
    try {
        const { answers, user_id, level } = req.body;
        console.log(`Submitting Exam - User: ${user_id}, Level: ${level}`);

        const submittedAnswers = answers || {};
        const questionIds = Object.keys(submittedAnswers);

        // 1. ดึงเฉลยจาก DB
        let correctAnswersDB = [];
        if (questionIds.length > 0) {
            correctAnswersDB = await SkillAssessmentTest.getCorrectAnswers(questionIds);
        }

        const answerMap = {};
        correctAnswersDB.forEach(row => {
            answerMap[row.id] = row.answer;
        });

        // 2. ตรวจคำตอบ
        let rawScore = 0;
        for (const [qid, userAns] of Object.entries(submittedAnswers)) {
            const safeUserAns = String(userAns).trim().toUpperCase();
            const safeCorrectAns = String(answerMap[qid] || '').trim().toUpperCase();

            if (safeCorrectAns && safeUserAns === safeCorrectAns) {
                rawScore++;
            }
        }

        // 3. คำนวณคะแนน
        const config = await SkillAssessmentTest.getExamStructureConfigByLevel(level || 1);
        const totalQuestions = config ? config.total_questions : 30;
        
        // สูตรคำนวณคะแนนทฤษฎี (เต็ม 70)
        const theoryScore = (rawScore / totalQuestions) * 70;

        // 4. บันทึกผลลง DB
if (user_id) {
            // สำคัญ: บันทึก skill_level เป็น 0 หรือค่าของ Level เดิมไปก่อน
            // จนกว่า Foreman จะมาประเมิน Practical ผ่าน ถึงจะปรับ skill_level ขึ้น
            // หรือจะบันทึกว่า "นี่คือการสอบของ Level X" ก็ได้ (ต้องดูว่า DB ออกแบบไว้ยังไง)
            
            // ในที่นี้ผมแนะนำให้ INSERT แถวใหม่เสมอ เพื่อเก็บประวัติ
            await SkillAssessmentTest.saveAssessmentResult(user_id, theoryScore, 0); 
        }

        res.json({ 
            message: "Submission successful", 
            score: theoryScore,
            correct: rawScore,        // จำนวนข้อที่ตอบถูก
            total: totalQuestions     // จำนวนข้อสอบทั้งหมด
        });

    } catch (err) {
        console.error('Submit Assessment Error:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดที่ Server' });
    }
};