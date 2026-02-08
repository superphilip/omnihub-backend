import prisma from '../database/prismaClient.js';
import type { CreateCashMovementInput } from '../validators/cashMovement.validator.js';


export const createCashMovementService = async (input: CreateCashMovementInput) => {
  return prisma.cashMovement.create({ data: input });
};

export const getMovementsByRegisterService = async (cashRegisterId: string) => {
  return prisma.cashMovement.findMany({
    where: { cashRegisterId },
    orderBy: { createdAt: "asc" }
  });
};