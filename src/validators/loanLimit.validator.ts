import { z } from "zod";

export const createLoanLimitValidator = z.object({
  loanProductId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  maxAmount: z.number().min(0).optional(),
  minAmount: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});
export const updateLoanLimitValidator = createLoanLimitValidator.partial();

export type CreateLoanLimitInput = z.infer<typeof createLoanLimitValidator>;
export type UpdateLoanLimitInput = z.infer<typeof updateLoanLimitValidator>;