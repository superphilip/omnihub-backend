import prisma, { AuditAction } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { createAuditLog } from "../utils/audit.js";
import type { CreateLoanInput, UpdateLoanInput } from "../validators/loan.validator.js";

/** Crear préstamo **/
export const createLoanService = async (data: CreateLoanInput, userId: string) => {
  const loan = await prisma.loan.create({ data });

  await createAuditLog({
    userId,
    entity: 'Loan',
    entityId: loan.id,
    action: AuditAction.CREATE,
    details: loan
  });
  return loan;
};

/** Listar préstamos (puedes agregar paginación, filtro, etc.) **/
export const getAllLoansService = async () => {
  return prisma.loan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, email: true } },
      product: { select: { id: true, name: true } },
      route: { select: { id: true, name: true } },
    },
    where: {
      deletedAt: null,
    },
  });
};

/** Obtener préstamo por ID **/
export const getLoanByIdService = async (id: string) => {
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, email: true } },
      route: { select: { id: true, name: true } },
      product: { select: { id: true, name: true } },
      installments: true,
      collaterals: true,
      collectionLogs: true
    }
  });
  if (!loan) throw new AppError("Loan not found", 404);
  return loan;
};

/** Actualizar préstamo **/
export const updateLoanService = async (id: string, data: UpdateLoanInput, userId: string) => {
  const loan = await prisma.loan.update({ where: { id }, data });

  await createAuditLog({
    userId,
    entity: 'Loan',
    entityId: id,
    action: AuditAction.UPDATE,
    details: data,
  });
  return loan;
};

/** Eliminar préstamo lógico (soft delete) **/
export const setLoanActiveStatusService = async (
  id: string,
  userId: string,
  enabled: boolean
) => {
  const data = enabled
    ? { deletedAt: null }
    : { deletedAt: new Date() };

  const loan = await prisma.loan.update({
    where: { id },
    data,
  });

  await createAuditLog({
    userId,
    entity: 'Loan',
    entityId: id,
    action: enabled ? AuditAction.RESTORE : AuditAction.DELETE,
    details: {
      action: enabled
        ? "Loan restored (enabled)"
        : "Loan soft deleted (disabled)",
    },
  });

  return loan;
};