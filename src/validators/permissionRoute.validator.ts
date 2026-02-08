import { z } from 'zod';

export const assignPermissionSchema = z.object({
  permissionId: z.string().uuid('Invalid permission ID'),
});

export const updateRouteConfigSchema = z.object({
  routeName: z.string().min(3).max(100).optional(),
  routeDescription:  z.string().max(500).optional(),
  onlyPrimaryRole: z.boolean().optional(),
});

export type AssignPermissionInput = z.infer<typeof assignPermissionSchema>;
export type UpdateRouteConfigInput = z.infer<typeof updateRouteConfigSchema>;