const WorkerIssue = require('../models/workerissuemodel');

// ดึงรายการปัญหาของ Worker
exports.getWorkerIssues = async (req, res) => {
  const { id } = req.params;
  try {
    const issues = await WorkerIssue.getIssuesByWorkerId(id);
    res.json({ success: true, data: issues });
  } catch (err) {
    console.error('Error in getWorkerIssues:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// บันทึกการแจ้งปัญหาใหม่
exports.reportIssue = async (req, res) => {
  try {
    const issueData = req.body;
    
    // ถ้ารับไฟล์รูปมาด้วย ให้สร้าง URL
    if (req.file) {
      issueData.photo_url = `http://localhost:4000/uploads/${req.file.filename}`;
    }

    await WorkerIssue.createIssue(issueData);
    res.status(201).json({ success: true, message: 'รายงานปัญหาสำเร็จ' });
  } catch (err) {
    console.error('Error in reportIssue:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PM ดึงรายการปัญหา
exports.getPMIssues = async (req, res) => {
  const { managerId } = req.params;
  try {
    const issues = await WorkerIssue.getIssuesForPM(managerId);
    res.json({ success: true, data: issues });
  } catch (err) {
    console.error('Error in getPMIssues:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PM อัปเดตสถานะ
exports.updateIssueStatus = async (req, res) => {
  const { id } = req.params;
  const { status, resolution_note } = req.body;
  try {
    await WorkerIssue.updateIssueStatus(id, status, resolution_note);
    res.json({ success: true, message: 'อัปเดตสถานะปัญหาเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error in updateIssueStatus:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};