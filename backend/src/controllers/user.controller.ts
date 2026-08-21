// @ts-nocheck — Prisma client will be generated before compilation
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import prisma from '../utils/prisma';
import {
  sendSuccess, sendCreated, sendError, sendNotFound,
  buildPaginationMeta, parsePagination,
} from '../utils/response';
import { AuthRequest } from '../types';

// ─── LIST USERS ───────────────────────────────────────────────────────────────

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);
    const { role, search, isActive } = req.query as Record<string, string>;

    const where = {
      ...(role && { role: role as Role }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { student: { fullName: { contains: search, mode: 'insensitive' as const } } },
          { teacher: { fullName: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, role: true, isActive: true,
          lastLogin: true, createdAt: true,
          student: { select: { id: true, fullName: true, nis: true } },
          teacher: { select: { id: true, fullName: true, nip: true } },
          parent: { select: { id: true, fullName: true } },
        },
      }),
    ]);

    sendSuccess(res, users, 'Data pengguna berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch { sendError(res, 'Gagal mengambil data pengguna'); }
};

// ─── LIST STUDENTS ────────────────────────────────────────────────────────────

export const listStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);
    const { search, classId, isActive } = req.query as Record<string, string>;

    const where = {
      ...(isActive !== undefined ? { isActive: isActive === 'true' } : { isActive: true }),
      ...(classId && { classId }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { nis: { contains: search, mode: 'insensitive' as const } },
          { nisn: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where, skip, take: limit,
        orderBy: { fullName: 'asc' },
        include: {
          class: { select: { id: true, name: true, grade: true } },
          user: { select: { email: true } },
        },
      }),
    ]);

    sendSuccess(res, students, 'Data siswa berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch { sendError(res, 'Gagal mengambil data siswa'); }
};

// ─── CREATE STUDENT (admin) ───────────────────────────────────────────────────

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, nis, nisn, gender, birthPlace, birthDate,
      address, phone, classId, parentId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) { sendError(res, 'Email sudah terdaftar', 409); return; }

    const hashedPassword = await bcrypt.hash(password || `Siswa@${nis}`, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, password: hashedPassword, role: Role.SISWA },
      });
      const student = await tx.student.create({
        data: { userId: user.id, fullName, nis, nisn, gender, birthPlace, phone, address, classId, parentId,
          ...(birthDate && { birthDate: new Date(birthDate) }) },
        include: { class: { select: { name: true } }, user: { select: { email: true } } },
      });
      return student;
    });

    sendCreated(res, result, 'Data siswa berhasil dibuat');
  } catch { sendError(res, 'Gagal membuat data siswa'); }
};

// ─── LIST TEACHERS ────────────────────────────────────────────────────────────

export const listTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);
    const { search } = req.query as Record<string, string>;

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { nip: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [total, teachers] = await Promise.all([
      prisma.teacher.count({ where }),
      prisma.teacher.findMany({
        where, skip, take: limit,
        orderBy: { fullName: 'asc' },
        include: { user: { select: { email: true } } },
      }),
    ]);

    sendSuccess(res, teachers, 'Data guru berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch { sendError(res, 'Gagal mengambil data guru'); }
};

// ─── CREATE TEACHER (admin) ───────────────────────────────────────────────────

export const createTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, nip, gender, subject, education, phone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) { sendError(res, 'Email sudah terdaftar', 409); return; }

    const hashedPassword = await bcrypt.hash(password || `Guru@${Date.now()}`, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, password: hashedPassword, role: Role.GURU },
      });
      const teacher = await tx.teacher.create({
        data: { userId: user.id, fullName, nip, gender, subject, education, phone },
        include: { user: { select: { email: true } } },
      });
      return teacher;
    });

    sendCreated(res, result, 'Data guru berhasil dibuat');
  } catch { sendError(res, 'Gagal membuat data guru'); }
};

// ─── TOGGLE ACTIVE (admin) ────────────────────────────────────────────────────

export const toggleUserActive = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { sendNotFound(res, 'Pengguna tidak ditemukan'); return; }
    if (user.id === req.user!.userId) { sendError(res, 'Tidak dapat menonaktifkan akun sendiri', 400); return; }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });

    sendSuccess(res, updated, `Pengguna berhasil ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
  } catch { sendError(res, 'Gagal mengubah status pengguna'); }
};

// ─── DASHBOARD STATS (admin) ──────────────────────────────────────────────────

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalStudents, totalTeachers, totalParents, pendingAdmissions,
      publishedNews, activeAnnouncements] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count({ where: { isActive: true } }),
      prisma.parent.count(),
      prisma.admission.count({ where: { status: 'PENDING' } }),
      prisma.news.count({ where: { status: 'PUBLISHED' } }),
      prisma.announcement.count({ where: { isActive: true } }),
    ]);

    sendSuccess(res, {
      totalStudents, totalTeachers, totalParents,
      pendingAdmissions, publishedNews, activeAnnouncements,
    }, 'Statistik dashboard berhasil diambil');
  } catch { sendError(res, 'Gagal mengambil statistik dashboard'); }
};
