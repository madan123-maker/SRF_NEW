/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: any[];
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: T | null = null,
  errors: any[] = []
) => {
  const response: ApiResponse<T> = {
    success,
    message,
    data,
    errors,
  };
  return res.status(statusCode).json(response);
};

export const sendSuccess = <T>(res: Response, message: string, data: T | null = null, statusCode: number = 200) => {
  return sendResponse(res, statusCode, true, message, data, []);
};

export const sendCreated = <T>(res: Response, message: string, data: T | null = null) => {
  return sendResponse(res, 201, true, message, data, []);
};

export const sendUpdated = <T>(res: Response, message: string, data: T | null = null) => {
  return sendResponse(res, 200, true, message, data, []);
};

export const sendDeleted = (res: Response, message: string) => {
  return sendResponse(res, 200, true, message, null, []);
};

export const sendPaginated = <T>(res: Response, message: string, data: any) => {
  return sendResponse(res, 200, true, message, data, []);
};

export const sendError = (res: Response, message: string, statusCode: number = 500, errors: any[] = []) => {
  return sendResponse(res, statusCode, false, message, null, errors);
};
