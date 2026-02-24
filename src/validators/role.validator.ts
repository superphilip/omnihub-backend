import { z } from 'zod';

export const createRoleSchema = z. object({
  name: z
    .string()
    .min(3, 'validation.minlength'),
  description: z
    .string()
    .min(3, 'validation.minlength')
    .optional()
    .nullable(),
  isSystemRole: z.boolean(),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(50)
    .optional(),
  description: z
    .string()
    .min(3, 'validation.minlength')
    .optional()
    .nullable(),
  isSystemRole: z.boolean().optional(),
});

export const assignPermissionsToRoleSchema = z. object({
  permissionIds: z
    .array(z.string().uuid('validation.uuid'))
    .min(1, 'validation.minlength')
});

export const removePermissionsFromRoleSchema = z. object({
  permissionIds:  z
    .array(z. string().uuid('validation.uuid'))
    .min(1, 'validation.minlength'),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignPermissionsToRoleInput = z.infer<typeof assignPermissionsToRoleSchema>;
export type RemovePermissionsFromRoleInput = z.infer<typeof removePermissionsFromRoleSchema>;