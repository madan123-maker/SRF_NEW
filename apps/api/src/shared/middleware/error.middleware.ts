/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { sendError } from '../utils/response.util';
import { logger } from '../utils/logger.util';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(`Operational Error: ${err.message}`, { path: req.path, method: req.method, errors: err.errors });
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Handle Zod Errors (if they slip past validation middleware)
  if (err.name === 'ZodError') {
    logger.warn(`Zod Validation Error`, { path: req.path, errors: err.errors });
    return sendError(res, 'Validation Error', 400, err.errors);
  }

  // Fallback for unexpected errors
  logger.error(`Unexpected Error: ${err.message}`, { stack: err.stack, path: req.path, method: req.method });
  return sendError(res, 'Internal Server Error', 500);
};
