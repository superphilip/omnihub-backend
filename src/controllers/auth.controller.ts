import type { Request, Response } from 'express';
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { handleRefreshToken, loginUserService } from '../services/auth.service.js';

export const login = asyncHandler(async (req:  Request, res: Response) => {
    const result = await loginUserService(req.body);
    return res.status(200).json(result);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const rawToken =
    typeof req.body.refreshToken === 'string'
      ? req.body.refreshToken
      : (typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')
          ? req.headers.authorization
          : undefined);

  const result = await handleRefreshToken(rawToken);
  return res.status(200).json(result);
});