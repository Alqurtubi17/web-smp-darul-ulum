// @ts-nocheck
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// ─── GENERATE STUDENT QR CODE ─────────────────────────────────────────────────

export const generateStudentQRCode = (studentId: string, nis: string): string => {
  const payload = {
    type: 'STUDENT_CARD',
    studentId,
    nis,
    issued: new Date().toISOString(),
    token: crypto.createHmac('sha256', process.env.JWT_SECRET || 'secret')
      .update(`${studentId}:${nis}`)
      .digest('hex')
      .substring(0, 16),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
};

// ─── GENERATE ATTENDANCE SESSION QR ──────────────────────────────────────────

export const generateAttendanceQR = (
  scheduleId: string,
  classId: string,
  date: string,
  validMinutes = 15
): { code: string; expiresAt: Date } => {
  const expiresAt = new Date(Date.now() + validMinutes * 60 * 1000);
  const payload = {
    type: 'ATTENDANCE',
    scheduleId,
    classId,
    date,
    sessionId: uuidv4(),
    expiresAt: expiresAt.toISOString(),
  };

  const code = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return { code, expiresAt };
};

// ─── VERIFY STUDENT QR ────────────────────────────────────────────────────────

export const verifyStudentQR = (
  qrCode: string
): { valid: boolean; studentId?: string; nis?: string; error?: string } => {
  try {
    const decoded = JSON.parse(Buffer.from(qrCode, 'base64url').toString());

    if (decoded.type !== 'STUDENT_CARD') {
      return { valid: false, error: 'Tipe QR tidak valid' };
    }

    const expectedToken = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'secret')
      .update(`${decoded.studentId}:${decoded.nis}`)
      .digest('hex')
      .substring(0, 16);

    if (decoded.token !== expectedToken) {
      return { valid: false, error: 'QR Code tidak valid atau telah dimanipulasi' };
    }

    return { valid: true, studentId: decoded.studentId, nis: decoded.nis };
  } catch {
    return { valid: false, error: 'Format QR Code tidak valid' };
  }
};

// ─── VERIFY ATTENDANCE QR ─────────────────────────────────────────────────────

export const verifyAttendanceQR = (
  qrCode: string
): { valid: boolean; scheduleId?: string; classId?: string; date?: string; error?: string } => {
  try {
    const decoded = JSON.parse(Buffer.from(qrCode, 'base64url').toString());

    if (decoded.type !== 'ATTENDANCE') {
      return { valid: false, error: 'Tipe QR tidak valid' };
    }

    if (new Date() > new Date(decoded.expiresAt)) {
      return { valid: false, error: 'QR Code absensi sudah kadaluarsa' };
    }

    return {
      valid: true,
      scheduleId: decoded.scheduleId,
      classId: decoded.classId,
      date: decoded.date,
    };
  } catch {
    return { valid: false, error: 'Format QR Code tidak valid' };
  }
};

export default { generateStudentQRCode, generateAttendanceQR, verifyStudentQR, verifyAttendanceQR };
