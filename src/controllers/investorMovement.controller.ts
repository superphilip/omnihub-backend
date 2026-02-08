import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as investorMovementService from "../services/investorMovement.service.js";


export const createInvestorMovement = asyncHandler(async (req: Request, res: Response) => {
  const movement = await investorMovementService.createInvestorMovementService(req.body, req.user!.id);
  res.status(201).json({ success: true, data: movement });
});

export const updateInvestorMovement = asyncHandler(async (req, res) => {
  const movement = await investorMovementService.updateInvestorMovementService(req.params.id as string, req.body, req.user!.id);
  res.json({ success: true, data: movement });
});

export const deleteInvestorMovement = asyncHandler(async (req, res) => {
  const movement = await investorMovementService.deleteInvestorMovementService(req.params.id as string, req.user!.id);
  res.json({ success: true, data: movement });
});

export const getMovementsByInvestor = asyncHandler(async (req: Request, res: Response) => {
  const movements = await investorMovementService.getMovementsByInvestorService(req.params.investorId as string);
  res.json({ success: true, data: movements });
});