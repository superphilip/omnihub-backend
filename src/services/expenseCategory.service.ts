import prisma, { AuditAction } from '../database/prismaClient.js';
import { createAuditLog } from '../utils/audit.js';
import type { CreateExpenseCategoryInput, UpdateExpenseCategoryInput } from '../validators/expense.validator.js';


export const createExpenseCategoryService = async (input: CreateExpenseCategoryInput, userId: string) => {
  const category = await prisma.expenseCategory.create({ data: input });
  await createAuditLog({
    userId,
    entity: "ExpenseCategory",
    entityId: category.id,
    action: AuditAction.CREATE,
    details: { input },
  });
  return category;
};

export const updateExpenseCategoryService = async (id: string, input: UpdateExpenseCategoryInput, userId: string) => {
  const updated = await prisma.expenseCategory.update({ where: { id }, data: input });
  await createAuditLog({
    userId,
    entity: "ExpenseCategory",
    entityId: id,
    action: AuditAction.UPDATE,
    details: { input }
  });
  return updated;
};

export const deleteExpenseCategoryService = async (id: string, userId: string) => {
  const deleted = await prisma.expenseCategory.delete({ where: { id } });
  await createAuditLog({
    userId,
    entity: "ExpenseCategory",
    entityId: id,
    action: AuditAction.DELETE,
    details: {}
  });
  return deleted;
};

export const getAllExpenseCategoriesService = async () => {
  return prisma.expenseCategory.findMany();
};