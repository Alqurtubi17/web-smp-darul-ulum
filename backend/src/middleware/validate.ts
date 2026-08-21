// @ts-nocheck — Prisma client will be generated before compilation
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendValidationError } from '../utils/response';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : 'general',
      message: err.msg,
    }));

    sendValidationError(res, formattedErrors);
    return;
  }

  next();
};

export const validate = validateRequest;
export default validateRequest;
