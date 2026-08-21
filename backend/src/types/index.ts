import { Request } from 'express';

// ─── JWT PAYLOAD ─────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ─── AUTH REQUEST (Express Request with user) ─────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AuthRequest extends Request<any, any, any, any> {
  user?: JwtPayload;
}

// ─── RESPONSE TYPES ──────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  meta?: PaginationMeta;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── TOKEN ───────────────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// ─── FILE UPLOAD ─────────────────────────────────────────────────────────────

export interface UploadedFile {
  url: string;
  publicId: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}
