// @ts-nocheck
import { Response } from 'express';
import { ApiResponse, PaginationMeta, ValidationError } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Berhasil',
  statusCode = 200,
  meta?: PaginationMeta
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Data berhasil dibuat'
): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendError = (
  res: Response,
  message = 'Terjadi kesalahan',
  statusCode = 500,
  errors?: ValidationError[]
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
};

export const sendNotFound = (
  res: Response,
  message = 'Data tidak ditemukan'
): Response => {
  return sendError(res, message, 404);
};

export const sendUnauthorized = (
  res: Response,
  message = 'Tidak memiliki akses'
): Response => {
  return sendError(res, message, 401);
};

export const sendForbidden = (
  res: Response,
  message = 'Akses ditolak'
): Response => {
  return sendError(res, message, 403);
};

export const sendValidationError = (
  res: Response,
  errors: ValidationError[],
  message = 'Validasi gagal'
): Response => {
  return sendError(res, message, 422, errors);
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

export const parsePagination = (
  query: Record<string, string | undefined>
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(query.page || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10')));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
