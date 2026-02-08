// ═══════════════════════════════════════════════════════
// BASE SYSTEM PERMISSIONS
// Estos permisos se crean automáticamente en el setup
// ═══════════════════════════════════════════════════════

export interface BasePermission {
  slug: string;
  description: string;
  category: string;
}

export const BASE_SYSTEM_PERMISSIONS: BasePermission[] = [
  
  {
    slug: 'roles.view',
    description: 'View all roles in the system',
    category: 'roles',
  },
  {
    slug:  'roles.manage',
    description: 'Create, edit and delete roles',
    category: 'roles',
  },
  {
    slug: 'permissions.view',
    description: 'View all permissions in the system',
    category: 'permissions',
  },
  {
    slug:  'permissions.manage',
    description: 'Create, edit and delete permissions',
    category: 'permissions',
  },
  {
    slug: 'permissions.assign',
    description: 'Assign permissions to roles and users',
    category: 'permissions',
  },
  {
    slug: 'users.manage',
    description: 'Full user management (create, edit, delete, change status)',
    category: 'users',
  },
];

export const getBasePermissions = (): BasePermission[] => {
  return BASE_SYSTEM_PERMISSIONS;
};