import prisma, { AuditAction } from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../utils/audit.js';
import type { CreateWalletInput, UpdateWalletInput } from '../validators/wallet.validator.js';


export const createWalletService = async (input: CreateWalletInput, userId: string) => {
  const existing = await prisma.wallet.findUnique({ where: { userId: input.userId } });
  if (existing) throw new AppError("El usuario ya tiene wallet", 409);

  const wallet = await prisma.wallet.create({
    data: {
      userId: input.userId,
      balance: input.initialBalance || 0,
    }
  });
  await createAuditLog({
    userId,
    entity: "Wallet",
    entityId: wallet.id,
    action: AuditAction.CREATE,
    details: { input },
  });
  return wallet;
};

export const updateWalletService = async (walletId: string, input: UpdateWalletInput, userId: string) => {
  const updated = await prisma.wallet.update({
    where: { id: walletId },
    data: input
  });
  await createAuditLog({
    userId,
    entity: "Wallet",
    entityId: walletId,
    action: AuditAction.UPDATE,
    details: { input },
  });
  return updated;
};

export const deleteWalletService = async (walletId: string, userId: string) => {
  const deleted = await prisma.wallet.delete({ where: { id: walletId } });
  await createAuditLog({
    userId,
    entity: "Wallet",
    entityId: walletId,
    action: AuditAction.DELETE,
    details: {},
  });
  return deleted;
};

export const getWalletByUserIdService = async (userId: string) => {
  return prisma.wallet.findUnique({
    where: { userId },
    include: { transactions: true }
  });
};

export const getWalletByIdService = async (walletId: string) => {
  return prisma.wallet.findUnique({
    where: { id: walletId },
    include: { user: true, transactions: true }
  });
};

export const getAllWalletsService = async () => {
  return prisma.wallet.findMany({
    include: { user: true },
  });
};