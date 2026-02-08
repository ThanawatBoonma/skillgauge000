const Setting = require('../models/Setting');
const bcrypt = require('bcryptjs');

exports.getUserProfile = async (req, res) => {
    const { user_id } = req.query;
    try {
        const user = await Setting.findById(user_id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.updatePassword = async (req, res) => {
    const { user_id, currentPassword, newPassword } = req.body;
    
    try {
        // 1. ดึงรหัสผ่านเดิมมาเช็ค
        const user = await Setting.findPasswordById(user_id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
        }

        // 2. Hash รหัสใหม่แล้วบันทึก
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await Setting.updatePassword(user_id, hashedPassword);

        res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};