const manageUser = require('../models/manageUser');

// ดึงรายชื่อบุคลากรทั้งหมด
exports.getAllPersonnel = async (req, res) => {
  try {
    const users = await manageUser.findAllExceptAdmin();
    res.json(users);
  } catch (err) {
    console.error('Get Users Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// แก้ไขข้อมูลบุคลากร
exports.updatePersonnel = async (req, res) => {
  const { id } = req.params;
  
  try {
    const success = await manageUser.update(id, req.body);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Update User Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ลบบุคลากร
exports.deletePersonnel = async (req, res) => {
  const { id } = req.params;

  try {
    const success = await manageUser.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};