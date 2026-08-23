// @ts-nocheck — Prisma client will be generated before compilation
import { Request, Response } from 'express';
import { PaymentStatus, PaymentType, BorrowingStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { sendSuccess, sendCreated, sendError, sendNotFound, buildPaginationMeta, parsePagination } from '../utils/response';
import { AuthRequest } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// PAYMENTS
// ══════════════════════════════════════════════════════════════════════════════

export const getStudentPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { academicYear, type, status } = req.query as Record<string, string>;

    const payments = await prisma.payment.findMany({
      where: {
        studentId,
        ...(academicYear && { academicYear }),
        ...(type && { type: type as PaymentType }),
        ...(status && { status: status as PaymentStatus }),
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    const totalTagihan = payments.filter(p => p.status !== PaymentStatus.PAID).reduce((a, b) => a + b.amount, 0);
    const totalLunas = payments.filter(p => p.status === PaymentStatus.PAID).reduce((a, b) => a + b.amount, 0);

    sendSuccess(res, { payments, summary: { totalTagihan, totalLunas } }, 'Data pembayaran berhasil diambil');
  } catch { sendError(res, 'Gagal mengambil data pembayaran'); }
};

export const createPaymentBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, type, amount, dueDate, month, year, academicYear, notes } = req.body;

    const payment = await prisma.payment.create({
      data: {
        studentId, type, amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        month: month ? parseInt(month) : undefined,
        year: year ? parseInt(year) : undefined,
        academicYear, notes,
        processedBy: req.user?.userId,
      },
    });
    sendCreated(res, payment, 'Tagihan berhasil dibuat');
  } catch { sendError(res, 'Gagal membuat tagihan'); }
};

export const createBulkSPP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, amount, month, year, academicYear, dueDate } = req.body;

    const students = await prisma.student.findMany({
      where: { classId, isActive: true },
      select: { id: true },
    });

    const bills = await prisma.payment.createMany({
      data: students.map(s => ({
        studentId: s.id,
        type: PaymentType.SPP,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        academicYear,
        dueDate: new Date(dueDate),
        processedBy: req.user?.userId,
      })),
      skipDuplicates: true,
    });

    sendCreated(res, { count: bills.count }, `Tagihan SPP berhasil dibuat untuk ${bills.count} siswa`);
  } catch { sendError(res, 'Gagal membuat tagihan SPP massal'); }
};

export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { method, transactionId } = req.body;

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) { sendNotFound(res, 'Tagihan tidak ditemukan'); return; }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.PAID,
        method,
        transactionId,
        paidAt: new Date(),
        processedBy: req.user?.userId,
      },
    });
    sendSuccess(res, updated, 'Pembayaran berhasil dicatat');
  } catch { sendError(res, 'Gagal mencatat pembayaran'); }
};

export const getPaymentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { academicYear, month, year } = req.query as Record<string, string>;

    const [total, paid, pending, overdue] = await Promise.all([
      prisma.payment.aggregate({ where: { academicYear }, _sum: { amount: true }, _count: true }),
      prisma.payment.aggregate({ where: { academicYear, status: PaymentStatus.PAID }, _sum: { amount: true }, _count: true }),
      prisma.payment.count({ where: { academicYear, status: PaymentStatus.PENDING } }),
      prisma.payment.count({ where: { academicYear, status: PaymentStatus.PENDING, dueDate: { lt: new Date() } } }),
    ]);

    sendSuccess(res, {
      totalTagihan: total._sum.amount || 0,
      totalLunas: paid._sum.amount || 0,
      jumlahLunas: paid._count,
      jumlahPending: pending,
      jumlahOverdue: overdue,
    }, 'Statistik pembayaran berhasil diambil');
  } catch { sendError(res, 'Gagal mengambil statistik pembayaran'); }
};

// ══════════════════════════════════════════════════════════════════════════════
// LIBRARY (BOOKS & BORROWING)
// ══════════════════════════════════════════════════════════════════════════════

export const listBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);
    const { search, category } = req.query as Record<string, string>;

    const where = {
      isActive: true,
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { author: { contains: search, mode: 'insensitive' as const } },
          { isbn: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where, skip, take: limit,
        orderBy: { title: 'asc' },
        select: {
          id: true, isbn: true, title: true, author: true,
          publisher: true, year: true, category: true, cover: true,
          totalStock: true, availableStock: true, location: true,
        },
      }),
    ]);

    sendSuccess(res, books, 'Daftar buku berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch { sendError(res, 'Gagal mengambil daftar buku'); }
};

export const createBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await prisma.book.create({ data: req.body });
    sendCreated(res, book, 'Buku berhasil ditambahkan');
  } catch { sendError(res, 'Gagal menambahkan buku'); }
};

export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await prisma.book.findUnique({ where: { id: req.params.id } });
    if (!existing) { sendNotFound(res, 'Buku tidak ditemukan'); return; }
    const updated = await prisma.book.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, updated, 'Buku diperbarui');
  } catch { sendError(res, 'Gagal memperbarui buku'); }
};

export const borrowBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, studentId, dueDate } = req.body;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || book.availableStock <= 0) {
      sendError(res, 'Buku tidak tersedia untuk dipinjam', 400); return;
    }

    const [borrowing] = await prisma.$transaction([
      prisma.borrowing.create({
        data: {
          bookId, studentId,
          dueDate: new Date(dueDate),
          processedBy: req.user?.userId,
        },
        include: { book: { select: { title: true } }, student: { select: { fullName: true, nis: true } } },
      }),
      prisma.book.update({ where: { id: bookId }, data: { availableStock: { decrement: 1 } } }),
    ]);

    sendCreated(res, borrowing, 'Peminjaman berhasil dicatat');
  } catch { sendError(res, 'Gagal mencatat peminjaman'); }
};

export const returnBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const borrowing = await prisma.borrowing.findUnique({
      where: { id }, include: { book: true },
    });
    if (!borrowing) { sendNotFound(res, 'Data peminjaman tidak ditemukan'); return; }

    const returnDate = new Date();
    const isLate = returnDate > borrowing.dueDate;
    const lateDays = isLate ? Math.ceil((returnDate.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const fineAmount = lateDays * 1000; // Rp 1.000/hari

    const [updated] = await prisma.$transaction([
      prisma.borrowing.update({
        where: { id },
        data: {
          returnedAt: returnDate,
          status: isLate ? BorrowingStatus.TERLAMBAT : BorrowingStatus.DIKEMBALIKAN,
          fineAmount: fineAmount || null,
          processedBy: req.user?.userId,
        },
      }),
      prisma.book.update({ where: { id: borrowing.bookId }, data: { availableStock: { increment: 1 } } }),
    ]);

    sendSuccess(res, { ...updated, lateDays, fineAmount },
      isLate ? `Dikembalikan terlambat ${lateDays} hari, denda Rp ${fineAmount.toLocaleString('id-ID')}` : 'Buku berhasil dikembalikan');
  } catch { sendError(res, 'Gagal mencatat pengembalian'); }
};

export const listBorrowings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);
    const { studentId, status } = req.query as Record<string, string>;

    const where = {
      ...(studentId && { studentId }),
      ...(status && { status: status as BorrowingStatus }),
    };

    const [total, items] = await Promise.all([
      prisma.borrowing.count({ where }),
      prisma.borrowing.findMany({
        where, skip, take: limit,
        orderBy: { borrowedAt: 'desc' },
        include: {
          book: { select: { title: true, isbn: true } },
          student: { select: { fullName: true, nis: true, class: { select: { name: true } } } },
        },
      }),
    ]);

    sendSuccess(res, items, 'Data peminjaman berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch { sendError(res, 'Gagal mengambil data peminjaman'); }
};

export const deletePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.payment.delete({ where: { id } });
    sendSuccess(res, null, 'Tagihan berhasil dihapus');
  } catch { sendError(res, 'Gagal menghapus tagihan'); }
};

export const clearAllPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await prisma.payment.deleteMany({});
    sendSuccess(res, { count: count.count }, `Berhasil menghapus ${count.count} data tagihan`);
  } catch { sendError(res, 'Gagal menghapus seluruh tagihan'); }
};

export const deleteBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.book.delete({ where: { id } });
    sendSuccess(res, null, 'Buku berhasil dihapus');
  } catch { sendError(res, 'Gagal menghapus buku'); }
};

