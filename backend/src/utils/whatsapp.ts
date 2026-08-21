// @ts-nocheck — Prisma client will be generated before compilation
import logger from './logger';

const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const FONNTE_URL = 'https://api.fonnte.com/send';

export interface WAMessage {
  target: string; // nomor WA format: 628xxx
  message: string;
}

// ─── SEND SINGLE MESSAGE ──────────────────────────────────────────────────────

export const sendWA = async (target: string, message: string): Promise<boolean> => {
  if (!FONNTE_TOKEN) {
    logger.warn('WhatsApp: FONNTE_TOKEN not set, skipping WA notification');
    return false;
  }

  // Normalize number format
  const normalized = target.replace(/\D/g, '').replace(/^0/, '62');

  try {
    const response = await fetch(FONNTE_URL, {
      method: 'POST',
      headers: {
        Authorization: FONNTE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target: normalized, message, delay: 1, schedule: 0 }),
    });

    const result = await response.json();
    if (result.status) {
      logger.info(`WA sent to ${normalized}: ${message.substring(0, 50)}...`);
      return true;
    }
    logger.warn(`WA failed for ${normalized}: ${JSON.stringify(result)}`);
    return false;
  } catch (error) {
    logger.error(`WA error for ${normalized}:`, error);
    return false;
  }
};

// ─── SEND BULK ────────────────────────────────────────────────────────────────

export const sendWABulk = async (messages: WAMessage[]): Promise<void> => {
  const batchSize = 10;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(m => sendWA(m.target, m.message))
    );
    // Delay between batches to avoid rate limiting
    if (i + batchSize < messages.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

// ─── TEMPLATES ────────────────────────────────────────────────────────────────

export const waTemplates = {
  sppReminder: (studentName: string, month: string, amount: number, dueDate: string) =>
    `🏫 *SMP Darul Ulum Surabaya*\n\nYth. Orang Tua/Wali siswa *${studentName}*,\n\nKami mengingatkan pembayaran SPP:\n📅 Bulan: *${month}*\n💰 Jumlah: *Rp ${amount.toLocaleString('id-ID')}*\n⏰ Jatuh Tempo: *${dueDate}*\n\nPembayaran via QRIS atau ke kasir sekolah.\n\nTerima kasih 🙏`,

  gradeNotif: (studentName: string, subject: string, type: string, score: number) =>
    `🏫 *SMP Darul Ulum Surabaya*\n\nNilai *${type}* ${subject} untuk *${studentName}* telah diinput:\n\n📊 Nilai: *${score}*\n\nLihat detail di portal orang tua:\n${process.env.CLIENT_URL}/ortu/nilai\n\nTerima kasih 🙏`,

  ppdbAccepted: (name: string, regNum: string) =>
    `🎉 *SMP Darul Ulum Surabaya*\n\nSelamat! Ananda *${name}* dinyatakan *DITERIMA* di SMP Darul Ulum Surabaya.\n\nNo. Pendaftaran: *${regNum}*\n\nSegera lakukan daftar ulang sesuai jadwal yang ditentukan.\n\nInfo: ${process.env.CLIENT_URL}/ppdb\n\nTerima kasih 🙏`,

  announcement: (title: string, content: string) =>
    `📢 *Pengumuman - SMP Darul Ulum Surabaya*\n\n*${title}*\n\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\nInfo lengkap: ${process.env.CLIENT_URL}/pengumuman`,

  absenceAlert: (parentName: string, studentName: string, date: string, status: string) =>
    `⚠️ *Informasi Kehadiran - SMP Darul Ulum*\n\nYth. *${parentName}*,\n\nPada tanggal *${date}*, ananda *${studentName}* tercatat:\n📋 Status: *${status}*\n\nJika ada pertanyaan, hubungi wali kelas.\n\nSMP Darul Ulum Surabaya`,
};

export default { sendWA, sendWABulk, waTemplates };
