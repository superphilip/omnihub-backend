import { z } from 'zod';

export const createRoleSchema = z. object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be at most 50 characters'),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must be at most 500 characters')
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
    .min(3)
    .max(500)
    .optional()
    .nullable(),
});

export const assignPermissionsToRoleSchema = z. object({
  permissionIds: z
    .array(z.string().uuid('Each permission ID must be a valid UUID'))
    .min(1, 'At least one permission ID is required')
    .max(100, 'Cannot assign more than 100 permissions at once'),
});

export const removePermissionsFromRoleSchema = z. object({
  permissionIds:  z
    .array(z. string().uuid('Each permission ID must be a valid UUID'))
    .min(1, 'At least one permission ID is required'),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignPermissionsToRoleInput = z.infer<typeof assignPermissionsToRoleSchema>;
export type RemovePermissionsFromRoleInput = z.infer<typeof removePermissionsFromRoleSchema>;