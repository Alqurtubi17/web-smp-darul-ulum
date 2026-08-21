// @ts-nocheck — Prisma client will be generated before compilation
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/response';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') || 'field';
      sendError(res, `${field} sudah digunakan`, 409);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Data tidak ditemukan', 404);
      return;
    }
    if (err.code === 'P2003') {
      sendError(res, 'Referensi data tidak valid', 400);
      return;
    }
  }

  // App errors
  if ('isOperational' in err && err.isOperational) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    sendError(res, err.message, 422);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Token tidak valid', 401);
    return;
  }
  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token sudah kadaluarsa', 401);
    return;
  }

  // Unknown errors — don't leak details in production
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Terjadi kesalahan pada server';

  sendError(res, message, 500);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.path} tidak ditemukan`, 404);
};
