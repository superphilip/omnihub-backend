import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as LoanProductService from "../services/loanProduct.service.js";


/**
 * POST /api/loan-products
 */
export const createLoanProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await LoanProductService.createLoanProductService(
    req.body,
    req.user!.userId
  );
  res.status(201).json({
    success: true,
    message: "LoanProduct created successfully",
    data: product,
  });
});

/**
 * GET /api/loan-products
 */
export const getAllLoanProducts = asyncHandler(async (_req: Request, res: Response) => {
  const data = await LoanProductService.getAllLoanProductsService();
  res.json({
    success: true,
    data,
  });
});

/**
 * GET /api/loan-products/:id
 */
export const getLoanProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await LoanProductService.getLoanProductByIdService(req.params.id as string);
  res.json({
    success: true,
    data: product,
  });
});

/**
 * PUT /api/loan-products/:id
 */
export const updateLoanProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await LoanProductService.updateLoanProductService(
    req.params.id as string,
    req.body,
    req.user!.userId
  );
  res.json({
    success: true,
    message: "LoanProduct updated successfully",
    data: product,
  });
});

export const deleteLoanProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await LoanProductService.deleteLoanProductService(req.params.id as string, req.user!.userId);
    res.status(200).json({
      success: true,
      message: "LoanProduct hard deleted",
      data: product,
    });
});