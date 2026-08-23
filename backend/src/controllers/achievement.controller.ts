// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendCreated, sendError, parsePagination, buildPaginationMeta } from '../utils/response';
import { AuthRequest } from '../types';

export const listAchievements = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [total, items] = await Promise.all([
      prisma.achievement.count(),
      prisma.achievement.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    sendSuccess(res, items, 'Data prestasi berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch (err) {
    console.error('List achievements error:', err);
    sendError(res, 'Gagal mengambil data prestasi');
  }
};

export const createAchievement = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, level, year, winner, imageUrl, photo } = req.body;
    if (!title) {
      sendError(res, 'Judul prestasi wajib diisi', 400);
      return;
    }

    const item = await prisma.achievement.create({
      data: {
        title,
        description: description || winner || '',
        category: category || 'siswa',
        level: level || 'kota',
        year: year ? Number(year) : new Date().getFullYear(),
        photo: imageUrl || photo || null,
      },
    });

    sendCreated(res, item, 'Prestasi berhasil ditambahkan');
  } catch (err) {
    console.error('Create achievement error:', err);
    sendError(res, 'Gagal menambah prestasi');
  }
};

export const deleteAchievement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await prisma.achievement.findUnique({ where: { id } });

    if (!existing && (req.query.title || req.body?.title)) {
      const titleSearch = String(req.query.title || req.body?.title);
      existing = await prisma.achievement.findFirst({ where: { title: titleSearch } });
    }

    if (existing) {
      await prisma.achievement.delete({ where: { id: existing.id } });
    }

    sendSuccess(res, null, 'Prestasi berhasil dihapus');
  } catch (err) {
    console.error('Delete achievement error:', err);
    sendError(res, 'Gagal menghapus prestasi');
  }
};
