import { z } from 'zod';

export const createPermissionSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be at most 100 characters')
    .regex(/^[a-z0-9._-]+$/, 'Slug must contain only lowercase letters, numbers, dots, hyphens and underscores'),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must be at most 50 characters')
    .optional()
    .nullable(),
});

export const updatePermissionSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9._-]+$/)
    .optional(),
  description: z
    .string()
    .min(3)
    .max(500)
    .optional()
    .nullable(),
  category: z
    .string()
    .min(2)
    .max(50)
    .optional()
    .nullable(),
});

export const assignPermissionToRoleSchema = z.object({
  roleId: z.string().uuid('Invalid role ID'),
});

export const assignPermissionToUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type AssignPermissionToRoleInput = z. infer<typeof assignPermissionToRoleSchema>;
export type AssignPermissionToUserInput = z.infer<typeof assignPermissionToUserSchema>;