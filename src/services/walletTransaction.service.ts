import prisma, { AuditAction } from '../database/prismaClient.js';
import { AppError } from '../utils/AppError.js';
import { createAuditLog } from '../utils/audit.js';
import type { CreateWalletTransactionInput, UpdateWalletTransactionInput } from '../validators/wallet.validator.js';


export const createWalletTransactionService = async (input: CreateWalletTransactionInput, userId: string) => {
  const wallet = await prisma.wallet.findUnique({ where: { id: input.walletId } });
  if (!wallet) throw new AppError("Wallet no encontrada", 404);

  let newBalance = wallet.balance;
  if (input.type === "DEPOSIT") {
    newBalance += input.amount;
  } else {
    if (wallet.balance < input.amount) throw new AppError("Saldo insuficiente", 400);
    newBalance -= input.amount;
  }

  const [transaction] = await prisma.$transaction([
    prisma.walletTransaction.create({
      data: {
        walletId: input.walletId,
        amount: input.amount,
        type: input.type,
      }
    }),
    prisma.wallet.update({
      where: { id: input.walletId },
      data: { balance: newBalance }
    })
  ]);
  await createAuditLog({
    userId,
    entity: "WalletTransaction",
    entityId: transaction.id,
    action: AuditAction.CREATE,
    details: { input },
  });
  return transaction;
};

export const updateWalletTransactionService = async (id: string, input: UpdateWalletTransactionInput, userId: string) => {
  const tx = await prisma.walletTransaction.update({
    where: { id },
    data: input
  });
  await createAuditLog({
    userId,
    entity: "WalletTransaction",
    entityId: id,
    action: AuditAction.UPDATE,
    details: { input },
  });
  return tx;
};

export const deleteWalletTransactionService = async (id: string, userId: string) => {
  const deleted = await prisma.walletTransaction.delete({ where: { id } });
  await createAuditLog({
    userId,
    entity: "WalletTransaction",
    entityId: id,
    action: AuditAction.DELETE,
    details: {},
  });
  return deleted;
};


export const getTransactionsByWalletService = async (walletId: string) => {
  return prisma.walletTransaction.findMany({
    where: { walletId },
    orderBy: { createdAt: "desc" }
  });
};