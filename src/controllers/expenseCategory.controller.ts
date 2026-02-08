import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as expenseCategoryService from "../services/expenseCategory.service.js";

export const createExpenseCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await expenseCategoryService.createExpenseCategoryService(req.body, req.user!.id);
  res.status(201).json({ success: true, data: category });
});

export const updateExpenseCategory = asyncHandler(async (req, res) => {
  const category = await expenseCategoryService.updateExpenseCategoryService(req.params.id as string, req.body, req.user!.id);
  res.json({ success: true, data: category });
});

export const deleteExpenseCategory = asyncHandler(async (req, res) => {
  const deleted = await expenseCategoryService.deleteExpenseCategoryService(req.params.id as string, req.user!.id);
  res.json({ success: true, data: deleted });
});

export const getAllExpenseCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await expenseCategoryService.getAllExpenseCategoriesService();
  res.json({ success: true, data: categories });
});