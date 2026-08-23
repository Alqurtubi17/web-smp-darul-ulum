// @ts-nocheck
import { Request, Response } from 'express';
import { AdmissionStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import {
  sendSuccess, sendCreated, sendError, sendNotFound,
  buildPaginationMeta, parsePagination,
} from '../utils/response';
import { AuthRequest } from '../types';
import emailService from '../utils/email';

// Nomor pendaftaran: PDG-YYYY-XXXXX
const generateRegNumber = async (year: number): Promise<string> => {
  const count = await prisma.admission.count({
    where: { academicYear: `${year}/${year + 1}` },
  });
  return `PDG-${year}-${String(count + 1).padStart(5, '0')}`;
};

// ─── SUBMIT PPDB (file URLs dari UploadThing di body) ────────────────────────
export const submitAdmission = async (req: Request, res: Response) => {
  try {
    const year = new Date().getFullYear();
    const registrationNumber = await generateRegNumber(year);

    const {
      fullName, gender, birthPlace, birthDate, address, phone,
      parentName, parentPhone, parentEmail, previousSchool, graduationYear,
      // URL dari UploadThing (upload di frontend sebelum submit form)
      photoUrl, ijazahUrl, skhunUrl, aktaUrl, kkUrl,
    } = req.body;

    const admission = await prisma.admission.create({
      data: {
        registrationNumber,
        academicYear: `${year}/${year + 1}`,
        fullName, gender, birthPlace,
        birthDate: new Date(birthDate),
        address, phone,
        parentName, parentPhone, parentEmail,
        previousSchool,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        photoUrl, ijazahUrl, skhunUrl, aktaUrl, kkUrl,
        status: AdmissionStatus.PENDING,
      },
    });

    // Kirim email konfirmasi ke ortu (kalau ada email)
    if (parentEmail) {
      emailService.sendPPDBConfirmation(parentEmail, {
        name: fullName,
        regNumber: registrationNumber,
        academicYear: `${year}/${year + 1}`,
      }).catch(err => console.error('PPDB email error:', err));
    }

    sendCreated(res, {
      registrationNumber: admission.registrationNumber,
      id: admission.id,
    }, 'Pendaftaran berhasil! Simpan nomor pendaftaran Anda.');
  } catch (err) {
    console.error(err);
    sendError(res, 'Gagal mengirim pendaftaran');
  }
};

// ─── CEK STATUS (public) ──────────────────────────────────────────────────────
export const checkStatus = async (req: Request, res: Response) => {
  try {
    const admission = await prisma.admission.findUnique({
      where: { registrationNumber: req.params.registrationNumber },
      select: {
        id: true, registrationNumber: true, fullName: true,
        status: true, score: true, notes: true,
        rejectionReason: true, reviewedAt: true, acceptedAt: true,
        createdAt: true,
      },
    });
    if (!admission) { sendNotFound(res, 'Nomor pendaftaran tidak ditemukan'); return; }
    sendSuccess(res, admission);
  } catch { sendError(res, 'Gagal mengambil status'); }
};

// ─── LIST (admin) ─────────────────────────────────────────────────────────────
export const listAdmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, status, academicYear } = req.query;

    const where = {
      ...(status && { status }),
      ...(academicYear && { academicYear }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { registrationNumber: { contains: search, mode: 'insensitive' } },
          { parentPhone: { contains: search } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      prisma.admission.count({ where }),
      prisma.admission.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    sendSuccess(res, items, 'Data pendaftar berhasil diambil', 200,
      buildPaginationMeta(total, page, limit));
  } catch { sendError(res, 'Gagal mengambil data pendaftar'); }
};

// ─── DETAIL (admin) ───────────────────────────────────────────────────────────
export const getAdmissionById = async (req: AuthRequest, res: Response) => {
  try {
    const admission = await prisma.admission.findUnique({ where: { id: req.params.id } });
    if (!admission) { sendNotFound(res); return; }
    sendSuccess(res, admission);
  } catch { sendError(res, 'Gagal mengambil data'); }
};

// ─── UPDATE STATUS (admin) ────────────────────────────────────────────────────
export const updateAdmissionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, score, notes, rejectionReason } = req.body;

    const admission = await prisma.admission.findUnique({ where: { id: req.params.id } });
    if (!admission) { sendNotFound(res); return; }

    const updated = await prisma.admission.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(score !== undefined && { score: parseFloat(score) }),
        ...(notes && { notes }),
        ...(rejectionReason && { rejectionReason }),
        reviewedBy: req.user?.userId,
        reviewedAt: new Date(),
        ...(status === AdmissionStatus.LULUS && { acceptedAt: new Date() }),
      },
    });

    // Kirim notifikasi email hasil seleksi
    if (status === AdmissionStatus.LULUS && admission.parentEmail) {
      emailService.sendEmail(
        admission.parentEmail,
        `🎉 Selamat! ${admission.fullName} Diterima di SMP Darul Ulum`,
        `<p>Ananda <strong>${admission.fullName}</strong> dinyatakan <strong>DITERIMA</strong>. Segera lakukan daftar ulang.</p>`
      ).catch(() => {});
    }

    sendSuccess(res, updated, 'Status pendaftar berhasil diperbarui');
  } catch { sendError(res, 'Gagal memperbarui status'); }
};

// ─── STATISTIK (admin) ────────────────────────────────────────────────────────
export const getAdmissionStats = async (_req: Request, res: Response) => {
  try {
    const year = new Date().getFullYear();
    const academicYear = `${year}/${year + 1}`;

    const [total, byStatus, byGender] = await Promise.all([
      prisma.admission.count({ where: { academicYear } }),
      prisma.admission.groupBy({
        by: ['status'],
        where: { academicYear },
        _count: { status: true },
      }),
      prisma.admission.groupBy({
        by: ['gender'],
        where: { academicYear },
        _count: { gender: true },
      }),
    ]);

    sendSuccess(res, { total, byStatus, byGender, academicYear });
  } catch { sendError(res, 'Gagal mengambil statistik'); }
};

// ─── HAPUS SEMUA DATA PPDB (admin) ──────────────────────────────────────────
export const clearAllAdmissions = async (_req: AuthRequest, res: Response) => {
  try {
    await prisma.admission.deleteMany({});
    sendSuccess(res, null, 'Seluruh data pendaftar PPDB berhasil dihapus.');
  } catch (err) {
    console.error('Error clearAllAdmissions:', err);
    sendError(res, 'Gagal menghapus data PPDB');
  }
};

