import { z } from "zod";

// Crear o actualizar Investor
export const createInvestorValidator = z.object({
  name: z.string().min(1),
  investedCapital: z.number().min(0).optional(),
  sharePercentage: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});
export type CreateInvestorInput = z.infer<typeof createInvestorValidator>;

export const updateInvestorValidator = z.object({
  name: z.string().min(1).optional(),
  investedCapital: z.number().min(0).optional(),
  sharePercentage: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateInvestorInput = z.infer<typeof updateInvestorValidator>;

// InvestorMovement
export const createInvestorMovementValidator = z.object({
  investorId: z.string().uuid(),
  amount: z.number(),
  type: z.enum(["CAPITAL_CONTRIBUTION", "CAPITAL_WITHDRAWAL", "PROFIT_WITHDRAWAL"]),
});
export type CreateInvestorMovementInput = z.infer<typeof createInvestorMovementValidator>;

export const updateInvestorMovementValidator = z.object({
  amount: z.number().optional(),
  type: z.enum(["CAPITAL_CONTRIBUTION", "CAPITAL_WITHDRAWAL", "PROFIT_WITHDRAWAL"]).optional(),
});
export type UpdateInvestorMovementInput = z.infer<typeof updateInvestorMovementValidator>;