import prisma, { AuditAction } from '../database/prismaClient.js';
import { createAuditLog } from '../utils/audit.js';
import type { CreateInvestorMovementInput, UpdateInvestorMovementInput } from '../validators/investor.validator.js';


export const createInvestorMovementService = async (input: CreateInvestorMovementInput, userId: string) => {
  const movement = await prisma.investorMovement.create({ data: input });
  await createAuditLog({
    userId,
    entity: "InvestorMovement",
    entityId: movement.id,
    action: AuditAction.CREATE,
    details: { input },
  });
  return movement;
};

export const updateInvestorMovementService = async (id: string, input: UpdateInvestorMovementInput, userId: string) => {
  const updated = await prisma.investorMovement.update({ where: { id }, data: input });
  await createAuditLog({
    userId,
    entity: "InvestorMovement",
    entityId: id,
    action: AuditAction.UPDATE,
    details: { input }
  });
  return updated;
};

export const deleteInvestorMovementService = async (id: string, userId: string) => {
  const deleted = await prisma.investorMovement.delete({ where: { id } });
  await createAuditLog({
    userId,
    entity: "InvestorMovement",
    entityId: id,
    action: AuditAction.DELETE,
    details: {}
  });
  return deleted;
};

export const getMovementsByInvestorService = async (investorId: string) => {
  return prisma.investorMovement.findMany({
    where: { investorId },
    orderBy: { createdAt: "desc" }
  });
};