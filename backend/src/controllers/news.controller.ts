// @ts-nocheck
import { Request, Response } from 'express';
import { NewsStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import {
  sendSuccess, sendCreated, sendError, sendNotFound,
  buildPaginationMeta, parsePagination,
} from '../utils/response';
import { AuthRequest } from '../types';

// ─── LIST NEWS (public) ───────────────────────────────────────────────────────
export const getAllNews = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, category } = req.query;

    const where = {
      status: NewsStatus.PUBLISHED,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
    };

    const [total, items] = await Promise.all([
      prisma.news.count({ where }),
      prisma.news.findMany({
        where, skip, take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true,
          thumbnail: true, category: true, tags: true,
          viewCount: true, publishedAt: true,
        },
      }),
    ]);

    sendSuccess(res, items, 'Berita berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch { sendError(res, 'Gagal mengambil berita'); }
};

// ─── GET BY SLUG (public) ────────────────────────────────────────────────────
export const getNewsBySlug = async (req: Request, res: Response) => {
  try {
    const news = await prisma.news.findUnique({ where: { slug: req.params.slug } });
    if (!news || news.status !== NewsStatus.PUBLISHED) {
      sendNotFound(res, 'Berita tidak ditemukan'); return;
    }
    await prisma.news.update({ where: { id: news.id }, data: { viewCount: { increment: 1 } } });
    sendSuccess(res, news);
  } catch { sendError(res, 'Gagal mengambil berita'); }
};

// ─── CREATE (admin) — thumbnail URL dari UploadThing ─────────────────────────
export const createNews = async (req: AuthRequest, res: Response) => {
  try {
    const { title, excerpt, content, thumbnail, category, tags, status } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();

    const news = await prisma.news.create({
      data: {
        title, slug, excerpt, content,
        thumbnail: thumbnail || null, // URL dari UploadThing
        category,
        tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
        status: status || NewsStatus.DRAFT,
        authorId: req.user?.userId,
        publishedAt: status === NewsStatus.PUBLISHED ? new Date() : null,
      },
    });

    sendCreated(res, news, 'Berita berhasil dibuat');
  } catch (err) {
    console.error(err);
    sendError(res, 'Gagal membuat berita');
  }
};

// ─── UPDATE (admin) ──────────────────────────────────────────────────────────
export const updateNews = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.news.findUnique({ where: { id: req.params.id } });
    if (!existing) { sendNotFound(res); return; }

    const { title, excerpt, content, thumbnail, category, tags, status } = req.body;

    const news = await prisma.news.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content && { content }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(category !== undefined && { category }),
        ...(tags && { tags: Array.isArray(tags) ? tags : [tags] }),
        ...(status && { status }),
        ...(status === NewsStatus.PUBLISHED && !existing.publishedAt && { publishedAt: new Date() }),
      },
    });

    sendSuccess(res, news, 'Berita berhasil diperbarui');
  } catch { sendError(res, 'Gagal memperbarui berita'); }
};

// ─── DELETE (admin) ──────────────────────────────────────────────────────────
export const deleteNews = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.news.findUnique({ where: { id: req.params.id } });
    if (!existing) { sendNotFound(res); return; }
    await prisma.news.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Berita berhasil dihapus');
  } catch { sendError(res, 'Gagal menghapus berita'); }
};

// ─── CATEGORIES (public) ─────────────────────────────────────────────────────
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.news.groupBy({
      by: ['category'],
      where: { status: NewsStatus.PUBLISHED, category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
    });
    sendSuccess(res, categories);
  } catch { sendError(res, 'Gagal mengambil kategori'); }
};
