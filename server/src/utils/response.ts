import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): void => {
  res.status(statusCode).json({ success: true, message, data });
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created'): void => {
  sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};
