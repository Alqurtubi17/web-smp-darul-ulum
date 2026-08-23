// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendCreated, sendError, parsePagination, buildPaginationMeta } from '../utils/response';
import { AuthRequest } from '../types';

export const listDownloads = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [total, items] = await Promise.all([
      prisma.download.count({ where: { isActive: true } }),
      prisma.download.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    sendSuccess(res, items, 'Berkas unduhan berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch (err) {
    console.error('List downloads error:', err);
    sendError(res, 'Gagal mengambil berkas unduhan');
  }
};

export const createDownload = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, fileUrl } = req.body;
    if (!title || !fileUrl) {
      sendError(res, 'Judul dan URL file wajib diisi', 400);
      return;
    }

    const item = await prisma.download.create({
      data: {
        title,
        description: description || '',
        category: category || 'Dokumen',
        fileUrl,
        downloadCount: 0,
        isActive: true,
      },
    });

    sendCreated(res, item, 'Berkas unduhan berhasil ditambahkan');
  } catch (err) {
    console.error('Create download error:', err);
    sendError(res, 'Gagal menambah berkas unduhan');
  }
};

export const deleteDownload = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await prisma.download.findUnique({ where: { id } });

    if (!existing && (req.query.title || req.body?.title)) {
      const titleSearch = String(req.query.title || req.body?.title);
      existing = await prisma.download.findFirst({ where: { title: titleSearch } });
    }

    if (existing) {
      await prisma.download.delete({ where: { id: existing.id } });
    }

    sendSuccess(res, null, 'Berkas unduhan berhasil dihapus');
  } catch (err) {
    console.error('Delete download error:', err);
    sendError(res, 'Gagal menghapus berkas unduhan');
  }
};
