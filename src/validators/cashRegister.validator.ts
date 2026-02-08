import { z } from "zod";

// Para apertura de caja por ruta
export const openCashRegisterValidator = z.object({
  routeId: z.string().uuid(),
  initialAmount: z.number().min(0)
});
export type OpenCashRegisterInput = z.infer<typeof openCashRegisterValidator>;

// Para cierre de caja por ruta
export const closeCashRegisterValidator = z.object({
  finalAmount: z.number(),
  closingDate: z.string().datetime(),
  calculatedBalance: z.number()
});
export type CloseCashRegisterInput = z.infer<typeof closeCashRegisterValidator>;