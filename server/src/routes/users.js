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

    const user = await sheetsService.getUserData(userId);

    if (!user) {
      return res.status(404).json({ error: `User with ID ${userId} not found` });
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
