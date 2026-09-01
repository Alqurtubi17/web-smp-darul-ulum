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

    const where = {
      ...(subjectId && { subjectId }),
      ...(classId && { classId }),
      ...(status && { status }),
    };

    const [total, items] = await Promise.all([
      prisma.assignment.count({ where }),
      prisma.assignment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          subject: { select: { id: true, name: true, code: true } },
          teacher: { select: { id: true, fullName: true } },
          submissions: {
            include: {
              student: { select: { id: true, fullName: true, nis: true } }
            }
          },
          _count: { select: { submissions: true } },
        },
      }),
    ]);

    sendSuccess(res, items, 'Tugas berhasil diambil', 200, buildPaginationMeta(total, page, limit));
  } catch { sendError(res, 'Gagal mengambil tugas'); }
};

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    let teacher = req.user?.userId ? await prisma.teacher.findFirst({ where: { userId: req.user.userId } }) : null;
    if (!teacher) {
      teacher = await prisma.teacher.findFirst();
    }
    if (!teacher) { sendError(res, 'Data guru tidak ditemukan', 403); return; }

    const { title, description, subject, subjectId, classId, dueDate, maxScore, fileUrl, submissionLink, academicYear, semester } = req.body;

    let subObj = null;
    if (subjectId) {
      subObj = await prisma.subject.findUnique({ where: { id: subjectId } });
    }
    if (!subObj && subject) {
      subObj = await prisma.subject.findFirst({ where: { name: subject } });
    }
    if (!subObj) {
      subObj = await prisma.subject.findFirst();
    }
    if (!subObj) {
      subObj = await prisma.subject.create({ data: { name: subject || 'Matematika', code: 'MTK' } });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: title || 'Tugas Baru',
        description: description || null,
        teacherId: teacher.id,
        subjectId: subObj.id,
        classId: classId || '8A',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxScore: parseFloat(maxScore || '100'),
        fileUrl: fileUrl || submissionLink || null,
        academicYear: academicYear || '2024/2025',
        semester: parseInt(semester || '1'),
      },
      include: { subject: true, teacher: { select: { fullName: true } } },
    });
    sendCreated(res, assignment, 'Tugas berhasil dibuat');
  } catch (err) {
    console.error('Create assignment error:', err);
    sendError(res, 'Gagal membuat tugas');
  }
};

export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id },
      include: {
        subject: true,
        teacher: { select: { fullName: true } },
        submissions: {
          include: { student: { select: { id: true, fullName: true, nis: true } } },
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
    const { title, description, classId, dueDate, maxScore, fileUrl } = req.body;
    const updated = await prisma.assignment.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(classId && { classId }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(maxScore !== undefined && { maxScore: parseFloat(maxScore) }),
        ...(fileUrl !== undefined && { fileUrl }),
      },
      include: { subject: true },
    });
    sendSuccess(res, updated, 'Tugas diperbarui');
  } catch (err) {
    console.error('Update assignment error:', err);
    sendError(res, 'Gagal memperbarui tugas');
  }
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
    let teacher = await prisma.teacher.findFirst({ where: { userId: req.user?.userId } });
    if (!teacher) {
      teacher = await prisma.teacher.findFirst();
    }
    if (!teacher) { sendError(res, 'Data guru tidak ditemukan', 403); return; }

    let subject = await prisma.subject.findFirst();
    if (!subject) {
      subject = await prisma.subject.create({ data: { name: 'Umum', code: 'UMUM' } });
    }

    const { title, description, subjectId, classId, fileUrl, externalUrl, type, academicYear, semester } = req.body;

    const material = await prisma.material.create({
      data: {
        title: title || 'Modul Pembelajaran',
        description: description || null,
        teacherId: teacher.id,
        subjectId: subjectId || subject.id,
        classId: classId || '8A',
        fileUrl: fileUrl || null,
        externalUrl: externalUrl || null,
        type: type || 'document',
        academicYear: academicYear || '2024/2025',
        semester: parseInt(semester || '1'),
      },
      include: {
        subject: true,
        teacher: { select: { fullName: true } }
      }
    });
    sendCreated(res, material, 'Materi berhasil diupload');
  } catch (err) {
    console.error('Upload material error:', err);
    sendError(res, 'Gagal mengupload materi');
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.material.findUnique({ where: { id: req.params.id } });
    if (!existing) { sendNotFound(res); return; }
    const { title, description, classId, fileUrl, externalUrl, type } = req.body;
    const updated = await prisma.material.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(classId !== undefined && { classId }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(externalUrl !== undefined && { externalUrl }),
        ...(type !== undefined && { type }),
      },
    });
    sendSuccess(res, updated, 'Materi berhasil diperbarui');
  } catch { sendError(res, 'Gagal memperbarui materi'); }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    await prisma.material.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Materi dihapus');
  } catch { sendError(res, 'Gagal menghapus materi'); }
};
