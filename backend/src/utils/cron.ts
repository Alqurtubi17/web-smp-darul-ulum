// @ts-nocheck
import cron from 'node-cron';
import prisma from './prisma';
import emailService from './email';
import logger from './logger';

// ─── FORMAT RUPIAH ─────────────────────────────────────────────────────────
const rp = (n: number) => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(n);
const fmtDate = (d: Date) => new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'long', year:'numeric' }).format(d);

// ─── SPP REMINDER — setiap hari pukul 07.00 WIB ──────────────────────────
export const startSPPReminderCron = () => {
  // "0 0 * * *" = tengah malam UTC = 07.00 WIB
  cron.schedule('0 0 * * *', async () => {
    logger.info('[CRON] Menjalankan SPP reminder...');
    try {
      const today = new Date();
      const reminderDays = [7, 3, 1]; // kirim H-7, H-3, H-1

      for (const daysLeft of reminderDays) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysLeft);
        const dateStr = targetDate.toISOString().split('T')[0];

        // Cari tagihan yang jatuh tempo = targetDate dan belum bayar
        const pending = await prisma.payment.findMany({
          where: {
            status: 'PENDING',
            dueDate: {
              gte: new Date(`${dateStr}T00:00:00.000Z`),
              lt:  new Date(`${dateStr}T23:59:59.999Z`),
            },
          },
          include: {
            student: {
              include: {
                parent: { select: { email: true, fullName: true } },
              },
            },
          },
        });

        for (const payment of pending) {
          const parentEmail = payment.student?.parent?.email;
          if (!parentEmail) continue;

          await emailService.sendSPPReminder(parentEmail, {
            studentName: payment.student.fullName,
            month: payment.month || payment.description || 'SPP',
            amount: payment.amount,
            dueDate: fmtDate(payment.dueDate),
          });

          logger.info(`[CRON] SPP reminder dikirim → ${parentEmail} (H-${daysLeft})`);
        }
      }

      logger.info('[CRON] SPP reminder selesai');
    } catch (err) {
      logger.error('[CRON] SPP reminder error:', err);
    }
  }, { timezone: 'Asia/Jakarta' });

  logger.info('[CRON] SPP reminder scheduler aktif (07.00 WIB setiap hari)');
};

// ─── BORROWING OVERDUE CHECK — setiap hari pukul 06.00 WIB ───────────────
export const startBorrowingOverdueCron = () => {
  cron.schedule('0 23 * * *', async () => { // 23.00 UTC = 06.00 WIB
    logger.info('[CRON] Cek peminjaman buku terlambat...');
    try {
      const overdue = await prisma.borrowing.updateMany({
        where: {
          status: 'DIPINJAM',
          dueDate: { lt: new Date() },
        },
        data: { status: 'TERLAMBAT' },
      });
      logger.info(`[CRON] ${overdue.count} peminjaman ditandai terlambat`);
    } catch (err) {
      logger.error('[CRON] Borrowing overdue error:', err);
    }
  }, { timezone: 'Asia/Jakarta' });

  logger.info('[CRON] Borrowing overdue scheduler aktif');
};

// ─── START ALL ─────────────────────────────────────────────────────────────
export const startAllCrons = () => {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
    startSPPReminderCron();
    startBorrowingOverdueCron();
    logger.info('[CRON] Semua cron job aktif');
  } else {
    logger.info('[CRON] Cron job nonaktif di development (set ENABLE_CRON=true untuk aktifkan)');
  }
};
