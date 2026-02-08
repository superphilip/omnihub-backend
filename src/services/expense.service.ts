import prisma, { AuditAction } from '../database/prismaClient.js';
import { createAuditLog } from '../utils/audit.js';
import type { CreateExpenseInput, UpdateExpenseInput } from '../validators/expense.validator.js';



export const createExpenseService = async (input: CreateExpenseInput, userId: string) => {
  const expense = await prisma.expense.create({ data: input });
  await createAuditLog({
    userId,
    entity: "Expense",
    entityId: expense.id,
    action: AuditAction.CREATE,
    details: { input },
  });
  return expense;
};

export const updateExpenseService = async (id: string, input: UpdateExpenseInput, userId: string) => {
  const updated = await prisma.expense.update({ where: { id }, data: input });
  await createAuditLog({
    userId,
    entity: "Expense",
    entityId: id,
    action: AuditAction.UPDATE,
    details: { input }
  });
  return updated;
};

export const deleteExpenseService = async (id: string, userId: string) => {
  const deleted = await prisma.expense.delete({ where: { id } });
  await createAuditLog({
    userId,
    entity: "Expense",
    entityId: id,
    action: AuditAction.DELETE,
    details: {}
  });
  return deleted;
};

export const getAllExpensesService = async () => {
  return prisma.expense.findMany({
    include: { user: true, category: true, cashRegister: true }
  });
};

export const getExpenseByIdService = async (id: string) => {
  return prisma.expense.findUnique({
    where: { id },
    include: { user: true, category: true, cashRegister: true }
  });
};