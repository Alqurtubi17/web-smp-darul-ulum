import { Router } from 'express';
import { listAchievements, createAchievement, deleteAchievement } from '../controllers/achievement.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', listAchievements);
router.post('/', authenticate, createAchievement);
router.delete('/:id', authenticate, deleteAchievement);

export default router;
