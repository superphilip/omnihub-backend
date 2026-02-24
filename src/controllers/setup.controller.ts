import type { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { checkSetupStatus, performInitialSetup } from '../services/setup.service.js';


export const getSetupStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = await checkSetupStatus();

  res.json({
    success: true,
    data: status,
  });
});

export const initializeSystem = asyncHandler(async (req:  Request, res: Response) => {
  const result = await performInitialSetup(req.body);

  res.status(201).json({
    success: true,
    message: 'config.system_initialized',
    data: result,
  });
});