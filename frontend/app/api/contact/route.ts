import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Nama, email, dan pesan wajib diisi' },
        { status: 400 }
      );
    }

    await transporter.sendMail({
      from: `"SMP Darul Ulum" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_PENERIMA,
      replyTo: email,
      subject: `[Kontak Website] ${subject || 'Pesan dari ' + name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#166534;color:white;padding:24px;border-radius:12px 12px 0 0;">
            <h2 style="margin:0">📧 Pesan Baru dari Website</h2>
            <p style="margin:4px 0 0;opacity:.8;">SMP Darul Ulum Surabaya</p>
          </div>
          <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <table style="width:100%">
              <tr><td style="color:#6b7280;padding:6px 0;width:120px"><b>Nama</b></td><td>${name}</td></tr>
              <tr><td style="color:#6b7280;padding:6px 0"><b>Email</b></td><td>${email}</td></tr>
              ${phone ? `<tr><td style="color:#6b7280;padding:6px 0"><b>Telepon</b></td><td>${phone}</td></tr>` : ''}
              ${subject ? `<tr><td style="color:#6b7280;padding:6px 0"><b>Keperluan</b></td><td>${subject}</td></tr>` : ''}
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
            <p style="color:#374151;white-space:pre-wrap;background:white;padding:16px;border-radius:8px;border:1px solid #e5e7eb">${message}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Pesan berhasil dikirim!' });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengirim pesan' }, { status: 500 });
  }
}
