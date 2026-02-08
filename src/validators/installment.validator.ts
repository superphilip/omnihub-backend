import { z } from "zod";
import { InstallmentStatus } from "../generated/prisma/edge.js";

export const createInstallmentValidator = z.object({
  number: z.number().int().positive(),
  expectedAmount: z.number().min(0.01),
  paidAmount: z.number().min(0).optional(),
  lateFee: z.number().min(0).optional(),
  dueDate: z.string().datetime(),
  paymentDate: z.string().datetime().optional(),
  status: z.enum(InstallmentStatus).optional(),
  loanId: z.string().uuid(),
});

export const updateInstallmentValidator = createInstallmentValidator.partial();

export type CreateInstallmentInput = z.infer<typeof createInstallmentValidator>;
export type UpdateInstallmentInput = z.infer<typeof updateInstallmentValidator>;