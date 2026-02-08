import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as cashRegisterService from '../services/cashRegister.service.js';


export const openCashRegister = asyncHandler(async (req: Request, res: Response) => {
  const data = await cashRegisterService.openCashRegisterService(req.body);
  return res.status(201).json({ success: true, data });
});

export const closeCashRegister = asyncHandler(async (req: Request, res: Response) => {
  const data = await cashRegisterService.closeCashRegisterService(req.params.id as string, req.body);
  return res.json({ success: true, data });
});

export const getAllCashRegisters = asyncHandler(async (req: Request, res: Response) => {
  const data = await cashRegisterService.getAllCashRegistersService();
  return res.json({ success: true, data });
});

export const getCashRegisterById = asyncHandler(async (req: Request, res: Response) => {
  const data = await cashRegisterService.getCashRegisterByIdService(req.params.id as string);
  return res.json({ success: true, data });
});