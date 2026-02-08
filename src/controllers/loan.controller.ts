import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  createLoanService,
  getAllLoansService,
  getLoanByIdService,
  updateLoanService,
  setLoanActiveStatusService
} from "../services/loan.service.js";
import { createLoanValidator, updateLoanValidator } from "../validators/loan.validator.js";

/**
 * POST /api/loans
 */
export const createLoan = asyncHandler(async (req: Request, res: Response) => {
  const validated = createLoanValidator.parse(req.body);
  const loan = await createLoanService(validated, req.user!.userId);
  res.status(201).json({
    success: true,
    message: "Loan created successfully",
    data: loan,
  });
});

/**
 * GET /api/loans
 */
export const getAllLoans = asyncHandler(async (_req: Request, res: Response) => {
  const loans = await getAllLoansService();
  res.json({
    success: true,
    data: loans,
  });
});

/**
 * GET /api/loans/:id
 */
export const getLoanById = asyncHandler(async (req: Request, res: Response) => {
  const loan = await getLoanByIdService(req.params.id as string);
  res.json({
    success: true,
    data: loan,
  });
});

/**
 * PUT /api/loans/:id
 */
export const updateLoan = asyncHandler(async (req: Request, res: Response) => {
  const validated = updateLoanValidator.parse(req.body);
  const loan = await updateLoanService(req.params.id as string, validated, req.user!.userId);
  res.json({
    success: true,
    message: "Loan updated successfully",
    data: loan,
  });
});

export const toogleLoanActiveStatus = asyncHandler(async (req: Request, res: Response) => {
  const { enabled } = req.body;
  const loan = await setLoanActiveStatusService(
    req.params.id as string,
    req.user!.userId,
    req.body.enabled
  );
  res.json({
    success: true,
    message: enabled
        ? "Loan enabled (restored)"
        : "Loan disabled (soft deleted)",
    data: loan,
  });
});
