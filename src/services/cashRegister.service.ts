import prisma from '../database/prismaClient.js';
import type { CloseCashRegisterInput, OpenCashRegisterInput } from '../validators/cashRegister.validator.js';


// Abrir caja por ruta (1 abierta por ruta permitida)
export const openCashRegisterService = async (input: OpenCashRegisterInput) => {
  const existing = await prisma.cashRegister.findFirst({
    where: { routeId: input.routeId, status: "OPEN", closingDate: null }
  });
  if (existing) throw new Error("Ya existe una caja abierta para esta ruta.");
  return prisma.cashRegister.create({
    data: {
      routeId: input.routeId,
      initialAmount: input.initialAmount
    }
  });
};

// Cerrar caja por ruta
export const closeCashRegisterService = async (id: string, input: CloseCashRegisterInput) => {
  return prisma.cashRegister.update({
    where: { id },
    data: {
      finalAmount: input.finalAmount,
      closingDate: new Date(input.closingDate),
      calculatedBalance: input.calculatedBalance,
      status: "CLOSED"
    }
  });
};

// Lista todas las cajas (puedes agregar filtros por ruta o status)
export const getAllCashRegistersService = async () => {
  return prisma.cashRegister.findMany({
    include: { route: true }
  });
};

// Caja por ID, con movimientos/gastos
export const getCashRegisterByIdService = async (id: string) => {
  return prisma.cashRegister.findUnique({
    where: { id },
    include: { route: true, movements: true, expenses: true }
  });
};