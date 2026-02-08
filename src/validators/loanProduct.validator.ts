import { z } from "zod";

export const createLoanProductValidator = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  defaultInterest: z.number().min(0),
  defaultFrequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]),
  allowedTermsDays: z.array(z.number().int().min(1)),
  isActive: z.boolean().optional(),
});

export const updateLoanProductValidator = createLoanProductValidator.partial();

export type CreateLoanProductInput = z.infer<typeof createLoanProductValidator>;
export type UpdateLoanProductInput = z.infer<typeof updateLoanProductValidator>;