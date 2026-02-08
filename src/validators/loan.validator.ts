import { z } from "zod";


export const createLoanValidator = z.object({
  amountRequested: z.number().min(1),
  interestRate: z.number().min(0),
  pendingBalance: z.number().min(0),
  paymentFrequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]),
  termDays: z.number().int().min(1),
  totalInstallments: z.number().int().min(1),
  startDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  productId: z.string().uuid(),
  clientId: z.string().uuid(),
  routeId: z.string().uuid().optional(),
  status: z.enum(["PENDING", "APPROVED", "PAID", "OVERDUE", "REFINANCED", "CANCELLED"]).optional(),
});

export const disableLoanValidator = z.object({
  deletedAt: z.string().datetime().nullable().optional(),
});

export const updateLoanValidator = createLoanValidator.partial();

export type CreateLoanInput = z.infer<typeof createLoanValidator>;
export type UpdateLoanInput = z.infer<typeof updateLoanValidator>;