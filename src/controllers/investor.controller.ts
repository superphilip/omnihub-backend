import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as investorService from "../services/investor.service.js";

export const createInvestor = asyncHandler(async (req: Request, res: Response) => {
  const investor = await investorService.createInvestorService(req.body, req.user!.id);
  res.status(201).json({ success: true, data: investor });
});

export const updateInvestor = asyncHandler(async (req, res) => {
  const investor = await investorService.updateInvestorService(req.params.id as string, req.body, req.user!.id);
  res.json({ success: true, data: investor });
});

export const deleteInvestor = asyncHandler(async (req, res) => {
  const deleted = await investorService.deleteInvestorService(req.params.id as string, req.user!.id);
  res.json({ success: true, data: deleted });
});


export const getAllInvestors = asyncHandler(async (_req: Request, res: Response) => {
  const investors = await investorService.getAllInvestorsService();
  res.json({ success: true, data: investors });
});

export const getInvestorById = asyncHandler(async (req: Request, res: Response) => {
  const investor = await investorService.getInvestorByIdService(req.params.id as string);
  res.json({ success: true, data: investor });
});