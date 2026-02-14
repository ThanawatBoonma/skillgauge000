const Assessment = require('../models/Assessment');
const pool = require('../config/db'); 

const checkLevelPassStatus = (totalScore, targetLevel) => {
    const score = parseFloat(totalScore);
    const level = parseInt(targetLevel);
    const passingCriteria = 70; 

    if (score >= passingCriteria) {
        return { isPass: true, numeric: level, label: `L${level}: ผ่านเกณฑ์` };
    } else {
        return { isPass: false, numeric: Math.max(0, level - 1), label: `L${level}: ไม่ผ่านเกณฑ์` };
    }
};

exports.submitAssessment = async (req, res) => {
    try {
        const { workerId, onsiteScore, onsiteFullScore, targetLevel = 1, comment } = req.body;

        if (!workerId || onsiteScore === undefined) {
            return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
        }

        const [users] = await pool.query('SELECT * FROM dbuser WHERE id = ?', [workerId]);
        const worker = users[0];
        if (!worker) return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลช่าง' });

        // 1. คะแนนทฤษฎี
        const theoryData = await Assessment.getTheoryScore(workerId);
        const theoryWeighted = theoryData ? parseFloat(theoryData.theory_score || 0) : 0;

        // 2. คะแนนปฏิบัติ
        const safeOnsiteRaw = Number(onsiteScore) || 0;
        const safeOnsiteMax = (Number(onsiteFullScore) > 0) ? Number(onsiteFullScore) : 72;
        const practicalWeighted = (safeOnsiteRaw / safeOnsiteMax) * 30;

        // 3. คะแนนรวม
        const totalScore = theoryWeighted + practicalWeighted;
        const resultStatus = checkLevelPassStatus(totalScore, targetLevel);

        // 4. บันทึก
        await Assessment.updateAssessmentResult(
            workerId,
            theoryWeighted,
            parseFloat(practicalWeighted.toFixed(2)),
            parseFloat(totalScore.toFixed(2)),
            resultStatus.numeric,
            comment || '' 
        );

        // 5. ส่งค่ากลับ (เพิ่ม breakdown คะแนน)
        res.status(200).json({
            success: true,
            message: 'บันทึกสำเร็จ',
            data: {
                isPass: resultStatus.isPass,
                totalScore: totalScore.toFixed(2),
                theoryScore: theoryWeighted.toFixed(2),       
                practicalScore: practicalWeighted.toFixed(2), 
                finalLevel: resultStatus.numeric,
                targetLevel: targetLevel
            }
        });

    } catch (error) {
        console.error("Submit Assessment Error:", error);
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};

exports.getForemanDashboardData = async (req, res) => {
    try {
        const workers = await Assessment.getPendingPracticalList();
        const formattedData = workers.map(w => ({
            ...w,
            date: w.submitted_at ? new Date(w.submitted_at).toISOString().split('T')[0] : '-',
            photo_url: w.submission_photo ? `http://localhost:4000/uploads/${w.submission_photo}` : null
        }));
        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Foreman Dashboard Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};