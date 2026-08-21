// @ts-nocheck
import { Router } from 'express';
import { body } from 'express-validator';
import * as newsController from '../controllers/news.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

const newsRules = [
  body('title').trim().notEmpty().withMessage('Judul wajib diisi'),
  body('content').notEmpty().withMessage('Konten wajib diisi'),
];

// Public
router.get('/', newsController.getAllNews);
router.get('/categories', newsController.getCategories);
router.get('/:slug', newsController.getNewsBySlug);

// Admin
router.post('/', authenticate, isAdmin, newsRules, validateRequest, newsController.createNews);
router.put('/:id', authenticate, isAdmin, newsController.updateNews);
router.delete('/:id', authenticate, isAdmin, newsController.deleteNews);

export default router;
