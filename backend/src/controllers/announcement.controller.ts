// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import emailService from '../utils/email';
import { sendSuccess, sendCreated, sendError, sendNotFound, buildPaginationMeta, parsePagination } from '../utils/response';
import { AuthRequest } from '../types';

export const listAnnouncements = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const isPublic = req.query.isPublic === 'true';
    const now = new Date();

    // Check if initial announcements seed is needed
    const countTotalAll = await prisma.announcement.count();
    if (countTotalAll === 0) {
      await prisma.announcement.createMany({
        data: [
          {
            title: 'Pengumuman Libur Hari Besar: HUT Republik Indonesia ke-81',
            content: 'Diberitahukan kepada seluruh siswa, guru, dan orang tua/wali murid SMP Darul Ulum Surabaya bahwa dalam rangka Peringatan Hari Ulang Tahun Kemerdekaan RI ke-81 pada 17 Agustus 2026, kegiatan pembelajaran diliburkan.',
            isPinned: false,
            targetRoles: ['SEMUA'],
            expiresAt: new Date('2026-08-17'),
            publishedAt: new Date('2026-08-10'),
          },
          {
            title: 'Pengumuman Libur Hari Besar: Maulid Nabi Muhammad SAW',
            content: 'Diberitahukan bahwa pada hari Selasa, 25 Agustus 2026, kegiatan belajar mengajar SMP Darul Ulum Surabaya diliburkan dalam rangka peringatan Maulid Nabi Muhammad SAW 1448 H.',
            isPinned: false,
            targetRoles: ['SEMUA'],
            expiresAt: new Date('2026-08-25'),
            publishedAt: new Date('2026-08-20'),
          },
          {
            title: 'Jadwal Penilaian Tengah Semester (PTS) Ganjil T.A. 2026/2027',
            content: 'Diberitahukan kepada seluruh siswa kelas 7, 8, dan 9 bahwa Penilaian Tengah Semester (PTS) Ganjil akan dilaksanakan mulai tanggal 5 s.d. 12 September 2026. Harap mempersiapkan diri dan melunasi kewajiban administrasi.',
            isPinned: false,
            targetRoles: ['SISWA', 'ORANG_TUA'],
            expiresAt: new Date('2026-09-12'),
            publishedAt: new Date('2026-08-20'),
          },
          {
            title: 'Pengumuman Libur Semester 1 (Ganjil) T.A. 2026/2027',
            content: 'Pelaksanaan Libur Semester 1 (Ganjil) bagi murid SMP Darul Ulum Surabaya berlangsung mulai tanggal 21 s.d. 31 Desember 2026. Masuk kembali semester genap pada bulan Januari 2027.',
            isPinned: false,
            targetRoles: ['SEMUA'],
            expiresAt: new Date('2026-12-31'),
            publishedAt: new Date('2026-12-15'),
          },
          {
            title: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H',
            content: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H bagi seluruh siswa-siswi SMP Darul Ulum dilaksanakan pada tanggal 8 s.d. 10 Februari 2027 di kampus & Masjid Darul Ulum.',
            isPinned: false,
            targetRoles: ['SEMUA'],
            expiresAt: new Date('2027-02-10'),
            publishedAt: new Date('2027-02-01'),
          },
          {
            title: 'Pengumuman Libur Hari Raya Idul Fitri 1448 H',
            content: 'Diberitahukan bahwa libur Hari Raya Idul Fitri 1448 H dan cuti bersama berlangsung pada tanggal 10 s.d. 11 Maret 2027.',
            isPinned: false,
            targetRoles: ['SEMUA'],
            expiresAt: new Date('2027-03-11'),
            publishedAt: new Date('2027-03-01'),
          },
        ],
      });
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
  } catch { sendError(res, 'Gagal mengambil pengumuman'); }
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
        targetRoles: targetRoles || ['SEMUA'],
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
