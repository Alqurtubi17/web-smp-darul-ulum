// @ts-nocheck — Prisma client will be generated before compilation
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import {
  sendSuccess, sendCreated, sendError, sendNotFound,
  buildPaginationMeta, parsePagination,
} from '../utils/response';
import { AuthRequest } from '../types';

export const listEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);
    const { month, year, category } = req.query as Record<string, string>;

    const where: any = {
      isPublic: true,
      ...(category && { category }),
    };

    if (year) {
      const filterYear = parseInt(year);
      const filterMonth = month ? parseInt(month) - 1 : undefined;
      const startDate = filterMonth !== undefined
        ? new Date(filterYear, filterMonth, 1)
        : new Date(filterYear, 0, 1);
      const endDate = filterMonth !== undefined
        ? new Date(filterYear, filterMonth + 1, 0, 23, 59, 59)
        : new Date(filterYear, 11, 31, 23, 59, 59);
      where.startDate = { gte: startDate, lte: endDate };
    }

    const items = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    const paginated = items.slice(skip, skip + limit);

    sendSuccess(res, paginated, 'Agenda berhasil diambil', 200, buildPaginationMeta(items.length, page, limit));
  } catch (err) {
    console.error('List events error:', err);
    sendError(res, 'Gagal mengambil agenda');
  }
};

export const getUpcomingEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.event.findMany({
      where: { isPublic: true, startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 5,
    });
    sendSuccess(res, items, 'Agenda mendatang berhasil diambil');
  } catch { sendError(res, 'Gagal mengambil agenda mendatang'); }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await prisma.event.findFirst({ where: { id: req.params.id, isPublic: true } });
    if (!item) { sendNotFound(res, 'Agenda tidak ditemukan'); return; }
    sendSuccess(res, item);
  } catch { sendError(res, 'Gagal mengambil agenda'); }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, location, organizer, category, startDate, endDate, isPublic } = req.body;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : start;

    const item = await prisma.event.create({
      data: {
        title,
        description: description || title,
        location: location || 'SMP Darul Ulum Surabaya',
        organizer: organizer || 'Dinas Pendidikan Kota Surabaya',
        category: category || 'Kalender Akademik Sekolah',
        startDate: start,
        endDate: end,
        isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
        authorId: req.user?.userId || null,
      },
    });
    sendCreated(res, item, 'Agenda berhasil dibuat');
  } catch (err) {
    console.error('Create event error:', err);
    sendError(res, 'Gagal membuat agenda');
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) { sendNotFound(res); return; }
    const updated = await prisma.event.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, updated, 'Agenda diperbarui');
  } catch { sendError(res, 'Gagal memperbarui agenda'); }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Agenda dihapus');
  } catch { sendError(res, 'Gagal menghapus agenda'); }
};
