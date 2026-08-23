// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import emailService from '../utils/email';
import { sendSuccess, sendCreated, sendError, sendNotFound, buildPaginationMeta, parsePagination } from '../utils/response';
import { AuthRequest } from '../types';

const ALL_VALID_ROLES = ['SUPER_ADMIN', 'ADMIN', 'GURU', 'SISWA', 'ORANG_TUA', 'PENGUNJUNG'];

const sanitizeRoles = (roles: any): string[] => {
  if (!roles) return ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'];
  const arr = Array.isArray(roles) ? roles : [roles];
  if (arr.includes('SEMUA')) {
    return ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'];
  }
  const filtered = arr.filter((r) => ALL_VALID_ROLES.includes(r));
  return filtered.length > 0 ? filtered : ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'];
};

export const listAnnouncements = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const isPublic = req.query.isPublic === 'true';
    const now = new Date();

    // Ensure all official Kaldik 2026/2027 items are auto-inserted into PostgreSQL DB
    const kaldikItems = [
      {
        title: '[Libur Hari Besar] HUT Republik Indonesia ke-81',
        content: 'Diberitahukan kepada seluruh siswa, guru, dan orang tua/wali murid SMP Darul Ulum Surabaya bahwa kegiatan pembelajaran diliburkan dalam rangka HUT RI ke-81.',
        isPinned: false,
        targetRoles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'],
        expiresAt: new Date('2026-08-17T23:59:59Z'),
        publishedAt: new Date('2026-08-10T08:00:00Z'),
      },
      {
        title: '[Libur Hari Besar] Maulid Nabi Muhammad SAW 1448 H',
        content: 'Diberitahukan bahwa kegiatan belajar mengajar SMP Darul Ulum Surabaya diliburkan dalam rangka peringatan Maulid Nabi Muhammad SAW.',
        isPinned: false,
        targetRoles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'],
        expiresAt: new Date('2026-08-25T23:59:59Z'),
        publishedAt: new Date('2026-08-20T08:00:00Z'),
      },
      {
        title: 'Jadwal Penilaian Tengah Semester (PTS) Ganjil T.A. 2026/2027',
        content: 'Penilaian Tengah Semester (PTS) Ganjil dilaksanakan mulai tanggal 5 s.d. 12 September 2026 bagi seluruh siswa kelas 7, 8, dan 9.',
        isPinned: true,
        targetRoles: ['SISWA', 'ORANG_TUA'],
        expiresAt: new Date('2026-09-12T23:59:59Z'),
        publishedAt: new Date('2026-08-20T08:00:00Z'),
      },
      {
        title: '[Libur Semester 1] Libur Semester Ganjil T.A. 2026/2027',
        content: 'Pelaksanaan Libur Semester 1 (Ganjil) bagi murid SMP Darul Ulum Surabaya berlangsung mulai tanggal 21 s.d. 31 Desember 2026.',
        isPinned: false,
        targetRoles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'],
        expiresAt: new Date('2026-12-31T23:59:59Z'),
        publishedAt: new Date('2026-12-15T08:00:00Z'),
      },
      {
        title: '[Libur Hari Besar] Hari Kelahiran Yesus Kristus',
        content: 'Kegiatan pembelajaran diliburkan dalam rangka Hari Kelahiran Yesus Kristus pada 25 Desember 2026.',
        isPinned: false,
        targetRoles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'],
        expiresAt: new Date('2026-12-25T23:59:59Z'),
        publishedAt: new Date('2026-12-20T08:00:00Z'),
      },
      {
        title: '[Libur Hari Besar] Tahun Baru 2027 Masehi',
        content: 'Kegiatan pembelajaran diliburkan pada tanggal 1 Januari 2027.',
        isPinned: false,
        targetRoles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'],
        expiresAt: new Date('2027-01-01T23:59:59Z'),
        publishedAt: new Date('2026-12-28T08:00:00Z'),
      },
      {
        title: '[Kegiatan Puasa] Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H',
        content: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H bagi seluruh siswa SMP Darul Ulum dilaksanakan pada tanggal 8 s.d. 10 Februari 2027.',
        isPinned: false,
        targetRoles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'],
        expiresAt: new Date('2027-02-10T23:59:59Z'),
        publishedAt: new Date('2027-02-01T08:00:00Z'),
      },
      {
        title: '[Libur Hari Besar] Hari Raya Idul Fitri 1448 H',
        content: 'Diberitahukan bahwa libur Hari Raya Idul Fitri 1448 H berlangsung pada tanggal 10 s.d. 11 Maret 2027.',
        isPinned: false,
        targetRoles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'],
        expiresAt: new Date('2027-03-11T23:59:59Z'),
        publishedAt: new Date('2027-03-01T08:00:00Z'),
      },
    ];

    for (const kItem of kaldikItems) {
      const exists = await prisma.announcement.findFirst({ where: { title: kItem.title } });
      if (!exists) {
        await prisma.announcement.create({
          data: {
            title: kItem.title,
            content: kItem.content,
            isPinned: kItem.isPinned,
            targetRoles: kItem.targetRoles as any,
            expiresAt: kItem.expiresAt,
            publishedAt: kItem.publishedAt,
          },
        });
      }
    }

    const whereCondition: any = { isActive: true };
    if (isPublic) {
      whereCondition.OR = [{ expiresAt: null }, { expiresAt: { gte: now } }];
    }

    const [total, items] = await Promise.all([
      prisma.announcement.count({ where: whereCondition }),
      prisma.announcement.findMany({
        where: whereCondition,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip, take: limit,
      }),
    ]);

    sendSuccess(res, items, 'Pengumuman berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch (err) {
    console.error('[Announcement list error]:', err);
    sendError(res, 'Gagal mengambil pengumuman');
  }
};





export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const ann = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    if (!ann) { sendNotFound(res); return; }
    await prisma.announcement.update({ where: { id: req.params.id }, data: { viewCount: { increment: 1 } } });
    sendSuccess(res, ann);
  } catch { sendError(res, 'Gagal mengambil pengumuman'); }
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, isPinned, targetRoles, expiresAt, fileUrl } = req.body;
    const ann = await prisma.announcement.create({
      data: {
        title, content,
        isPinned: isPinned || false,
        targetRoles: sanitizeRoles(targetRoles) as any,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        fileUrl: fileUrl || null,
        publishedAt: new Date(),
        authorId: req.user?.userId,

      },
    });

    // ─── Kirim email notifikasi ke semua user yang relevan (async) ──────────
    const roles = targetRoles || ['SEMUA'];
    const includeAll = roles.includes('SEMUA');

    prisma.user.findMany({
      where: {
        isActive: true,
        email: { not: null },
        ...(!includeAll && { role: { in: roles } }),
      },
      select: { email: true },
      take: 500,
    }).then(users => {
      const emails = users.map(u => u.email).filter(Boolean) as string[];
      if (emails.length > 0) {
        emailService.sendAnnouncementEmail(emails, { title, content })
          .catch(err => console.error('Announcement email error:', err));
      }
    }).catch(() => {});

    sendCreated(res, ann, 'Pengumuman berhasil dibuat');
  } catch { sendError(res, 'Gagal membuat pengumuman'); }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    if (!existing) { sendNotFound(res); return; }
    const updated = await prisma.announcement.update({
      where: { id: req.params.id },
      data: { ...req.body, ...(req.body.expiresAt && { expiresAt: new Date(req.body.expiresAt) }) },
    });
    sendSuccess(res, updated, 'Pengumuman diperbarui');
  } catch { sendError(res, 'Gagal memperbarui pengumuman'); }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Pengumuman dihapus');
  } catch { sendError(res, 'Gagal menghapus pengumuman'); }
};
