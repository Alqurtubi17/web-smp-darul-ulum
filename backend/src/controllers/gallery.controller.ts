// @ts-nocheck
import { Request, Response } from 'express';
import { GalleryType } from '@prisma/client';
import prisma from '../utils/prisma';
import { sendSuccess, sendCreated, sendError, sendNotFound, buildPaginationMeta, parsePagination } from '../utils/response';
import { AuthRequest } from '../types';

// ─── LIST ALBUMS ──────────────────────────────────────────────────────────────
export const listAlbums = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { type } = req.query;
    const where = { isPublic: true, ...(type && { type: type as GalleryType }) };
    const [total, items] = await Promise.all([
      prisma.galleryAlbum.count({ where }),
      prisma.galleryAlbum.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { items: true } } },
      }),
    ]);
    sendSuccess(res, items, 'Album berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch { sendError(res, 'Gagal mengambil album'); }
};

export const getAlbumById = async (req: Request, res: Response) => {
  try {
    const album = await prisma.galleryAlbum.findFirst({
      where: { id: req.params.id, isPublic: true },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!album) { sendNotFound(res, 'Album tidak ditemukan'); return; }
    sendSuccess(res, album);
  } catch { sendError(res, 'Gagal mengambil album'); }
};

// ─── CREATE ALBUM (URL cover dari UploadThing body) ────────────────────────
export const createAlbum = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, coverUrl } = req.body;
    const album = await prisma.galleryAlbum.create({
      data: {
        title, description,
        type: type || GalleryType.FOTO,
        cover: coverUrl || null,
        authorId: req.user?.userId,
      },
    });
    sendCreated(res, album, 'Album berhasil dibuat');
  } catch { sendError(res, 'Gagal membuat album'); }
};

// ─── ADD ITEMS (array URLs dari UploadThing) ──────────────────────────────
export const addItemsToAlbum = async (req: AuthRequest, res: Response) => {
  try {
    const { albumId } = req.params;
    const { urls } = req.body; // array of { url, caption? }

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      sendError(res, 'Tidak ada URL file yang diberikan', 400); return;
    }

    const album = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });
    if (!album) { sendNotFound(res, 'Album tidak ditemukan'); return; }

    const existingCount = await prisma.galleryItem.count({ where: { albumId } });
    await prisma.galleryItem.createMany({
      data: urls.map((item: { url: string; caption?: string }, i: number) => ({
        albumId,
        url: typeof item === 'string' ? item : item.url,
        caption: typeof item === 'object' ? item.caption : undefined,
        type: album.type,
        order: existingCount + i,
      })),
    });

    sendCreated(res, { count: urls.length }, `${urls.length} item berhasil ditambahkan`);
  } catch { sendError(res, 'Gagal menambahkan item'); }
};

export const deleteAlbum = async (req: Request, res: Response) => {
  try {
    await prisma.galleryAlbum.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Album dihapus');
  } catch { sendError(res, 'Gagal menghapus album'); }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    await prisma.galleryItem.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Item dihapus');
  } catch { sendError(res, 'Gagal menghapus item'); }
};
