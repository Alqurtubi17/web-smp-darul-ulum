// @ts-nocheck
import { Request, Response } from 'express';
import { AttendanceStatus, GradeType } from '@prisma/client';
import prisma from '../utils/prisma';
import emailService from '../utils/email';
import {
  sendSuccess, sendCreated, sendError, sendNotFound,
  buildPaginationMeta, parsePagination,
} from '../utils/response';
import { AuthRequest } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// GRADES
// ══════════════════════════════════════════════════════════════════════════════

export const getStudentGrades = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { semester, academicYear } = req.query;
    const grades = await prisma.grade.findMany({
      where: {
        studentId,
        ...(semester && { semester: parseInt(semester as string) }),
        ...(academicYear && { academicYear: academicYear as string }),
      },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: [{ subject: { name: 'asc' } }, { type: 'asc' }],
    });
    sendSuccess(res, grades);
  } catch { sendError(res, 'Gagal mengambil nilai'); }
};

export const inputGrade = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, subjectId, type, score, semester, academicYear, notes } = req.body;
    const grade = await prisma.grade.create({
      data: { studentId, subjectId, type, score: parseFloat(score), semester: parseInt(semester || '1'), academicYear: academicYear || '2024/2025', notes, gradedBy: req.user?.userId },
      include: { subject: { select: { name: true } }, student: { select: { fullName: true } } },
    });
    sendCreated(res, grade, 'Nilai berhasil diinput');
  } catch { sendError(res, 'Gagal input nilai'); }
};

// ─── BATCH INPUT + EMAIL NOTIFIKASI ───────────────────────────────────────────
export const inputGradeBatch = async (req: AuthRequest, res: Response) => {
  try {
    const { grades } = req.body;
    if (!Array.isArray(grades) || grades.length === 0) {
      sendError(res, 'Data nilai tidak boleh kosong', 400); return;
    }

    const created = await prisma.$transaction(
      grades.map((g: { studentId: string; subjectId?: string; type: string; score: number; semester?: number; academicYear?: string; notes?: string }) =>
        prisma.grade.create({
          data: {
            studentId: g.studentId,
            subjectId: g.subjectId,
            type: g.type as GradeType,
            score: parseFloat(String(g.score)),
            semester: parseInt(String(g.semester || 1)),
            academicYear: g.academicYear || '2024/2025',
            notes: g.notes,
            gradedBy: req.user?.userId,
          },
          include: {
            student: {
              include: {
                parent: { select: { email: true } },
              },
            },
            subject: { select: { name: true } },
          },
        })
      )
    );

    // ─── Kirim email notifikasi ke orang tua secara async ────────────────────
    Promise.allSettled(
      created
        .filter(g => g.student?.parent?.email)
        .map(g =>
          emailService.sendGradeNotification(g.student.parent.email, {
            studentName: g.student.fullName,
            subject: g.subject?.name || 'Pelajaran',
            type: g.type,
            score: g.score,
            maxScore: 100,
          })
        )
    ).catch(() => {}); // fire & forget

    sendCreated(res, { count: created.length }, `${created.length} nilai berhasil diinput`);
  } catch (err) {
    console.error(err);
    sendError(res, 'Gagal batch input nilai');
  }
};

export const updateGrade = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.grade.findUnique({ where: { id: req.params.id } });
    if (!existing) { sendNotFound(res); return; }
    const updated = await prisma.grade.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, updated, 'Nilai diperbarui');
  } catch { sendError(res, 'Gagal memperbarui nilai'); }
};

export const deleteGrade = async (req: Request, res: Response) => {
  try {
    await prisma.grade.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Nilai dihapus');
  } catch { sendError(res, 'Gagal menghapus nilai'); }
};

// ══════════════════════════════════════════════════════════════════════════════
// ATTENDANCE
// ══════════════════════════════════════════════════════════════════════════════

export const getStudentAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;
    let dateWhere = {};
    if (month && year) {
      const start = new Date(`${year}-${String(month).padStart(2,'0')}-01`);
      const end = new Date(start); end.setMonth(end.getMonth() + 1);
      dateWhere = { date: { gte: start, lt: end } };
    }
    const attendance = await prisma.attendance.findMany({
      where: { studentId, ...dateWhere },
      orderBy: { date: 'desc' },
    });
    sendSuccess(res, attendance);
  } catch { sendError(res, 'Gagal mengambil absensi'); }
};

export const getClassAttendanceSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { month, year } = req.query;
    let dateWhere = {};
    if (month && year) {
      const start = new Date(`${year}-${String(month).padStart(2,'0')}-01`);
      const end = new Date(start); end.setMonth(end.getMonth() + 1);
      dateWhere = { date: { gte: start, lt: end } };
    }
    const summary = await prisma.attendance.groupBy({
      by: ['status'],
      where: { student: { classId }, ...dateWhere },
      _count: { status: true },
    });
    sendSuccess(res, summary);
  } catch { sendError(res, 'Gagal mengambil rekap absensi'); }
};

// ─── BATCH ATTENDANCE + EMAIL jika Alpha ──────────────────────────────────────
export const inputAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { records, classId, date } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      sendError(res, 'Data absensi kosong', 400); return;
    }

    const dateObj = new Date(date || new Date());

    // Upsert setiap record
    const results = await Promise.allSettled(
      records.map((r: { studentId: string; status: AttendanceStatus; note?: string }) =>
        prisma.attendance.upsert({
          where: { studentId_date: { studentId: r.studentId, date: dateObj } },
          create: { studentId: r.studentId, date: dateObj, status: r.status, note: r.note, recordedBy: req.user?.userId, classId },
          update: { status: r.status, note: r.note, recordedBy: req.user?.userId },
          include: {
            student: {
              include: { parent: { select: { email: true, fullName: true } } },
            },
          },
        })
      )
    );

    const saved = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<any>).value);
    const alphaStudents = saved.filter(a => a.status === 'ALPHA');

    // Kirim email ke ortu untuk siswa Alpha
    const dateLabel = new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'long', year:'numeric' }).format(dateObj);
    Promise.allSettled(
      alphaStudents
        .filter(a => a.student?.parent?.email)
        .map(a =>
          emailService.sendEmail(
            a.student.parent.email,
            `⚠️ Informasi Kehadiran — ${a.student.fullName}`,
            `<p>Yth. Orang Tua/Wali,</p><p>Pada tanggal <strong>${dateLabel}</strong>, putra/putri Anda <strong>${a.student.fullName}</strong> tercatat <strong>TIDAK HADIR (ALPHA)</strong> di sekolah.</p><p>Mohon konfirmasi ke wali kelas jika ada keterangan.</p>`
          )
        )
    ).catch(() => {});

    sendCreated(res, { count: saved.length, alphaNotified: alphaStudents.length }, `${saved.length} absensi disimpan`);
  } catch (err) {
    console.error(err);
    sendError(res, 'Gagal menyimpan absensi');
  }
};
