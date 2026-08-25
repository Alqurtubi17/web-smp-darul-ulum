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
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      totalTeachers,
      totalParents,
      pendingAdmissions,
      publishedNews,
      activeAnnouncements,
      newsViews,
      announcementViews,
      downloadCount,
      totalAuditLogs,
      activeUsersToday,
    ] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count({ where: { isActive: true } }),
      prisma.parent.count(),
      prisma.admission.count({ where: { status: 'PENDING' } }),
      prisma.news.count({ where: { status: 'PUBLISHED' } }),
      prisma.announcement.count({ where: { isActive: true } }),
      prisma.news.aggregate({ _sum: { viewCount: true } }),
      prisma.announcement.aggregate({ _sum: { viewCount: true } }),
      prisma.download.aggregate({ _sum: { downloadCount: true } }),
      prisma.auditLog.count(),
      prisma.user.count({ where: { lastLogin: { gte: todayStart } } }),
    ]);

    // Exact database view count sum (0 if no activity recorded)
    const totalViews =
      (newsViews._sum.viewCount || 0) +
      (announcementViews._sum.viewCount || 0) +
      (downloadCount._sum.downloadCount || 0) +
      totalAuditLogs;

    // Real-Time 90-Day Database Visitor & Activity Analytics Query
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 89);
    startDate.setHours(0, 0, 0, 0);

    const [auditLogs, users, admissions, newsItems, announcements] = await Promise.all([
      prisma.auditLog.findMany({ where: { createdAt: { gte: startDate } }, select: { createdAt: true } }),
      prisma.user.findMany({ where: { createdAt: { gte: startDate } }, select: { createdAt: true } }),
      prisma.admission.findMany({ where: { createdAt: { gte: startDate } }, select: { createdAt: true } }),
      prisma.news.findMany({ where: { createdAt: { gte: startDate } }, select: { createdAt: true } }),
      prisma.announcement.findMany({ where: { createdAt: { gte: startDate } }, select: { createdAt: true } }),
    ]);

    const countMap = new Map<string, number>();
    const addRecord = (date: Date) => {
      if (!date) return;
      const key = date.toISOString().split('T')[0];
      countMap.set(key, (countMap.get(key) || 0) + 1);
    };

    auditLogs.forEach((r) => addRecord(r.createdAt));
    users.forEach((r) => addRecord(r.createdAt));
    admissions.forEach((r) => addRecord(r.createdAt));
    newsItems.forEach((r) => addRecord(r.createdAt));
    announcements.forEach((r) => addRecord(r.createdAt));

    const now = new Date();
    const dailySeries = Array.from({ length: 90 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (89 - i));
      const key = d.toISOString().split('T')[0];
      const count = countMap.get(key) || 0;
      return {
        dateKey: key,
        dayLabel: `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'short' })}`,
        count,
        barPercent: 0,
      };
    });

    const recent30Count = dailySeries.slice(-30).reduce((acc, curr) => acc + curr.count, 0);
    const prev30Count = dailySeries.slice(-60, -30).reduce((acc, curr) => acc + curr.count, 0);
    const growthPercentage = prev30Count > 0
      ? Math.round(((recent30Count - prev30Count) / prev30Count) * 1000) / 10
      : (recent30Count > 0 ? 100 : 0);

    // Real-Time Class Attendance & SPP Summary from Database
    const [allClasses, sppPayments] = await Promise.all([
      prisma.class.findMany({
        select: {
          id: true,
          name: true,
          students: {
            select: {
              id: true,
              attendances: {
                select: { status: true },
              },
            },
          },
        },
      }),
      prisma.payment.findMany({
        select: { amount: true, status: true },
      }),
    ]);

    const classAttendance = allClasses.map((cls) => {
      let hadir = 0, izin = 0, sakit = 0, alpha = 0, total = 0;
      cls.students.forEach((s) => {
        s.attendances.forEach((att) => {
          total++;
          if (att.status === 'HADIR') hadir++;
          else if (att.status === 'IZIN') izin++;
          else if (att.status === 'SAKIT') sakit++;
          else if (att.status === 'ALPHA') alpha++;
        });
      });

      const hadirPct = total > 0 ? Math.round((hadir / total) * 100) : 0;
      const izinPct = total > 0 ? Math.round((izin / total) * 100) : 0;
      const sakitPct = total > 0 ? Math.round((sakit / total) * 100) : 0;
      const alphaPct = total > 0 ? Math.round((alpha / total) * 100) : 0;

      return {
        class: cls.name,
        hadir: hadirPct,
        izin: izinPct,
        sakit: sakitPct,
        alpha: alphaPct,
        totalRecords: total,
      };
    });

    const totalSPPCollected = sppPayments
      .filter((p) => p.status === 'PAID')
      .reduce((acc, p) => acc + p.amount, 0);

    const totalSPPTarget = sppPayments.reduce((acc, p) => acc + p.amount, 0);

    sendSuccess(res, {
      totalStudents,
      totalTeachers,
      totalParents,
      pendingAdmissions,
      publishedNews,
      activeAnnouncements,
      classAttendance,
      payments: {
        collected: totalSPPCollected,
        target: totalSPPTarget,
        totalCount: sppPayments.length,
      },
      visitorStats: {
        totalViews,
        activeUsersToday,
        growthPercentage,
        dailySeries,
      },
    }, 'Statistik dashboard berhasil diambil');
  } catch { sendError(res, 'Gagal mengambil statistik dashboard'); }
};

export const listAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { user: { select: { email: true, role: true } } },
    });
    sendSuccess(res, logs, 'Data audit log berhasil diambil');
  } catch { sendError(res, 'Gagal mengambil data audit log'); }
};

export const createAuditLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, resource, resourceId, oldData, newData } = req.body;
    const newLog = await prisma.auditLog.create({
      data: {
        userId: req.user?.userId || null,
        action: action || 'ACTION',
        resource: resource || 'GENERAL',
        resourceId: resourceId || null,
        oldData: oldData || null,
        newData: newData || null,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Web Browser',
      },
    });
    sendCreated(res, newLog, 'Audit log berhasil dicatat');
  } catch { sendError(res, 'Gagal mencatat audit log'); }
};

export const clearAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.auditLog.deleteMany({});
    sendSuccess(res, null, 'Riwayat audit log berhasil dikosongkan');
  } catch { sendError(res, 'Gagal mengosongkan audit log'); }
};

// ─── SITE SETTINGS / ACADEMIC YEAR ──────────────────────────────────────────
export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const result: Record<string, any> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });

    if (!result.active_academic_year) {
      result.active_academic_year = '2024/2025';
      await prisma.siteSetting.upsert({
        where: { key: 'active_academic_year' },
        update: { value: '2024/2025' },
        create: { key: 'active_academic_year', value: '2024/2025', group: 'general' },
      });
    }

    if (!result.active_academic_semester) {
      result.active_academic_semester = 'Ganjil';
      await prisma.siteSetting.upsert({
        where: { key: 'active_academic_semester' },
        update: { value: 'Ganjil' },
        create: { key: 'active_academic_semester', value: 'Ganjil', group: 'general' },
      });
    }

    // Seed default AcademicYears in database if table is empty
    let academicYears = await prisma.academicYear.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (academicYears.length === 0) {
      const defaultYears = [
        { year: '2024/2025', semester: 'Ganjil', isActive: true, status: 'Aktif', startDate: new Date('2024-07-15'), endDate: new Date('2024-12-20') },
        { year: '2023/2024', semester: 'Genap', isActive: false, status: 'Arsip', startDate: new Date('2024-01-08'), endDate: new Date('2024-06-25') },
        { year: '2023/2024', semester: 'Ganjil', isActive: false, status: 'Arsip', startDate: new Date('2023-07-17'), endDate: new Date('2023-12-22') },
        { year: '2025/2026', semester: 'Ganjil', isActive: false, status: 'Mendatang', startDate: new Date('2025-07-14'), endDate: new Date('2025-12-19') },
      ];
      for (const y of defaultYears) {
        await prisma.academicYear.create({ data: y });
      }
      academicYears = await prisma.academicYear.findMany({ orderBy: { createdAt: 'desc' } });
    }

    result.academicYears = academicYears;

    sendSuccess(res, result, 'Pengaturan berhasil diambil');
  } catch {
    sendError(res, 'Gagal mengambil pengaturan');
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dataObj = req.body;
    if (dataObj && typeof dataObj === 'object') {
      const keys = Object.keys(dataObj);
      for (const k of keys) {
        if (k === 'academicYears') continue;
        await prisma.siteSetting.upsert({
          where: { key: k },
          update: { value: String(dataObj[k]) },
          create: { key: k, value: String(dataObj[k]), group: 'general' },
        });
      }
    }
    sendSuccess(res, null, 'Pengaturan berhasil disimpan');
  } catch {
    sendError(res, 'Gagal menyimpan pengaturan');
  }
};

export const listAcademicYears = async (_req: Request, res: Response): Promise<void> => {
  try {
    let academicYears = await prisma.academicYear.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (academicYears.length === 0) {
      const defaultYears = [
        { year: '2024/2025', semester: 'Ganjil', isActive: true, status: 'Aktif', startDate: new Date('2024-07-15'), endDate: new Date('2024-12-20') },
        { year: '2023/2024', semester: 'Genap', isActive: false, status: 'Arsip', startDate: new Date('2024-01-08'), endDate: new Date('2024-06-25') },
        { year: '2023/2024', semester: 'Ganjil', isActive: false, status: 'Arsip', startDate: new Date('2023-07-17'), endDate: new Date('2023-12-22') },
        { year: '2025/2026', semester: 'Ganjil', isActive: false, status: 'Mendatang', startDate: new Date('2025-07-14'), endDate: new Date('2025-12-19') },
      ];
      for (const y of defaultYears) {
        await prisma.academicYear.create({ data: y });
      }
      academicYears = await prisma.academicYear.findMany({ orderBy: { createdAt: 'desc' } });
    }
    sendSuccess(res, academicYears, 'Daftar tahun ajaran berhasil diambil');
  } catch {
    sendError(res, 'Gagal mengambil daftar tahun ajaran');
  }
};

export const getActiveAcademicYear = async (_req: Request, res: Response): Promise<void> => {
  try {
    let active = await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (!active) {
      active = await prisma.academicYear.findFirst({ orderBy: { createdAt: 'desc' } });
    }
    sendSuccess(res, active, 'Tahun ajaran aktif berhasil diambil');
  } catch {
    sendError(res, 'Gagal mengambil tahun ajaran aktif');
  }
};

export const updateAcademicYear = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { year, semester, status, startDate, endDate } = req.body;
    const target = await prisma.academicYear.findUnique({ where: { id } });
    if (!target) {
      sendNotFound(res, 'Tahun ajaran tidak ditemukan');
      return;
    }
    const updated = await prisma.academicYear.update({
      where: { id },
      data: {
        ...(year && { year: year.trim() }),
        ...(semester && { semester }),
        ...(status && { status }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
    });
    sendSuccess(res, updated, 'Tahun ajaran berhasil diperbarui');
  } catch {
    sendError(res, 'Gagal memperbarui tahun ajaran');
  }
};

export const addAcademicYear = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year, semester } = req.body;
    if (!year || !semester) {
      sendError(res, 'Tahun ajaran dan semester wajib diisi', 400);
      return;
    }

    const newItem = await prisma.academicYear.create({
      data: {
        year: year.trim(),
        semester,
        isActive: false,
        status: 'Mendatang',
      },
    });

    sendCreated(res, newItem, 'Tahun ajaran baru berhasil ditambahkan');
  } catch {
    sendError(res, 'Gagal menambahkan tahun ajaran');
  }
};

export const setActiveAcademicYear = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const target = await prisma.academicYear.findUnique({ where: { id } });
    if (!target) {
      sendNotFound(res, 'Tahun ajaran tidak ditemukan');
      return;
    }

    await prisma.academicYear.updateMany({
      data: { isActive: false, status: 'Arsip' },
    });

    const updated = await prisma.academicYear.update({
      where: { id },
      data: { isActive: true, status: 'Aktif' },
    });

    await prisma.siteSetting.upsert({
      where: { key: 'active_academic_year' },
      update: { value: target.year },
      create: { key: 'active_academic_year', value: target.year, group: 'general' },
    });
    await prisma.siteSetting.upsert({
      where: { key: 'active_academic_semester' },
      update: { value: target.semester },
      create: { key: 'active_academic_semester', value: target.semester, group: 'general' },
    });

    sendSuccess(res, updated, 'Tahun ajaran aktif berhasil diperbarui');
  } catch {
    sendError(res, 'Gagal memperbarui tahun ajaran aktif');
  }
};

export const deleteAcademicYear = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const target = await prisma.academicYear.findUnique({ where: { id } });
    if (!target) {
      sendNotFound(res, 'Tahun ajaran tidak ditemukan');
      return;
    }

    await prisma.academicYear.delete({ where: { id } });

    sendSuccess(res, null, 'Tahun ajaran berhasil dihapus');
  } catch {
    sendError(res, 'Gagal menghapus tahun ajaran');
  }
};




