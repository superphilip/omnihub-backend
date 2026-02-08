import { z } from "zod";

export const createCashMovementValidator = z.object({
  cashRegisterId: z.string().uuid(),
  amount: z.number(),
  type: z.enum(["INCOME", "EXPENSE"]),
  concept: z.string(),
  loanId: z.string().uuid().optional(),
  expenseId: z.string().uuid().optional()
});
export type CreateCashMovementInput = z.infer<typeof createCashMovementValidator>;