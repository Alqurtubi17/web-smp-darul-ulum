// @ts-nocheck — Prisma client will be generated before compilation
import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import prisma from '../utils/prisma';

// ─── AUTHENTICATE ─────────────────────────────────────────────────────────

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      sendUnauthorized(res, 'Token tidak ditemukan');
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = verifyAccessToken(token);

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        sendUnauthorized(res, 'Akun tidak aktif atau tidak ditemukan');
        return;
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch {
      sendUnauthorized(res, 'Token tidak valid atau sudah kadaluarsa');
    }
  } catch (error) {
    sendUnauthorized(res, 'Autentikasi gagal');
  }
};

// ─── AUTHORIZE ────────────────────────────────────────────────────────────

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendForbidden(res, `Hanya ${roles.join(', ')} yang dapat mengakses`);
      return;
    }

    next();
  };
};

// ─── OPTIONAL AUTH (for public routes that benefit from auth) ────────────

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = verifyAccessToken(token);
        req.user = payload;
      } catch {
        // Silently ignore invalid token for optional auth
      }
    }

    next();
  } catch {
    next();
  }
};

// ─── ROLE SHORTCUTS ───────────────────────────────────────────────────────

export const isSuperAdmin = authorize(Role.SUPER_ADMIN);
export const isAdmin = authorize(Role.SUPER_ADMIN, Role.ADMIN);
export const isGuru = authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.GURU);
export const isSiswa = authorize(Role.SISWA);
export const isOrangTua = authorize(Role.ORANG_TUA);
export const isAkademik = authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.GURU, Role.SISWA);
