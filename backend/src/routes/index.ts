// @ts-nocheck
import { Router } from 'express';
import { authenticate, optionalAuth, isAdmin, isGuru } from '../middleware/auth';

import * as announcementCtrl from '../controllers/announcement.controller';
import * as eventCtrl from '../controllers/event.controller';
import * as galleryCtrl from '../controllers/gallery.controller';
import * as academicCtrl from '../controllers/academic.controller';
import * as userCtrl from '../controllers/user.controller';
import * as assignmentCtrl from '../controllers/assignment.controller';
import * as paymentCtrl from '../controllers/payment.controller';
import * as elearningGameCtrl from '../controllers/elearningGame.controller';

// ─── E-LEARNING GAMES (PERSISTENCE & SOAL DB) ──────────────────────────────────
export const elearningGameRouter = Router();
elearningGameRouter.get('/', elearningGameCtrl.listGames);
elearningGameRouter.get('/:slug', elearningGameCtrl.getGameBySlug);
elearningGameRouter.put('/:slug', elearningGameCtrl.updateGame);
elearningGameRouter.post('/:slug/score', elearningGameCtrl.recordScore);

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
export const announcementRouter = Router();
announcementRouter.get('/', announcementCtrl.listAnnouncements);
announcementRouter.get('/:id', announcementCtrl.getAnnouncementById);
announcementRouter.post('/', optionalAuth, announcementCtrl.createAnnouncement);
announcementRouter.put('/:id', optionalAuth, announcementCtrl.updateAnnouncement);
announcementRouter.delete('/:id', optionalAuth, announcementCtrl.deleteAnnouncement);

// ─── EVENTS ──────────────────────────────────────────────────────────────────
export const eventRouter = Router();
eventRouter.get('/', eventCtrl.listEvents);
eventRouter.get('/upcoming', eventCtrl.getUpcomingEvents);
eventRouter.get('/:id', eventCtrl.getEventById);
eventRouter.post('/', optionalAuth, eventCtrl.createEvent);
eventRouter.put('/:id', optionalAuth, eventCtrl.updateEvent);
eventRouter.delete('/', optionalAuth, eventCtrl.deleteAllEvents);
eventRouter.delete('/:id', optionalAuth, eventCtrl.deleteEvent);

// ─── GALLERY (URL dari UploadThing di body) ───────────────────────────────────
export const galleryRouter = Router();
galleryRouter.get('/', galleryCtrl.listAlbums);
galleryRouter.get('/:id', galleryCtrl.getAlbumById);
galleryRouter.post('/', optionalAuth, galleryCtrl.createAlbum);
galleryRouter.post('/:albumId/items', optionalAuth, galleryCtrl.addItemsToAlbum);
galleryRouter.delete('/:id', optionalAuth, galleryCtrl.deleteAlbum);
galleryRouter.delete('/items/:id', optionalAuth, galleryCtrl.deleteItem);

// ─── GRADES ──────────────────────────────────────────────────────────────────
export const gradeRouter = Router();
gradeRouter.get('/student/:studentId', optionalAuth, academicCtrl.getStudentGrades);
gradeRouter.post('/', optionalAuth, academicCtrl.inputGrade);
gradeRouter.post('/batch', optionalAuth, academicCtrl.inputGradeBatch);
gradeRouter.put('/:id', optionalAuth, academicCtrl.updateGrade);
gradeRouter.delete('/:id', optionalAuth, academicCtrl.deleteGrade);

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const attendanceRouter = Router();
attendanceRouter.get('/student/:studentId', optionalAuth, academicCtrl.getStudentAttendance);
attendanceRouter.get('/class/:classId/summary', optionalAuth, academicCtrl.getClassAttendanceSummary);
attendanceRouter.post('/', optionalAuth, academicCtrl.inputAttendance);

// ─── ASSIGNMENTS (fileUrl dari body — UploadThing) ────────────────────────────
export const assignmentRouter = Router();
assignmentRouter.get('/', optionalAuth, assignmentCtrl.listAssignments);
assignmentRouter.post('/', optionalAuth, assignmentCtrl.createAssignment);
assignmentRouter.get('/:id', optionalAuth, assignmentCtrl.getAssignmentById);
assignmentRouter.put('/:id', optionalAuth, assignmentCtrl.updateAssignment);
assignmentRouter.delete('/:id', optionalAuth, assignmentCtrl.deleteAssignment);
assignmentRouter.post('/:assignmentId/submit', optionalAuth, assignmentCtrl.submitAssignment);
assignmentRouter.patch('/submissions/:submissionId/grade', optionalAuth, assignmentCtrl.gradeSubmission);

// ─── MATERIALS ────────────────────────────────────────────────────────────────
export const materialRouter = Router();
materialRouter.get('/', optionalAuth, assignmentCtrl.listMaterials);
materialRouter.post('/', optionalAuth, assignmentCtrl.uploadMaterial);
materialRouter.delete('/:id', optionalAuth, assignmentCtrl.deleteMaterial);

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const paymentRouter = Router();
paymentRouter.get('/stats', optionalAuth, paymentCtrl.getPaymentStats);
paymentRouter.get('/student/:studentId', optionalAuth, paymentCtrl.getStudentPayments);
paymentRouter.post('/', optionalAuth, paymentCtrl.createPaymentBill);
paymentRouter.post('/bulk-spp', optionalAuth, paymentCtrl.createBulkSPP);
paymentRouter.patch('/:id/pay', optionalAuth, paymentCtrl.recordPayment);
paymentRouter.delete('/clear-all', optionalAuth, paymentCtrl.clearAllPayments);
paymentRouter.delete('/:id', optionalAuth, paymentCtrl.deletePayment);

// ─── LIBRARY ──────────────────────────────────────────────────────────────────
export const bookRouter = Router();
bookRouter.get('/', paymentCtrl.listBooks);
bookRouter.post('/', optionalAuth, paymentCtrl.createBook);
bookRouter.put('/:id', optionalAuth, paymentCtrl.updateBook);
bookRouter.delete('/:id', optionalAuth, paymentCtrl.deleteBook);

export const borrowingRouter = Router();
borrowingRouter.get('/', optionalAuth, paymentCtrl.listBorrowings);
borrowingRouter.post('/', optionalAuth, paymentCtrl.borrowBook);
borrowingRouter.patch('/:id/return', optionalAuth, paymentCtrl.returnBook);

// ─── USERS (admin) ────────────────────────────────────────────────────────────
export const userRouter = Router();
userRouter.get('/', optionalAuth, userCtrl.listUsers);
userRouter.patch('/:id/toggle-active', optionalAuth, userCtrl.toggleUserActive);

export const studentRouter = Router();
studentRouter.get('/', optionalAuth, userCtrl.listStudents);
studentRouter.post('/', optionalAuth, userCtrl.createStudent);

export const teacherRouter = Router();
teacherRouter.get('/', optionalAuth, userCtrl.listTeachers);
teacherRouter.post('/', optionalAuth, userCtrl.createTeacher);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboardRouter = Router();
dashboardRouter.get('/stats', optionalAuth, userCtrl.getDashboardStats);

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
export const auditLogRouter = Router();
auditLogRouter.get('/', optionalAuth, userCtrl.listAuditLogs);
auditLogRouter.post('/', optionalAuth, userCtrl.createAuditLog);
auditLogRouter.delete('/clear', optionalAuth, userCtrl.clearAuditLogs);

// ─── SETTINGS & ACADEMIC YEAR ─────────────────────────────────────────────────
export const academicYearRouter = Router();
academicYearRouter.get('/', userCtrl.listAcademicYears);
academicYearRouter.get('/active', userCtrl.getActiveAcademicYear);
academicYearRouter.post('/', userCtrl.addAcademicYear);
academicYearRouter.put('/:id', userCtrl.updateAcademicYear);
academicYearRouter.patch('/:id/active', userCtrl.setActiveAcademicYear);
academicYearRouter.delete('/:id', userCtrl.deleteAcademicYear);

export const settingsRouter = Router();
settingsRouter.get('/', userCtrl.getSettings);
settingsRouter.post('/', userCtrl.updateSettings);
settingsRouter.get('/academic-years', userCtrl.listAcademicYears);
settingsRouter.post('/academic-years', userCtrl.addAcademicYear);
settingsRouter.patch('/academic-years/:id/active', userCtrl.setActiveAcademicYear);
settingsRouter.delete('/academic-years/:id', userCtrl.deleteAcademicYear);

// ─── CLASSES & WALI KELAS ─────────────────────────────────────────────────────
export const classRouter = Router();
classRouter.get('/', academicCtrl.listClasses);
classRouter.post('/', optionalAuth, academicCtrl.createClass);
classRouter.put('/:id', optionalAuth, academicCtrl.updateClass);
classRouter.delete('/:id', optionalAuth, academicCtrl.deleteClass);

// ─── SUBJECTS (MAPEL) ─────────────────────────────────────────────────────────
export const subjectRouter = Router();
subjectRouter.get('/', academicCtrl.listSubjects);
subjectRouter.post('/', optionalAuth, academicCtrl.createSubject);
subjectRouter.put('/:id', academicCtrl.updateSubject);
subjectRouter.delete('/:id', academicCtrl.deleteSubject);

// ─── SCHEDULES (JADWAL MENGAJAR PER GURU) ────────────────────────────────────
export const scheduleRouter = Router();
scheduleRouter.get('/', academicCtrl.listSchedules);
scheduleRouter.post('/', optionalAuth, academicCtrl.createSchedule);
scheduleRouter.put('/:id', optionalAuth, academicCtrl.updateSchedule);
scheduleRouter.delete('/:id', optionalAuth, academicCtrl.deleteSchedule);



