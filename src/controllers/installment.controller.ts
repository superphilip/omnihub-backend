import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as InstallmentService from "../services/installment.service.js";
import { createInstallmentValidator, updateInstallmentValidator } from "../validators/installment.validator.js";

/**
 * POST /api/installments
 */
export const createInstallment = asyncHandler(async (req: Request, res: Response) => {
  const validated = createInstallmentValidator.parse(req.body);
  const installment = await InstallmentService.createInstallment(validated, req.user!.userId);
  res.status(201).json({
    success: true,
    message: "Installment created successfully",
    data: installment,
  });
});

/**
 * GET /api/installments
 */
export const getAllInstallments = asyncHandler(async (_req: Request, res: Response) => {
  const data = await InstallmentService.getAllInstallments();
  res.json({
    success: true,
    data,
  });
});

/**
 * GET /api/installments/:id
 */
export const getInstallmentById = asyncHandler(async (req: Request, res: Response) => {
  const installment = await InstallmentService.getInstallmentById(req.params.id as string);
  res.json({
    success: true,
    data: installment,
  });
});

/**
 * PUT /api/installments/:id
 */
export const updateInstallment = asyncHandler(async (req: Request, res: Response) => {
  const validated = updateInstallmentValidator.parse(req.body);
  const installment = await InstallmentService.updateInstallment(
    req.params.id as string,
    validated,
    req.user!.userId
  );
  res.json({
    success: true,
    message: "Installment updated successfully",
    data: installment,
  });
});

/**
 * DELETE /api/installments/:id
 */
export const deleteInstallment = asyncHandler(async (req: Request, res: Response) => {
  await InstallmentService.deleteInstallment(
    req.params.id as string,
    req.user!.userId
  );
  res.json({
    success: true,
    message: "Installment deleted successfully",
  });
});