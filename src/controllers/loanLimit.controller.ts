import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as LoanLimitService from "../services/loanLimit.service.js";
import { createLoanLimitValidator, updateLoanLimitValidator } from "../validators/loanLimit.validator.js";

/**
 * POST /api/loan-limits
 */
export const createLoanLimit = asyncHandler(async (req: Request, res: Response) => {
  const validated = createLoanLimitValidator.parse(req.body);
  const limit = await LoanLimitService.createLoanLimitService(
    validated,
    req.user!.userId
  );
  res.status(201).json({
    success: true,
    message: "LoanLimit created successfully",
    data: limit,
  });
});

/**
 * GET /api/loan-limits
 */
export const getAllLoanLimits = asyncHandler(async (_req: Request, res: Response) => {
  const data = await LoanLimitService.getAllLoanLimitsService();
  res.json({
    success: true,
    data,
  });
});

/**
 * GET /api/loan-limits/:id
 */
export const getLoanLimitById = asyncHandler(async (req: Request, res: Response) => {
  const limit = await LoanLimitService.getLoanLimitByIdService(req.params.id as string);
  res.json({
    success: true,
    data: limit,
  });
});

/**
 * PUT /api/loan-limits/:id
 */
export const updateLoanLimit = asyncHandler(async (req: Request, res: Response) => {
  const validated = updateLoanLimitValidator.parse(req.body);
  const limit = await LoanLimitService.updateLoanLimitService(
    req.params.id as string,
    validated,
    req.user!.userId
  );
  res.json({
    success: true,
    message: "LoanLimit updated successfully",
    data: limit,
  });
});

/**
 * DELETE /api/loan-limits/:id
 */
export const deleteLoanLimit = asyncHandler(async (req: Request, res: Response) => {
  await LoanLimitService.deleteLoanLimitService(
    req.params.id as string,
    req.user!.userId
  );
  res.json({
    success: true,
    message: "LoanLimit deleted successfully",
  });
});