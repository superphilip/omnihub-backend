import { z } from "zod";

export const assignUsersValidator = z.object({
  userIds: z.array(
    z.object({
      userId: z.string().uuid(),
      roleInRoute: z.string().optional(),
    })
  ).min(1, "Debes asignar al menos un usuario"),
});
export type AssignUsersInput = z.infer<typeof assignUsersValidator>;