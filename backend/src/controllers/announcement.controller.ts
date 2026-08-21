// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import emailService from '../utils/email';
import { sendSuccess, sendCreated, sendError, sendNotFound, buildPaginationMeta, parsePagination } from '../utils/response';
import { AuthRequest } from '../types';

export const listAnnouncements = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const now = new Date();
    const [total, items] = await Promise.all([
      prisma.announcement.count({ where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
      prisma.announcement.findMany({
        where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
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
