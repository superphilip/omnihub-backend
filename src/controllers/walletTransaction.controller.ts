import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as walletTransactionService from "../services/walletTransaction.service.js";

export const createWalletTransaction = asyncHandler(async (req: Request, res: Response) => {
  const tx = await walletTransactionService.createWalletTransactionService(req.body, req.user!.id);
  res.status(201).json({ success: true, data: tx });
});

export const updateWalletTransaction = asyncHandler(async (req: Request, res: Response) => {
  const tx = await walletTransactionService.updateWalletTransactionService(req.params.id as string, req.body, req.user!.id);
  res.json({ success: true, data: tx });
});

export const deleteWalletTransaction = asyncHandler(async (req: Request, res: Response) => {
  const tx = await walletTransactionService.deleteWalletTransactionService(req.params.id as string, req.user!.id);
  res.json({ success: true, data: tx });
});

export const getTransactionsByWallet = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await walletTransactionService.getTransactionsByWalletService(req.params.walletId as string);
  res.json({ success: true, data: transactions });
});