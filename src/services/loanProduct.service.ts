import prisma, { AuditAction } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { createAuditLog } from "../utils/audit.js";
import type { CreateLoanProductInput, UpdateLoanProductInput } from "../validators/loanProduct.validator.js";

export const createLoanProductService = async (data: CreateLoanProductInput, userId: string) => {
  const exists = await prisma.loanProduct.findUnique({ where: { name: data.name } });
  if (exists) throw new AppError("LoanProduct name already exists", 409);

  const product = await prisma.loanProduct.create({
    data: { ...data, allowedTermsDays: data.allowedTermsDays }
  });

  await createAuditLog({
    userId,
    entity: "LoanProduct",
    entityId: product.id,
    action: AuditAction.CREATE,
    details: product,
  });
  return product;
};

export const getAllLoanProductsService = async () => {
  return prisma.loanProduct.findMany({
    orderBy: { name: "asc" }
  });
};

export const getLoanProductByIdService = async (id: string) => {
  const product = await prisma.loanProduct.findUnique({ where: { id } });
  if (!product) throw new AppError("LoanProduct not found", 404);
  return product;
};

export const updateLoanProductService = async (id: string, data: UpdateLoanProductInput, userId: string) => {
  const product = await prisma.loanProduct.update({ where: { id }, data });
  await createAuditLog({
    userId,
    entity: "LoanProduct",
    entityId: id,
    action: AuditAction.UPDATE,
    details: data,
  });
  return product;
};

export const deleteLoanProductService = async (id: string, userId: string) => {
  const product = await prisma.loanProduct.delete({
    where: { id }
  });

  await createAuditLog({
    userId,
    entity: "LoanProduct",
    entityId: id,
    action: AuditAction.DELETE,
    details: { action: "LoanProduct hard deleted" },
  });

  return product;
};