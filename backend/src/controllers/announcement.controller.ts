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

    // Query announcements directly from PostgreSQL database without forced re-upserts
    const whereClause: any = isPublic
      ? {
          targetRoles: { hasSome: ['SEMUA', 'PENGUNJUNG', 'SISWA', 'GURU', 'ORANG_TUA'] },
        }
      : {};

    const [total, items] = await Promise.all([
      prisma.announcement.count({ where: whereClause }),
      prisma.announcement.findMany({
        where: whereClause,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    // Clean duplicate items by title
    const uniqueMap = new Map();
    for (const item of items) {
      const cleanTitle = item.title.trim().toLowerCase();
      if (!uniqueMap.has(cleanTitle)) {
        uniqueMap.set(cleanTitle, item);
      }
    }
    const deduplicated = Array.from(uniqueMap.values());

    sendSuccess(res, deduplicated, 'Pengumuman berhasil diambil', 200, buildPaginationMeta(deduplicated.length, page, limit));
  } catch (err) {
    console.error('List announcements error:', err);
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
    const { id } = req.params;
    let existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing && req.body.title) {
      existing = await prisma.announcement.findFirst({ where: { title: req.body.title } });
    }
    if (!existing) {
      sendNotFound(res);
      return;
    }

    const updateData: any = {};
    if (typeof req.body.title === 'string') updateData.title = req.body.title;
    if (typeof req.body.content === 'string') updateData.content = req.body.content;
    if (typeof req.body.isPinned === 'boolean') updateData.isPinned = req.body.isPinned;
    if (req.body.targetRoles || req.body.targetRole) {
      updateData.targetRoles = sanitizeRoles(req.body.targetRoles || req.body.targetRole);
    }
    if (req.body.expiresAt !== undefined) {
      updateData.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null;
    }

    const updated = await prisma.announcement.update({
      where: { id: existing.id },
      data: updateData,
    });
    sendSuccess(res, updated, 'Pengumuman diperbarui');
  } catch (err) {
    console.error('Update announcement error:', err);
    sendError(res, 'Gagal memperbarui pengumuman');
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing && (req.query.title || req.body?.title)) {
      const titleSearch = String(req.query.title || req.body?.title);
      existing = await prisma.announcement.findFirst({ where: { title: titleSearch } });
    }
    if (existing) {
      await prisma.announcement.delete({ where: { id: existing.id } });
    }
    sendSuccess(res, null, 'Pengumuman dihapus');
  } catch { sendError(res, 'Gagal menghapus pengumuman'); }
};
