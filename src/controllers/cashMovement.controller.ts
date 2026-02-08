import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as cashMovementService from '../services/cashMovement.service.js';


export const createCashMovement = asyncHandler(async (req: Request, res: Response) => {
  const data = await cashMovementService.createCashMovementService(req.body);
  return res.status(201).json({ success: true, data });
});

export const getMovementsByRegister = asyncHandler(async (req: Request, res: Response) => {
  const { cashRegisterId } = req.params;
  const data = await cashMovementService.getMovementsByRegisterService(cashRegisterId as string);
  return res.json({ success: true, data });
});