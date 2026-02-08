import { z } from "zod";

// Crear Expense
export const createExpenseValidator = z.object({
  amount: z.number().min(0.01),
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
  cashRegisterId: z.string().uuid().optional(),
});
export type CreateExpenseInput = z.infer<typeof createExpenseValidator>;

export const updateExpenseValidator = z.object({
  amount: z.number().min(0.01).optional(),
  categoryId: z.string().uuid().optional(),
  cashRegisterId: z.string().uuid().optional(),
});
export type UpdateExpenseInput = z.infer<typeof updateExpenseValidator>;

// Crear ExpenseCategory
export const createExpenseCategoryValidator = z.object({
  name: z.string().min(1),
});
export type CreateExpenseCategoryInput = z.infer<typeof createExpenseCategoryValidator>;

export const updateExpenseCategoryValidator = z.object({
  name: z.string().min(1).optional(),
});
export type UpdateExpenseCategoryInput = z.infer<typeof updateExpenseCategoryValidator>;