// @ts-nocheck
import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as authCtrl from '../controllers/auth.controller';

const router = Router();

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  authCtrl.login
);

// ─── REGISTER ─────────────────────────────────────────────────────────────────
router.post('/register',
  [body('email').isEmail(), body('password').isLength({ min: 8 }), body('role').optional()],
  validate,
  authCtrl.register
);

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
router.post('/refresh', authCtrl.refreshToken);

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
router.post('/logout', authenticate, authCtrl.logout);

// ─── PROFILE ──────────────────────────────────────────────────────────────────
router.get('/profile', authenticate, authCtrl.getProfile);
router.put('/profile', authenticate, authCtrl.updateProfile);

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
router.post('/change-password',
  authenticate,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  authCtrl.changePassword
);

// ─── FORGOT / RESET PASSWORD (via Gmail) ─────────────────────────────────────
router.post('/forgot-password',
  [body('email').isEmail().withMessage('Email tidak valid')],
  validate,
  authCtrl.forgotPassword
);

router.post('/reset-password',
  [body('token').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  authCtrl.resetPassword
);

export default router;
