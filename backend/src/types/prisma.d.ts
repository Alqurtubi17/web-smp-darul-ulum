// Stub type declarations for @prisma/client when not yet generated
// This file is only needed before running `prisma generate`
// After generating, the real types from node_modules/@prisma/client will be used

declare module '@prisma/client' {
  // Re-export everything that might be used across the project
  export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    GURU = 'GURU',
    SISWA = 'SISWA',
    ORANG_TUA = 'ORANG_TUA',
    PENGUNJUNG = 'PENGUNJUNG',
  }
  export enum Gender { LAKI_LAKI = 'LAKI_LAKI', PEREMPUAN = 'PEREMPUAN' }
  export enum AdmissionStatus { PENDING='PENDING', VERIFIKASI='VERIFIKASI', LULUS='LULUS', DITOLAK='DITOLAK', DAFTAR_ULANG='DAFTAR_ULANG' }
  export enum AttendanceStatus { HADIR='HADIR', IZIN='IZIN', SAKIT='SAKIT', ALPHA='ALPHA' }
  export enum GradeType { TUGAS='TUGAS', ULANGAN_HARIAN='ULANGAN_HARIAN', UTS='UTS', UAS='UAS', PRAKTIK='PRAKTIK' }
  export enum PaymentType { SPP='SPP', UANG_GEDUNG='UANG_GEDUNG', KEGIATAN='KEGIATAN', DENDA_BUKU='DENDA_BUKU', LAINNYA='LAINNYA' }
  export enum PaymentStatus { PENDING='PENDING', PAID='PAID', FAILED='FAILED', REFUNDED='REFUNDED' }
  export enum PaymentMethod { QRIS='QRIS', TUNAI='TUNAI', TRANSFER='TRANSFER' }
  export enum BorrowingStatus { DIPINJAM='DIPINJAM', DIKEMBALIKAN='DIKEMBALIKAN', TERLAMBAT='TERLAMBAT', HILANG='HILANG' }
  export enum NotificationType { NILAI='NILAI', ABSENSI='ABSENSI', TUGAS='TUGAS', PENGUMUMAN='PENGUMUMAN', PPDB='PPDB', PEMBAYARAN='PEMBAYARAN', UMUM='UMUM' }
  export enum NotificationChannel { IN_APP='IN_APP', EMAIL='EMAIL', WHATSAPP='WHATSAPP', PUSH='PUSH' }
  export enum NewsStatus { DRAFT='DRAFT', PUBLISHED='PUBLISHED', ARCHIVED='ARCHIVED' }
  export enum GalleryType { FOTO='FOTO', VIDEO='VIDEO' }
  export enum AssignmentStatus { AKTIF='AKTIF', DITUTUP='DITUTUP' }
  export enum SubmissionStatus { BELUM_SUBMIT='BELUM_SUBMIT', SUBMITTED='SUBMITTED', DINILAI='DINILAI', TERLAMBAT='TERLAMBAT' }

  // PrismaClient — minimal stub
  export class PrismaClient {
    constructor(options?: { log?: string[] });
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $transaction<T>(arg: T[] | ((client: PrismaClient) => Promise<T>)): Promise<T extends unknown[] ? T : T>;
    user: any;
    student: any;
    teacher: any;
    parent: any;
    class: any;
    subject: any;
    schedule: any;
    attendance: any;
    grade: any;
    assignment: any;
    assignmentSubmission: any;
    material: any;
    news: any;
    announcement: any;
    classAnnouncement: any;
    event: any;
    galleryAlbum: any;
    galleryItem: any;
    achievement: any;
    download: any;
    admission: any;
    payment: any;
    book: any;
    borrowing: any;
    notification: any;
    auditLog: any;
    siteSetting: any;
    studentQRCode: any;
  }

  export namespace Prisma {
    class PrismaClientKnownRequestError extends Error {
      code: string;
      meta?: Record<string, unknown>;
    }
  }
}
