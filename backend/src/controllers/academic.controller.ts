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

// ══════════════════════════════════════════════════════════════════════════════
// CLASSES & HOMEROOM TEACHERS (WALI KELAS)
// ══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CLASSES = [
  { name: '7A', grade: 7, academicYear: '2026/2027', capacity: 32 },
  { name: '7B', grade: 7, academicYear: '2026/2027', capacity: 32 },
  { name: '8A', grade: 8, academicYear: '2026/2027', capacity: 32 },
  { name: '8B', grade: 8, academicYear: '2026/2027', capacity: 32 },
  { name: '9A', grade: 9, academicYear: '2026/2027', capacity: 32 },
  { name: '9B', grade: 9, academicYear: '2026/2027', capacity: 32 },
];

export const listClasses = async (_req: Request, res: Response) => {
  try {
    const count = await prisma.class.count();
    if (count === 0) {
      await prisma.class.createMany({
        data: DEFAULT_CLASSES,
        skipDuplicates: true,
      });
    }

    const [classes, teachers] = await Promise.all([
      prisma.class.findMany({
        orderBy: [{ grade: 'asc' }, { name: 'asc' }],
        include: {
          _count: { select: { students: true } },
        },
      }),
      prisma.teacher.findMany({
        where: { isActive: true },
        select: { id: true, fullName: true, nip: true, subject: true },
      }),
    ]);

    const teacherMap = new Map(teachers.map(t => [t.id, t]));

    const result = classes.map(c => ({
      ...c,
      studentCount: c._count.students,
      homeroomTeacher: c.homeroomTeacherId ? teacherMap.get(c.homeroomTeacherId) || null : null,
    }));

    sendSuccess(res, { classes: result, teachers }, 'Daftar kelas berhasil diambil');
  } catch {
    sendError(res, 'Gagal mengambil data kelas');
  }
};

export const createClass = async (req: AuthRequest, res: Response) => {
  try {
    const { name, grade, capacity, homeroomTeacherId, academicYear } = req.body;
    if (!name || !grade) {
      sendError(res, 'Nama kelas dan tingkat wajib diisi', 400);
      return;
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        grade: parseInt(String(grade)),
        capacity: capacity ? parseInt(String(capacity)) : 32,
        homeroomTeacherId: homeroomTeacherId || null,
        academicYear: academicYear || '2024/2025',
      },
    });

    sendCreated(res, newClass, 'Kelas berhasil dibuat');
  } catch {
    sendError(res, 'Gagal membuat kelas');
  }
};

export const updateClass = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, grade, capacity, homeroomTeacherId, isActive, academicYear } = req.body;

    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) { sendNotFound(res, 'Kelas tidak ditemukan'); return; }

    const updated = await prisma.class.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(grade && { grade: parseInt(String(grade)) }),
        ...(capacity !== undefined && { capacity: parseInt(String(capacity)) }),
        ...(homeroomTeacherId !== undefined && { homeroomTeacherId: homeroomTeacherId || null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(academicYear && { academicYear }),
      },
    });

    sendSuccess(res, updated, 'Data kelas / Wali Kelas berhasil diperbarui');
  } catch {
    sendError(res, 'Gagal memperbarui kelas');
  }
};

export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.class.delete({ where: { id } });
    sendSuccess(res, null, 'Kelas berhasil dihapus');
  } catch {
    sendError(res, 'Gagal menghapus kelas');
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// SUBJECTS (MATA PELAJARAN)
// ══════════════════════════════════════════════════════════════════════════════

const DEFAULT_SUBJECTS = [
  { code: 'MTK', name: 'Matematika', grade: null, creditHours: 4, description: 'Aljabar, Geometri & Aritmatika' },
  { code: 'IPA', name: 'Ilmu Pengetahuan Alam', grade: null, creditHours: 4, description: 'Fisika, Biologi & Kimia Dasar' },
  { code: 'IPS', name: 'Ilmu Pengetahuan Sosial', grade: null, creditHours: 3, description: 'Sejarah, Geografi & Ekonomi' },
  { code: 'BIN', name: 'Bahasa Indonesia', grade: null, creditHours: 4, description: 'Literasi & Tata Bahasa Indonesia' },
  { code: 'BIG', name: 'Bahasa Inggris', grade: null, creditHours: 4, description: 'English Grammar & Conversation' },
  { code: 'PAI', name: 'Pendidikan Agama Islam & Budi Pekerti', grade: null, creditHours: 3, description: 'Fiqih, Aqidah Akhlak & Al-Qur’an Hadits' },
  { code: 'PKN', name: 'Pancasila & Kewarganegaraan', grade: null, creditHours: 2, description: 'Ideologi Negara & Kebangsaan' },
  { code: 'TIK', name: 'Informatika / TIK', grade: null, creditHours: 2, description: 'Teknologi Informasi & Komputer' },
  { code: 'PJOK', name: 'PJOK & Olahraga', grade: null, creditHours: 2, description: 'Pendidikan Jasmani & Kesehatan' },
  { code: 'SBK', name: 'Seni Budaya & Keterampilan', grade: null, creditHours: 2, description: 'Seni Rupa & Keberagaman Budaya' },
  { code: 'BAR', name: 'Bahasa Arab', grade: null, creditHours: 2, description: 'Muatan Lokal Keislaman & Mufrodat' },
  { code: 'THF', name: 'Tahfidz Al-Qur’an', grade: null, creditHours: 3, description: 'Hafalan Al-Qur’an & Tajwid' },
];

export const listSubjects = async (_req: Request, res: Response) => {
  try {
    const count = await prisma.subject.count();
    if (count === 0) {
      await prisma.subject.createMany({
        data: DEFAULT_SUBJECTS,
        skipDuplicates: true,
      });
    }

    const subjects = await prisma.subject.findMany({
      orderBy: { code: 'asc' },
    });
    sendSuccess(res, subjects, 'Daftar mata pelajaran berhasil diambil');
  } catch {
    sendError(res, 'Gagal mengambil data mata pelajaran');
  }
};

export const createSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, grade, creditHours, description } = req.body;
    if (!code || !name) {
      sendError(res, 'Kode dan nama mata pelajaran wajib diisi', 400);
      return;
    }

    const existing = await prisma.subject.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (existing) {
      sendError(res, `Kode mata pelajaran ${code} sudah terdaftar`, 409);
      return;
    }

    const newSubject = await prisma.subject.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        grade: grade ? parseInt(String(grade)) : null,
        creditHours: creditHours ? parseInt(String(creditHours)) : 2,
        description: description || null,
      },
    });

    sendCreated(res, newSubject, 'Mata pelajaran berhasil ditambahkan');
  } catch {
    sendError(res, 'Gagal menambahkan mata pelajaran');
  }
};

export const updateSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, grade, creditHours, description, isActive } = req.body;

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) { sendNotFound(res, 'Mata pelajaran tidak ditemukan'); return; }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        ...(code && { code: code.trim().toUpperCase() }),
        ...(name && { name: name.trim() }),
        ...(grade !== undefined && { grade: grade ? parseInt(String(grade)) : null }),
        ...(creditHours !== undefined && { creditHours: parseInt(String(creditHours)) }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    sendSuccess(res, updated, 'Mata pelajaran berhasil diperbarui');
  } catch {
    sendError(res, 'Gagal memperbarui mata pelajaran');
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id } });
    sendSuccess(res, null, 'Mata pelajaran berhasil dihapus');
  } catch {
    sendError(res, 'Gagal menghapus mata pelajaran');
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// SCHEDULES (JADWAL MENGAJAR PER GURU)
// ══════════════════════════════════════════════════════════════════════════════

export const listSchedules = async (req: Request, res: Response) => {
  try {
    const { teacherId, classId, dayOfWeek } = req.query;
    const where: any = { isActive: true };
    if (teacherId) where.teacherId = String(teacherId);
    if (classId) where.classId = String(classId);
    if (dayOfWeek) where.dayOfWeek = parseInt(String(dayOfWeek));

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: {
        class: { select: { id: true, name: true, grade: true } },
        subject: { select: { id: true, code: true, name: true } },
        teacher: { select: { id: true, fullName: true, nip: true, subject: true } },
      },
    });

    sendSuccess(res, schedules, 'Daftar jadwal mengajar berhasil diambil');
  } catch {
    sendError(res, 'Gagal mengambil data jadwal mengajar');
  }
};

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room, academicYear, semester } = req.body;
    if (!classId || !subjectId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      sendError(res, 'Data kelas, mapel, guru, hari, dan jam mengajar wajib diisi', 400);
      return;
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        classId,
        subjectId,
        teacherId,
        dayOfWeek: parseInt(String(dayOfWeek)),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        room: room ? room.trim() : null,
        academicYear: academicYear || '2026/2027',
        semester: semester ? parseInt(String(semester)) : 1,
      },
      include: {
        class: { select: { id: true, name: true, grade: true } },
        subject: { select: { id: true, code: true, name: true } },
        teacher: { select: { id: true, fullName: true, nip: true } },
      },
    });

    sendCreated(res, newSchedule, 'Jadwal mengajar berhasil ditambahkan');
  } catch {
    sendError(res, 'Gagal menambahkan jadwal mengajar');
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room, academicYear, semester, isActive } = req.body;

    const existing = await prisma.schedule.findUnique({ where: { id } });
    if (!existing) { sendNotFound(res, 'Jadwal tidak ditemukan'); return; }

    const updated = await prisma.schedule.update({
      where: { id },
      data: {
        ...(classId && { classId }),
        ...(subjectId && { subjectId }),
        ...(teacherId && { teacherId }),
        ...(dayOfWeek !== undefined && { dayOfWeek: parseInt(String(dayOfWeek)) }),
        ...(startTime && { startTime: startTime.trim() }),
        ...(endTime && { endTime: endTime.trim() }),
        ...(room !== undefined && { room: room ? room.trim() : null }),
        ...(academicYear && { academicYear }),
        ...(semester !== undefined && { semester: parseInt(String(semester)) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: {
        class: { select: { id: true, name: true, grade: true } },
        subject: { select: { id: true, code: true, name: true } },
        teacher: { select: { id: true, fullName: true, nip: true } },
      },
    });

    sendSuccess(res, updated, 'Jadwal mengajar berhasil diperbarui');
  } catch {
    sendError(res, 'Gagal memperbarui jadwal mengajar');
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.schedule.delete({ where: { id } });
    sendSuccess(res, null, 'Jadwal mengajar berhasil dihapus');
  } catch {
    sendError(res, 'Gagal menghapus jadwal mengajar');
  }
};

