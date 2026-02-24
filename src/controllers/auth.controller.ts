import type { Request, Response } from 'express';
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { handleRefreshToken, loginUserService, logoutAllSessionsByUser, logoutUserByToken } from '../services/auth.service.js';

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

export const logout = asyncHandler(async (req: Request, res: Response) => {
  let rawToken = req.body.refreshToken;

  // Si no viene en el body, lo buscamos en el header
  if (!rawToken && typeof req.headers.authorization === 'string') {
    rawToken = req.headers.authorization;
  }

  // LIMPIEZA: Quitamos el prefijo 'Bearer ' si existe antes de ir al servicio
  const cleanToken = (typeof rawToken === 'string' && rawToken.startsWith('Bearer '))
    ? rawToken.slice(7)
    : rawToken;
  
  const result = await logoutUserByToken(rawToken);
  return res.status(200).json({ message: result.message });
});

export const logoutAllSessions = asyncHandler(async (req, res) => {
  const userId = req.body.userId;
  const result = await logoutAllSessionsByUser(userId);
  return res.status(200).json({ message: result.message });
});