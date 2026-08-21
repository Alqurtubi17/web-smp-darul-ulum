// @ts-nocheck
import nodemailer from 'nodemailer';
import logger from './logger';

// ─── TRANSPORTER (Gmail App Password) ────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || `"SMP Darul Ulum" <${process.env.EMAIL_USER}>`;

// ─── BASE TEMPLATE ────────────────────────────────────────────────────────────
const base = (title: string, body: string) => `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="font-family:Arial,sans-serif;background:#f3f4f6;margin:0;padding:20px">
  <div style="max-width:580px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:linear-gradient(135deg,#166534,#065f46);padding:28px 32px;text-align:center">
      <p style="color:white;font-size:18px;font-weight:700;margin:0">🎓 SMP Darul Ulum Surabaya</p>
      <p style="color:#86efac;font-size:13px;margin:4px 0 0">${title}</p>
    </div>
    <div style="padding:28px 32px">${body}</div>
    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center">
      <p style="color:#9ca3af;font-size:11px;margin:0">Email otomatis — SMP Darul Ulum Surabaya</p>
    </div>
  </div>
</body>
</html>`;

// ─── SEND ─────────────────────────────────────────────────────────────────────
export const sendEmail = async (to: string | string[], subject: string, html: string): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    });
    logger.info(`Email sent → ${to} | ${subject}`);
    return true;
  } catch (err) {
    logger.error('Email failed:', err);
    return false;
  }
};

// ─── TEMPLATES ────────────────────────────────────────────────────────────────
export const sendPPDBConfirmation = async (to: string, data: { name: string; regNumber: string; academicYear: string }) => {
  await sendEmail(to, `Konfirmasi PPDB ${data.academicYear} — ${data.regNumber}`,
    base('Konfirmasi Pendaftaran', `
      <h2 style="color:#111827;font-size:20px;margin:0 0 16px">Pendaftaran PPDB Berhasil!</h2>
      <p style="color:#374151">Yth. Orang Tua/Wali, pendaftaran atas nama <strong>${data.name}</strong> telah diterima.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:16px 0">
        <p style="color:#6b7280;font-size:12px;margin:0 0 4px">Nomor Pendaftaran</p>
        <p style="color:#166534;font-size:22px;font-weight:700;margin:0;font-family:monospace">${data.regNumber}</p>
      </div>
      <p style="color:#374151">Simpan nomor ini untuk memantau status seleksi di website kami.</p>
      <a href="${process.env.CLIENT_URL}/ppdb" style="display:inline-block;background:#166534;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:8px">Cek Status →</a>
    `));
};

export const sendGradeNotification = async (to: string, data: { studentName: string; subject: string; type: string; score: number; maxScore: number }) => {
  const pct = Math.round((data.score / data.maxScore) * 100);
  await sendEmail(to, `Nilai ${data.type} ${data.subject} — ${data.studentName}`,
    base('Notifikasi Nilai', `
      <h2 style="color:#111827;font-size:18px;margin:0 0 12px">Nilai Baru Diinput</h2>
      <p style="color:#374151">Nilai <strong>${data.type}</strong> ${data.subject} untuk <strong>${data.studentName}</strong>:</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:16px 0;text-align:center">
        <p style="color:#6b7280;font-size:13px;margin:0 0 4px">${data.subject} — ${data.type}</p>
        <p style="color:${pct>=75?'#166534':'#dc2626'};font-size:36px;font-weight:700;margin:0">${data.score}<span style="font-size:16px;color:#6b7280">/${data.maxScore}</span></p>
        <p style="color:#6b7280;font-size:13px;margin:4px 0 0">${pct}%</p>
      </div>
      <a href="${process.env.CLIENT_URL}/siswa/nilai" style="display:inline-block;background:#166534;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Lihat Semua Nilai →</a>
    `));
};

export const sendSPPReminder = async (to: string, data: { studentName: string; month: string; amount: number; dueDate: string }) => {
  const rp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.amount);
  await sendEmail(to, `Pengingat SPP ${data.month} — ${data.studentName}`,
    base('Pengingat Pembayaran SPP', `
      <h2 style="color:#111827;font-size:18px;margin:0 0 12px">Pembayaran SPP Belum Lunas</h2>
      <p style="color:#374151">Yth. Orang Tua/Wali siswa <strong>${data.studentName}</strong>:</p>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px;margin:16px 0">
        <p style="margin:4px 0;color:#374151">📅 Bulan: <strong>${data.month}</strong></p>
        <p style="margin:4px 0;color:#374151">💰 Jumlah: <strong>${rp}</strong></p>
        <p style="margin:4px 0;color:#dc2626">⏰ Jatuh tempo: <strong>${data.dueDate}</strong></p>
      </div>
      <a href="${process.env.CLIENT_URL}/ortu/pembayaran" style="display:inline-block;background:#d97706;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">Bayar Sekarang →</a>
    `));
};

export const sendAnnouncementEmail = async (recipients: string[], data: { title: string; content: string }) => {
  const html = base('Pengumuman Sekolah', `
    <h2 style="color:#111827;font-size:18px;margin:0 0 12px">${data.title}</h2>
    <div style="color:#374151;line-height:1.7;background:#f9fafb;padding:16px;border-radius:10px;border:1px solid #e5e7eb">${data.content}</div>
    <a href="${process.env.CLIENT_URL}/pengumuman" style="display:inline-block;background:#166534;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:16px">Lihat Pengumuman →</a>
  `);

  // Kirim per batch 10
  for (let i = 0; i < recipients.length; i += 10) {
    const batch = recipients.slice(i, i + 10);
    await Promise.allSettled(batch.map(r => sendEmail(r, `Pengumuman: ${data.title}`, html)));
  }
};

export default { sendEmail, sendPPDBConfirmation, sendGradeNotification, sendSPPReminder, sendAnnouncementEmail };
