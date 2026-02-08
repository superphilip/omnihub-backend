import prisma, { AuditAction } from "../database/prismaClient.js";
import { InstallmentStatus } from "../generated/prisma/edge.js";
import { AppError } from "../utils/AppError.js";
import { createAuditLog } from "../utils/audit.js";
import type { CreateInstallmentInput, UpdateInstallmentInput } from "../validators/installment.validator.js";

export const createInstallment = async (data: CreateInstallmentInput, userId: string) => {
  const installment = await prisma.installment.create({ data });
  await createAuditLog({
    userId,
    entity: "Installment",
    entityId: installment.id,
    action: AuditAction.CREATE,
    details: installment,
  });
  return installment;
};

export const getAllInstallments = async () => {
  return prisma.installment.findMany({
    orderBy: { dueDate: "asc" },
    include: {
      loan: { select: { id: true, clientId: true } },
    },
  });
};

export const getInstallmentById = async (id: string) => {
  const installment = await prisma.installment.findUnique({
    where: { id },
    include: { loan: { select: { id: true, clientId: true } } },
  });
  if (!installment) throw new AppError("Installment not found", 404);
  return installment;
};

export const updateInstallment = async (id: string, data: UpdateInstallmentInput, userId: string) => {
  const installment = await prisma.installment.update({ where: { id }, data  });
  await createAuditLog({
    userId,
    entity: "Installment",
    entityId: id,
    action: AuditAction.UPDATE,
    details: data,
  });
  return installment;
};

export const deleteInstallment = async (id: string, userId: string) => {
  const installment = await prisma.installment.delete({ where: { id } });
  await createAuditLog({
    userId,
    entity: "Installment",
    entityId: id,
    action: AuditAction.DELETE,
    details: { action: "Installment deleted" },
  });
  return installment;
};