import { z } from "zod";

export const createRouteValidator = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  description: z.string().optional(),
  zone: z.string().optional(),
});

export const updateRouteValidator = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  zone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateRouteInput = z.infer<typeof createRouteValidator>;
export type UpdateRouteInput = z.infer<typeof updateRouteValidator>;