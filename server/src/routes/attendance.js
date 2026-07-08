import express from 'express';
import sheetsService from '../services/sheetsService.js';

const router = express.Router();

// Register attendance (arrival or departure)
router.post('/register', async (req, res) => {
  try {
    const { userId, clientTimestamp } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Get user data
    const user = await sheetsService.getUserData(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already logged in today
    const existingRecord = await sheetsService.getUserAttendanceToday(userId);

    let attendanceType = existingRecord ? 'departure' : 'arrival';

    // Add or update attendance
    const result = await sheetsService.addOrUpdateAttendance(userId, user, attendanceType, clientTimestamp);

    res.json(result);
  } catch (error) {
    console.error('Error registering attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user attendance today
router.get('/today/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const attendance = await sheetsService.getUserAttendanceToday(userId);

    res.json(attendance || { message: 'No attendance record today' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
