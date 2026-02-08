import prisma, { AuditAction } from '../database/prismaClient.js';
import { createAuditLog } from '../utils/audit.js';
import type { CreateInvestorInput, UpdateInvestorInput } from '../validators/investor.validator.js';


// userId del actor debe venir del contexto/auth
export const createInvestorService = async (input: CreateInvestorInput, userId: string) => {
  const investor = await prisma.investor.create({ data: input });
  await createAuditLog({
    userId,
    entity: "Investor",
    entityId: investor.id,
    action: AuditAction.CREATE,
    details: { input },
  });
  return investor;
};

export const updateInvestorService = async (id: string, input: UpdateInvestorInput, userId: string) => {
  const updated = await prisma.investor.update({ where: { id }, data: input });
  await createAuditLog({
    userId,
    entity: "Investor",
    entityId: id,
    action: AuditAction.UPDATE,
    details: { input }
  });
  return updated;
};

export const deleteInvestorService = async (id: string, userId: string) => {
  const deleted = await prisma.investor.delete({ where: { id } });
  await createAuditLog({
    userId,
    entity: "Investor",
    entityId: id,
    action: AuditAction.DELETE,
    details: {}
  });
  return deleted;
};

export const getAllInvestorsService = async () => {
  return prisma.investor.findMany({ include: { movements: true } });
};

export const getInvestorByIdService = async (id: string) => {
  return prisma.investor.findUnique({
    where: { id },
    include: { movements: true }
  });
};