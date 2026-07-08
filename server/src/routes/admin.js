import express from 'express';
import { adminMiddleware } from '../middleware/auth.js';
import sheetsService from '../services/sheetsService.js';

const router = express.Router();

// Get all attendance today (admin only)
router.get('/attendance/today', adminMiddleware, async (req, res) => {
  try {
    const attendance = await sheetsService.getAllAttendanceToday();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await sheetsService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add user (admin only)
router.post('/users', adminMiddleware, async (req, res) => {
  try {
    const { id, firstName, lastName, email } = req.body;

    if (!id || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sheetsService.addUser({
      id,
      firstName,
      lastName,
      email
    });

    res.json({ success: true, message: 'User added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
