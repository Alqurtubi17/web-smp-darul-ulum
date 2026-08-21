// @ts-nocheck — Prisma client will be generated before compilation
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import prisma from '../utils/prisma';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import emailService from '../utils/email';
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendUnauthorized,
} from '../utils/response';
import { AuthRequest } from '../types';

// ─── REGISTER ─────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role = Role.PENGUNJUNG } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      sendError(res, 'Email sudah terdaftar', 409);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    const tokens = generateTokens(user.id, user.email, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    sendCreated(res, { user, ...tokens }, 'Registrasi berhasil');
  } catch (error) {
    sendError(res, 'Registrasi gagal');
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: { select: { id: true, fullName: true, nis: true, photo: true } },
        teacher: { select: { id: true, fullName: true, nip: true, photo: true } },
        parent: { select: { id: true, fullName: true } },
      },
    });

    if (!user) {
      sendUnauthorized(res, 'Email atau password salah');
      return;
    }

    if (!user.isActive) {
      sendUnauthorized(res, 'Akun Anda tidak aktif, hubungi admin');
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      sendUnauthorized(res, 'Email atau password salah');
      return;
    }

    const tokens = generateTokens(user.id, user.email, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: tokens.refreshToken,
        lastLogin: new Date(),
      },
    });

    const { password: _, refreshToken: __, ...userWithoutSensitive } = user;

    sendSuccess(
      res,
      { user: userWithoutSensitive, ...tokens },
      'Login berhasil'
    );
  } catch (error) {
    sendError(res, 'Login gagal');
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      sendUnauthorized(res, 'Refresh token tidak ditemukan');
      return;
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      sendUnauthorized(res, 'Refresh token tidak valid');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== token || !user.isActive) {
      sendUnauthorized(res, 'Refresh token tidak valid');
      return;
    }

    const tokens = generateTokens(user.id, user.email, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    sendSuccess(res, tokens, 'Token diperbarui');
  } catch {
    sendError(res, 'Gagal memperbarui token');
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────

export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.userId) {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { refreshToken: null },
      });
    }

    sendSuccess(res, null, 'Logout berhasil');
  } catch {
    sendError(res, 'Logout gagal');
  }
};

// ─── GET PROFILE ──────────────────────────────────────────────────────────

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        student: {
          select: {
            id: true, fullName: true, nis: true, nisn: true,
            photo: true, gender: true, class: {
              select: { id: true, name: true, grade: true }
            }
          }
        },
        teacher: {
          select: {
            id: true, fullName: true, nip: true, photo: true, subject: true
          }
        },
        parent: {
          select: {
            id: true, fullName: true,
            students: { select: { id: true, fullName: true, nis: true } }
          }
        },
      },
    });

    if (!user) {
      sendUnauthorized(res, 'Pengguna tidak ditemukan');
      return;
    }

    sendSuccess(res, user, 'Profil berhasil diambil');
  } catch {
    sendError(res, 'Gagal mengambil profil');
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      sendUnauthorized(res, 'Pengguna tidak ditemukan');
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    sendSuccess(res, updatedUser, 'Profil berhasil diperbarui');
  } catch (error) {
    sendError(res, 'Gagal memperbarui profil');
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      sendUnauthorized(res);
      return;
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      sendError(res, 'Password lama tidak sesuai', 400);
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, refreshToken: null },
    });

    sendSuccess(res, null, 'Password berhasil diubah');
  } catch {
    sendError(res, 'Gagal mengubah password');
  }
};

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Selalu return success untuk keamanan (tidak expose apakah email ada)
    if (!user) { sendSuccess(res, null, 'Jika email terdaftar, link reset akan dikirim'); return; }

    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: token, resetPasswordExpires: expires },
    });

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;
    await emailService.sendEmail(user.email, 'Reset Password — SMP Darul Ulum',
      `<p>Klik link berikut untuk reset password Anda (berlaku 1 jam):</p>
       <p><a href="${resetUrl}" style="color:#16a34a;font-weight:bold">${resetUrl}</a></p>
       <p style="color:#6b7280;font-size:12px">Abaikan email ini jika Anda tidak meminta reset password.</p>`
    );

    sendSuccess(res, null, 'Jika email terdaftar, link reset akan dikirim');
  } catch { sendError(res, 'Gagal memproses permintaan'); }
};

// ─── RESET PASSWORD ──────────────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) { sendError(res, 'Token tidak valid atau sudah kadaluarsa', 400); return; }

    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetPasswordToken: null, resetPasswordExpires: null },
    });

    sendSuccess(res, null, 'Password berhasil diubah. Silakan login kembali.');
  } catch { sendError(res, 'Gagal reset password'); }
};
