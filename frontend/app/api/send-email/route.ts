// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Endpoint internal untuk kirim email notifikasi (nilai, pengumuman, dll)
export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, type } = await req.json();

    // Validasi dari server internal saja (bisa tambah secret header)
    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, message: 'to, subject, html wajib' }, { status: 400 });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"SMP Darul Ulum" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, message: 'Email terkirim' });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ success: false, message: 'Gagal kirim email' }, { status: 500 });
  }
}
