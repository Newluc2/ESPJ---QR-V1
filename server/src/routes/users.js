import express from 'express';
import sheetsService from '../services/sheetsService.js';

const router = express.Router();

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    let user = await sheetsService.getUserData(userId);

    if (!user) {
      console.log(`User ${userId} not found, trying fallback to first user`);
      const users = await sheetsService.getAllUsers();
      if (users.length > 0) {
        user = users[0];
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await sheetsService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
