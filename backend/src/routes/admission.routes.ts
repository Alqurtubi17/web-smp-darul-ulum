// @ts-nocheck
import { Router } from 'express';
import { body } from 'express-validator';
import * as admissionController from '../controllers/admission.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

const submitRules = [
  body('fullName').trim().notEmpty().withMessage('Nama lengkap wajib diisi'),
  body('gender').isIn(['LAKI_LAKI', 'PEREMPUAN']).withMessage('Jenis kelamin tidak valid'),
  body('birthPlace').trim().notEmpty().withMessage('Tempat lahir wajib diisi'),
  body('birthDate').isISO8601().withMessage('Tanggal lahir tidak valid'),
  body('address').trim().notEmpty().withMessage('Alamat wajib diisi'),
  body('parentName').trim().notEmpty().withMessage('Nama orang tua wajib diisi'),
  body('parentPhone').trim().notEmpty().withMessage('No. HP orang tua wajib diisi'),
];

// Public
router.post('/submit', submitRules, validateRequest, admissionController.submitAdmission);
router.get('/status/:registrationNumber', admissionController.checkStatus);

// Admin
router.get('/', authenticate, isAdmin, admissionController.listAdmissions);
router.get('/stats', authenticate, isAdmin, admissionController.getAdmissionStats);
router.get('/:id', authenticate, isAdmin, admissionController.getAdmissionById);
router.patch('/:id/status', authenticate, isAdmin, admissionController.updateAdmissionStatus);

export default router;
