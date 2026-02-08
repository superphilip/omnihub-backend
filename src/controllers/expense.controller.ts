import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import * as expenseService from "../services/expense.service.js";

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.createExpenseService(req.body, req.user!.id);
  res.status(201).json({ success: true, data: expense });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpenseService(req.params.id as string, req.body, req.user!.id);
  res.json({ success: true, data: expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.deleteExpenseService(req.params.id as string, req.user!.id);
  res.json({ success: true, data: expense });
});

export const getAllExpenses = asyncHandler(async (_req: Request, res: Response) => {
  const expenses = await expenseService.getAllExpensesService();
  res.json({ success: true, data: expenses });
});

export const getExpenseById = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.getExpenseByIdService(req.params.id as string);
  res.json({ success: true, data: expense });
});