import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as walletService from "../services/wallet.service.js";


export const createWallet = asyncHandler(async (req: Request, res: Response) => {
  const wallet = await walletService.createWalletService(req.body, req.user!.id);
  res.status(201).json({ success: true, data: wallet });
});

export const updateWallet = asyncHandler(async (req: Request, res: Response) => {
  const wallet = await walletService.updateWalletService(req.params.walletId as string, req.body, req.user!.id);
  res.json({ success: true, data: wallet });
});

export const deleteWallet = asyncHandler(async (req: Request, res: Response) => {
  const wallet = await walletService.deleteWalletService(req.params.walletId as string, req.user!.id);
  res.json({ success: true, data: wallet });
});

export const getAllWallets = asyncHandler(async (_req: Request, res: Response) => {
  const wallets = await walletService.getAllWalletsService();
  res.json({ success: true, data: wallets });
});

export const getWalletByUserId = asyncHandler(async (req: Request, res: Response) => {
  const wallet = await walletService.getWalletByUserIdService(req.params.userId as string);
  res.json({ success: true, data: wallet });
});

export const getWalletById = asyncHandler(async (req: Request, res: Response) => {
  const wallet = await walletService.getWalletByIdService(req.params.walletId as string);
  res.json({ success: true, data: wallet });
});