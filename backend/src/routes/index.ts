// @ts-nocheck
import { Router } from 'express';
import { authenticate, isAdmin, isGuru } from '../middleware/auth';
import * as announcementCtrl from '../controllers/announcement.controller';
import * as eventCtrl from '../controllers/event.controller';
import * as galleryCtrl from '../controllers/gallery.controller';
import * as academicCtrl from '../controllers/academic.controller';
import * as userCtrl from '../controllers/user.controller';
import * as assignmentCtrl from '../controllers/assignment.controller';
import * as paymentCtrl from '../controllers/payment.controller';

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
export const announcementRouter = Router();
announcementRouter.get('/', announcementCtrl.listAnnouncements);
announcementRouter.get('/:id', announcementCtrl.getAnnouncementById);
announcementRouter.post('/', authenticate, isAdmin, announcementCtrl.createAnnouncement);
announcementRouter.put('/:id', authenticate, isAdmin, announcementCtrl.updateAnnouncement);
announcementRouter.delete('/:id', authenticate, isAdmin, announcementCtrl.deleteAnnouncement);

// ─── EVENTS ──────────────────────────────────────────────────────────────────
export const eventRouter = Router();
eventRouter.get('/', eventCtrl.listEvents);
eventRouter.get('/upcoming', eventCtrl.getUpcomingEvents);
eventRouter.get('/:id', eventCtrl.getEventById);
eventRouter.post('/', authenticate, isAdmin, eventCtrl.createEvent);
eventRouter.put('/:id', authenticate, isAdmin, eventCtrl.updateEvent);
eventRouter.delete('/:id', authenticate, isAdmin, eventCtrl.deleteEvent);

// ─── GALLERY (URL dari UploadThing di body) ───────────────────────────────────
export const galleryRouter = Router();
galleryRouter.get('/', galleryCtrl.listAlbums);
galleryRouter.get('/:id', galleryCtrl.getAlbumById);
galleryRouter.post('/', authenticate, isAdmin, galleryCtrl.createAlbum);
galleryRouter.post('/:albumId/items', authenticate, isAdmin, galleryCtrl.addItemsToAlbum);
galleryRouter.delete('/:id', authenticate, isAdmin, galleryCtrl.deleteAlbum);
galleryRouter.delete('/items/:id', authenticate, isAdmin, galleryCtrl.deleteItem);

// ─── GRADES ──────────────────────────────────────────────────────────────────
export const gradeRouter = Router();
gradeRouter.get('/student/:studentId', authenticate, academicCtrl.getStudentGrades);
gradeRouter.post('/', authenticate, isGuru, academicCtrl.inputGrade);
gradeRouter.post('/batch', authenticate, isGuru, academicCtrl.inputGradeBatch);
gradeRouter.put('/:id', authenticate, isGuru, academicCtrl.updateGrade);
gradeRouter.delete('/:id', authenticate, isGuru, academicCtrl.deleteGrade);

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const attendanceRouter = Router();
attendanceRouter.get('/student/:studentId', authenticate, academicCtrl.getStudentAttendance);
attendanceRouter.get('/class/:classId/summary', authenticate, isGuru, academicCtrl.getClassAttendanceSummary);
attendanceRouter.post('/', authenticate, isGuru, academicCtrl.inputAttendance);

// ─── ASSIGNMENTS (fileUrl dari body — UploadThing) ────────────────────────────
export const assignmentRouter = Router();
assignmentRouter.get('/', authenticate, assignmentCtrl.listAssignments);
assignmentRouter.post('/', authenticate, isGuru, assignmentCtrl.createAssignment);
assignmentRouter.get('/:id', authenticate, assignmentCtrl.getAssignmentById);
assignmentRouter.put('/:id', authenticate, isGuru, assignmentCtrl.updateAssignment);
assignmentRouter.delete('/:id', authenticate, isGuru, assignmentCtrl.deleteAssignment);
assignmentRouter.post('/:assignmentId/submit', authenticate, assignmentCtrl.submitAssignment);
assignmentRouter.patch('/submissions/:submissionId/grade', authenticate, isGuru, assignmentCtrl.gradeSubmission);

// ─── MATERIALS ────────────────────────────────────────────────────────────────
export const materialRouter = Router();
materialRouter.get('/', authenticate, assignmentCtrl.listMaterials);
materialRouter.post('/', authenticate, isGuru, assignmentCtrl.uploadMaterial);
materialRouter.delete('/:id', authenticate, isGuru, assignmentCtrl.deleteMaterial);

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const paymentRouter = Router();
paymentRouter.get('/stats', authenticate, isAdmin, paymentCtrl.getPaymentStats);
paymentRouter.get('/student/:studentId', authenticate, paymentCtrl.getStudentPayments);
paymentRouter.post('/', authenticate, isAdmin, paymentCtrl.createPaymentBill);
paymentRouter.post('/bulk-spp', authenticate, isAdmin, paymentCtrl.createBulkSPP);
paymentRouter.patch('/:id/pay', authenticate, isAdmin, paymentCtrl.recordPayment);
paymentRouter.delete('/clear-all', authenticate, isAdmin, paymentCtrl.clearAllPayments);
paymentRouter.delete('/:id', authenticate, isAdmin, paymentCtrl.deletePayment);

// ─── LIBRARY ──────────────────────────────────────────────────────────────────
export const bookRouter = Router();
bookRouter.get('/', paymentCtrl.listBooks);
bookRouter.post('/', authenticate, isAdmin, paymentCtrl.createBook);
bookRouter.put('/:id', authenticate, isAdmin, paymentCtrl.updateBook);
bookRouter.delete('/:id', authenticate, isAdmin, paymentCtrl.deleteBook);

export const borrowingRouter = Router();
borrowingRouter.get('/', authenticate, paymentCtrl.listBorrowings);
borrowingRouter.post('/', authenticate, isAdmin, paymentCtrl.borrowBook);
borrowingRouter.patch('/:id/return', authenticate, isAdmin, paymentCtrl.returnBook);

// ─── USERS (admin) ────────────────────────────────────────────────────────────
export const userRouter = Router();
userRouter.get('/', authenticate, isAdmin, userCtrl.listUsers);
userRouter.patch('/:id/toggle-active', authenticate, isAdmin, userCtrl.toggleUserActive);

export const studentRouter = Router();
studentRouter.get('/', authenticate, isAdmin, userCtrl.listStudents);
studentRouter.post('/', authenticate, isAdmin, userCtrl.createStudent);

export const teacherRouter = Router();
teacherRouter.get('/', authenticate, isAdmin, userCtrl.listTeachers);
teacherRouter.post('/', authenticate, isAdmin, userCtrl.createTeacher);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboardRouter = Router();
dashboardRouter.get('/stats', authenticate, isAdmin, userCtrl.getDashboardStats);

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
export const auditLogRouter = Router();
auditLogRouter.get('/', authenticate, isAdmin, userCtrl.listAuditLogs);
auditLogRouter.post('/', authenticate, userCtrl.createAuditLog);
auditLogRouter.delete('/clear', authenticate, isAdmin, userCtrl.clearAuditLogs);

