import { z } from "zod";

// Crear/recargar wallet (opcional, normalmente autocreate con registro)
export const createWalletValidator = z.object({
  userId: z.string().uuid(),
  initialBalance: z.number().optional(),
});
export type CreateWalletInput = z.infer<typeof createWalletValidator>;

export const updateWalletValidator = z.object({
  balance: z.number().optional()
  // Agrega más campos si tu modelo lo permite
});
export type UpdateWalletInput = z.infer<typeof updateWalletValidator>;

// Registrar transacción wallet
export const createWalletTransactionValidator = z.object({
  walletId: z.string().uuid(),
  amount: z.number(),
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
});
export type CreateWalletTransactionInput = z.infer<typeof createWalletTransactionValidator>;

// PUT (actualizar transacción)
export const updateWalletTransactionValidator = z.object({
  amount: z.number().optional(),
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]).optional()
});
export type UpdateWalletTransactionInput = z.infer<typeof updateWalletTransactionValidator>;