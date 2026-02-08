import prisma, { AuditAction } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { createAuditLog } from "../utils/audit.js";
import type { CreateLoanLimitInput, UpdateLoanLimitInput } from "../validators/loanLimit.validator.js";

export const createLoanLimitService = async (data: CreateLoanLimitInput, userId: string) => {
  const limit = await prisma.loanLimit.create({ data });
  await createAuditLog({
    userId,
    entity: 'LoanLimit',
    entityId: limit.id,
    action: AuditAction.CREATE,
    details: limit,
  });
  return limit;
};

export const getAllLoanLimitsService = async () => {
  return prisma.loanLimit.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      loanProduct: true,
      client: true,
    }
  });
};

export const getLoanLimitByIdService = async (id: string) => {
  const limit = await prisma.loanLimit.findUnique({
    where: { id },
    include: {
      loanProduct: true,
      client: true,
    }
  });
  if (!limit) throw new AppError("Loan limit not found", 404);
  return limit;
};

export const updateLoanLimitService = async (id: string, data: UpdateLoanLimitInput, userId: string) => {
  const limit = await prisma.loanLimit.update({ where: { id }, data });
  await createAuditLog({
    userId,
    entity: 'LoanLimit',
    entityId: id,
    action: AuditAction.UPDATE,
    details: data,
  });
  return limit;
};

export const deleteLoanLimitService = async (id: string, userId: string) => {
  const limit = await prisma.loanLimit.delete({
    where: { id }
  });

  await createAuditLog({
    userId,
    entity: 'LoanLimit',
    entityId: id,
    action: AuditAction.DELETE,
    details: { action: "LoanLimit soft deleted" },
  });
  return limit;
};