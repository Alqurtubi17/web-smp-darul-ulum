import { Router } from 'express';
import { listDownloads, createDownload, deleteDownload } from '../controllers/download.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', listDownloads);
router.post('/', authenticate, createDownload);
router.delete('/:id', authenticate, deleteDownload);

export default router;
