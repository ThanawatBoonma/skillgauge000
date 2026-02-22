const Assessment = require('../models/Assessment');
const pool = require('../config/db'); 

// Logic ตรวจสอบการผ่านเกณฑ์ 70%
const checkLevelPassStatus = (totalScore, targetLevel) => {
    const score = parseFloat(totalScore);
    const passingCriteria = 70; 

    if (score >= passingCriteria) {
        return { isPass: true };
    } else {
        return { isPass: false };
    }
};

exports.submitAssessment = async (req, res) => {
    try {
        // ✅ รับ fmId เพิ่มเข้ามา
        const { workerId, onsiteScore, onsiteFullScore, comment, fmId } = req.body;

        if (!workerId || onsiteScore === undefined || !fmId) {
            return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน (workerId, score, fmId)' });
        }

        // 1. ดึงข้อมูล Worker
        const [users] = await pool.query('SELECT * FROM dbuser WHERE id = ?', [workerId]);
        const worker = users[0];
        if (!worker) return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลช่าง' });

        // 2. ✅ ดึง Level ปัจจุบัน และกำหนด Target Level
        const currentLevel = await Assessment.getCurrentWorkerLevel(workerId);
        // ถ้าปัจจุบัน 0 -> เป้าหมายคือ 1, ถ้า 1 -> เป้าหมาย 2 (สูงสุดที่ 3)
        const targetLevel = Math.min(currentLevel + 1, 3); 

        // 3. ดึงคะแนนทฤษฎีและคำนวณคะแนนรวม
        const theoryData = await Assessment.getTheoryScore(workerId);
        const theoryWeighted = theoryData ? parseFloat(theoryData.theory_score || 0) : 0;

        const safeOnsiteRaw = Number(onsiteScore) || 0;
        const safeOnsiteMax = (Number(onsiteFullScore) > 0) ? Number(onsiteFullScore) : 72;
        const practicalWeighted = (safeOnsiteRaw / safeOnsiteMax) * 30;

        const totalScore = theoryWeighted + practicalWeighted;

        // 4. ตรวจสอบว่าผ่านหรือไม่
        const { isPass } = checkLevelPassStatus(totalScore, targetLevel);

        // ✅ 5. กำหนด Level ใหม่ที่จะบันทึก
        // ถ้าผ่าน -> อัปเป็น targetLevel, ถ้าไม่ผ่าน -> อยู่ที่เดิม (currentLevel)
        const newLevel = isPass ? targetLevel : currentLevel;
        
        // Label สำหรับบันทึกใน history
        const levelLabel = isPass ? `${newLevel}` : `${currentLevel}`; // เก็บเป็นตัวเลขตามที่ต้องการ

        // 6. ✅ บันทึกผลลงตาราง history (skill_assessment_results) พร้อม fm_id
        await Assessment.updateAssessmentResult(
            workerId,
            theoryWeighted,
            parseFloat(practicalWeighted.toFixed(2)),
            parseFloat(totalScore.toFixed(2)),
            levelLabel,
            comment || '',
            fmId // ส่ง Foreman ID ไปบันทึก
        );

        // 7. ✅ อัปเดต Level ปัจจุบันลงตาราง worker_level
        await Assessment.updateWorkerLevel(workerId, newLevel);

        res.status(200).json({
            success: true,
            message: 'บันทึกสำเร็จ',
            data: {
                isPass: isPass,
                totalScore: totalScore.toFixed(2),
                theoryScore: theoryWeighted.toFixed(2),       
                practicalScore: practicalWeighted.toFixed(2), 
                finalLevel: newLevel, // ส่งค่า Level ใหม่กลับไปแสดงผล
                prevLevel: currentLevel
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

// ✅ API ใหม่: ดึงรายการประวัติการประเมิน
exports.getAssessmentHistoryList = async (req, res) => {
    try {
        const history = await Assessment.getCompletedAssessments();
        const formattedData = history.map(item => ({
            ...item,
            // แปลงวันที่ให้สวยงาม
            date_formatted: item.updated_at ? new Date(item.updated_at).toLocaleDateString('th-TH') : '-',
            // สร้าง URL รูปภาพ
            photo_url: item.submission_photo ? `http://localhost:4000/uploads/${item.submission_photo}` : null
        }));
        res.json(formattedData);
    } catch (error) {
        console.error("Assessment History List Error:", error);
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};