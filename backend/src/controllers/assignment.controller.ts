// @ts-nocheck
import { Request, Response } from 'express';
import { AssignmentStatus, SubmissionStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { sendSuccess, sendCreated, sendError, sendNotFound, buildPaginationMeta, parsePagination } from '../utils/response';
import { AuthRequest } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// ASSIGNMENTS (file URL dari UploadThing, bukan multer)
// ══════════════════════════════════════════════════════════════════════════════

export const listAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { subjectId, classId, status } = req.query;

    let teacherId;
    if (req.user?.role === 'GURU') {
      const teacher = await prisma.teacher.findFirst({ where: { userId: req.user.userId } });
      teacherId = teacher?.id;
    }

    const where = {
      ...(teacherId && { teacherId }),
      ...(subjectId && { subjectId }),
      ...(classId && { classId }),
      ...(status && { status }),
    };

    const [total, items] = await Promise.all([
      prisma.assignment.count({ where }),
      prisma.assignment.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subject: { select: { id: true, name: true, code: true } },
          teacher: { select: { id: true, fullName: true } },
          _count: { select: { submissions: true } },
        },
      }),
    ]);

    sendSuccess(res, items, 'Tugas berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch { sendError(res, 'Gagal mengambil tugas'); }
};

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await prisma.teacher.findFirst({ where: { userId: req.user.userId } });
    if (!teacher) { sendError(res, 'Data guru tidak ditemukan', 403); return; }

    const { title, description, subjectId, classId, dueDate, maxScore, fileUrl, academicYear, semester } = req.body;

    const assignment = await prisma.assignment.create({
      data: {
        title, description,
        teacherId: teacher.id,
        subjectId, classId,
        dueDate: new Date(dueDate),
        maxScore: parseFloat(maxScore || '100'),
        fileUrl: fileUrl || null, // URL dari UploadThing
        academicYear: academicYear || '2024/2025',
        semester: parseInt(semester || '1'),
      },
      include: { subject: true },
    });
    sendCreated(res, assignment, 'Tugas berhasil dibuat');
  } catch { sendError(res, 'Gagal membuat tugas'); }
};

export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id },
      include: {
        subject: true,
        teacher: { select: { fullName: true } },
        submissions: {
          include: { student: { select: { fullName: true, nis: true } } },
        },
      },
    });
    if (!assignment) { sendNotFound(res); return; }
    sendSuccess(res, assignment);
  } catch { sendError(res, 'Gagal mengambil tugas'); }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.assignment.findUnique({ where: { id: req.params.id } });
    if (!existing) { sendNotFound(res); return; }
    const updated = await prisma.assignment.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, updated, 'Tugas diperbarui');
  } catch { sendError(res, 'Gagal memperbarui tugas'); }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    await prisma.assignment.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Tugas dihapus');
  } catch { sendError(res, 'Gagal menghapus tugas'); }
};

// ─── SUBMIT (fileUrl dari UploadThing) ───────────────────────────────────────
export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const student = await prisma.student.findFirst({ where: { userId: req.user.userId } });
    if (!student) { sendError(res, 'Data siswa tidak ditemukan', 403); return; }

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment || assignment.status === AssignmentStatus.DITUTUP) {
      sendError(res, 'Tugas tidak ditemukan atau sudah ditutup', 400); return;
    }

    const { content, fileUrl } = req.body;
    const isLate = new Date() > assignment.dueDate;

    const submission = await prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId: student.id } },
      create: {
        assignmentId, studentId: student.id,
        content, fileUrl: fileUrl || null,
        status: isLate ? SubmissionStatus.TERLAMBAT : SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      update: {
        content, fileUrl: fileUrl || null,
        status: isLate ? SubmissionStatus.TERLAMBAT : SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    sendSuccess(res, submission, isLate ? 'Tugas dikumpulkan (terlambat)' : 'Tugas berhasil dikumpulkan');
  } catch { sendError(res, 'Gagal mengumpulkan tugas'); }
};

export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { score, feedback } = req.body;
    const updated = await prisma.assignmentSubmission.update({
      where: { id: req.params.submissionId },
      data: { score: parseFloat(score), feedback, status: SubmissionStatus.DINILAI, gradedAt: new Date() },
    });
    sendSuccess(res, updated, 'Nilai tugas berhasil diberikan');
  } catch { sendError(res, 'Gagal memberikan nilai'); }
};

// ══════════════════════════════════════════════════════════════════════════════
// MATERIALS (fileUrl dari UploadThing)
// ══════════════════════════════════════════════════════════════════════════════

export const listMaterials = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { subjectId, classId } = req.query;

    let teacherId;
    if (req.user?.role === 'GURU') {
      const teacher = await prisma.teacher.findFirst({ where: { userId: req.user.userId } });
      teacherId = teacher?.id;
    }

    const where = {
      ...(teacherId && { teacherId }),
      ...(subjectId && { subjectId }),
      ...(classId && { classId }),
    };

    const [total, items] = await Promise.all([
      prisma.material.count({ where }),
      prisma.material.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subject: { select: { name: true, code: true } },
          teacher: { select: { fullName: true } },
        },
      }),
    ]);

    sendSuccess(res, items, 'Materi berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch { sendError(res, 'Gagal mengambil materi'); }
};

export const uploadMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await prisma.teacher.findFirst({ where: { userId: req.user.userId } });
    if (!teacher) { sendError(res, 'Data guru tidak ditemukan', 403); return; }

    const { title, description, subjectId, classId, fileUrl, externalUrl, type, academicYear, semester } = req.body;

    const material = await prisma.material.create({
      data: {
        title, description,
        teacherId: teacher.id,
        subjectId, classId,
        fileUrl: fileUrl || null,       // dari UploadThing
        externalUrl: externalUrl || null, // link YouTube/web
        type: type || 'document',
        academicYear: academicYear || '2024/2025',
        semester: parseInt(semester || '1'),
      },
    });
    sendCreated(res, material, 'Materi berhasil diupload');
  } catch { sendError(res, 'Gagal mengupload materi'); }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    await prisma.material.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Materi dihapus');
  } catch { sendError(res, 'Gagal menghapus materi'); }
};
