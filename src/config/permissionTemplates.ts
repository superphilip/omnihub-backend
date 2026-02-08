export interface PermissionDefinition {
  slug: string;
  description: string;
  category: string;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  description:  string;
  icon: string;
  recommended: boolean;
  totalPermissions: number;
  permissions: PermissionDefinition[];
}

export const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'base_minimal',
    name:  'Base Mínima',
    description: 'Permisos esenciales para administrar roles, permisos y usuarios.  Ideal si deseas configurar todo manualmente después.',
    icon: '⚙️',
    recommended:  false,
    totalPermissions: 6,
    permissions: [
      { slug: 'roles.view', description: 'Ver todos los roles del sistema', category: 'roles' },
      { slug: 'roles.manage', description: 'Crear, editar y eliminar roles', category:  'roles' },
      { slug: 'permissions.view', description: 'Ver todos los permisos del sistema', category: 'permissions' },
      { slug: 'permissions.manage', description: 'Crear, editar y eliminar permisos', category: 'permissions' },
      { slug: 'permissions.assign', description: 'Asignar permisos a roles y usuarios', category: 'permissions' },
      { slug: 'users.manage', description: 'Gestión completa de usuarios', category: 'users' },
    ],
  },

  
  {
    id: 'full_financial',
    name: 'Financiera Completa',
    description: 'Sistema completo de gestión financiera:  préstamos, cobranza, rutas, reportes y auditoría.  Ideal para empresas de crédito establecidas.',
    icon: '🏦',
    recommended: true,
    totalPermissions: 40,
    permissions: [
      // ROLES
      { slug: 'roles.view', description: 'Ver todos los roles', category: 'roles' },
      { slug: 'roles.create', description: 'Crear nuevos roles', category: 'roles' },
      { slug: 'roles.edit', description: 'Editar roles existentes', category: 'roles' },
      { slug: 'roles.delete', description: 'Eliminar roles', category: 'roles' },
      
      // PERMISSIONS
      { slug: 'permissions.view', description: 'Ver todos los permisos', category:  'permissions' },
      { slug: 'permissions.create', description: 'Crear nuevos permisos', category: 'permissions' },
      { slug:  'permissions.edit', description: 'Editar permisos', category: 'permissions' },
      { slug: 'permissions.delete', description: 'Eliminar permisos', category: 'permissions' },
      { slug: 'permissions.assign', description: 'Asignar permisos', category: 'permissions' },
      
      // USERS
      { slug: 'users.view', description: 'Ver usuarios', category: 'users' },
      { slug:  'users.view_details', description: 'Ver detalles completos', category: 'users' },
      { slug: 'users.create', description: 'Crear usuarios', category: 'users' },
      { slug:  'users.edit', description: 'Editar usuarios', category: 'users' },
      { slug: 'users.delete', description: 'Eliminar usuarios', category: 'users' },
      { slug: 'users.restore', description: 'Restaurar usuarios', category: 'users' },
      { slug: 'users.change_status', description: 'Cambiar estado', category: 'users' },
      { slug: 'users.assign_role', description: 'Asignar roles', category: 'users' },
      
      // DOCUMENTS
      { slug: 'documents.view', description: 'Ver documentos', category: 'documents' },
      { slug: 'documents.review', description: 'Revisar documentos', category: 'documents' },
      { slug: 'documents.delete', description: 'Eliminar documentos', category: 'documents' },
      
      // LOANS
      { slug: 'loans.view', description: 'Ver préstamos', category: 'loans' },
      { slug:  'loans.create', description: 'Crear préstamos', category: 'loans' },
      { slug: 'loans.edit', description: 'Editar préstamos', category: 'loans' },
      { slug: 'loans.approve', description: 'Aprobar préstamos', category: 'loans' },
      { slug:  'loans.reject', description: 'Rechazar préstamos', category: 'loans' },
      { slug: 'loans.disburse', description: 'Desembolsar préstamos', category:  'loans' },
      
      // COLLECTION
      { slug: 'collection.view', description: 'Ver cobranza', category: 'collection' },
      { slug: 'collection.register', description: 'Registrar pagos', category: 'collection' },
      { slug: 'collection.manage', description: 'Gestionar cobranza', category: 'collection' },
      
      // ROUTES
      { slug: 'routes.view', description: 'Ver rutas', category: 'routes' },
      { slug: 'routes.create', description: 'Crear rutas', category:  'routes' },
      { slug: 'routes.edit', description: 'Editar rutas', category: 'routes' },
      { slug: 'routes.delete', description: 'Eliminar rutas', category:  'routes' },
      { slug: 'routes.assign', description: 'Asignar rutas', category: 'routes' },
      
      // REPORTS
      { slug: 'reports.view', description: 'Ver reportes', category: 'reports' },
      { slug:  'reports.financial', description: 'Reportes financieros', category: 'reports' },
      { slug: 'reports.portfolio', description: 'Reportes de cartera', category: 'reports' },
      { slug: 'reports.export', description: 'Exportar reportes', category: 'reports' },
      
      // AUDIT
      { slug: 'audit.view', description: 'Ver auditoría', category: 'audit' },
      { slug:  'audit.export', description: 'Exportar auditoría', category: 'audit' },
    ],
  },

  {
    id: 'micro_credit',
    name: 'MicroCrédito Básico',
    description: 'Sistema enfocado en microcréditos con gestión de clientes, préstamos y cobranza básica. Ideal para startups.',
    icon: '💰',
    recommended: false,
    totalPermissions: 18,
    permissions: [
      { slug: 'roles.view', description: 'Ver roles', category: 'roles' },
      { slug: 'roles.create', description: 'Crear roles', category: 'roles' },
      { slug: 'roles.edit', description: 'Editar roles', category:  'roles' },
      { slug: 'permissions.view', description: 'Ver permisos', category: 'permissions' },
      { slug:  'permissions.assign', description: 'Asignar permisos', category: 'permissions' },
      { slug: 'users.view', description: 'Ver usuarios', category:  'users' },
      { slug: 'users.create', description: 'Crear usuarios', category: 'users' },
      { slug: 'users.edit', description: 'Editar usuarios', category: 'users' },
      { slug: 'users.change_status', description: 'Cambiar estado', category: 'users' },
      { slug:  'documents.view', description: 'Ver documentos', category: 'documents' },
      { slug: 'documents.review', description: 'Revisar documentos', category: 'documents' },
      { slug: 'loans.view', description: 'Ver préstamos', category:  'loans' },
      { slug: 'loans.create', description: 'Crear préstamos', category: 'loans' },
      { slug: 'loans.approve', description: 'Aprobar préstamos', category: 'loans' },
      { slug:  'loans.disburse', description: 'Desembolsar préstamos', category: 'loans' },
      { slug: 'collection.view', description: 'Ver cobranza', category: 'collection' },
      { slug: 'collection.register', description: 'Registrar pagos', category: 'collection' },
      { slug: 'reports.view', description: 'Ver reportes', category: 'reports' },
    ],
  },

  // ─────────────────────────────────────────────────────
  // Template 3: Cobranza y Rutas
  // ─────────────────────────────────────────────────────
  {
    id:  'collection_routes',
    name: 'Cobranza y Rutas',
    description: 'Especializado en gestión de cobranza con sistema de rutas para cobradores. Ideal para operaciones de campo.',
    icon: '🚗',
    recommended: false,
    totalPermissions: 19,
    permissions: [
      { slug: 'roles.view', description: 'Ver roles', category: 'roles' },
      { slug: 'roles.create', description: 'Crear roles', category: 'roles' },
      { slug: 'permissions.view', description: 'Ver permisos', category: 'permissions' },
      { slug:  'permissions.assign', description: 'Asignar permisos', category: 'permissions' },
      { slug: 'users.view', description: 'Ver usuarios', category: 'users' },
      { slug: 'users.create', description: 'Crear usuarios', category: 'users' },
      { slug: 'users.edit', description: 'Editar usuarios', category: 'users' },
      { slug: 'users.change_status', description: 'Cambiar estado', category: 'users' },
      { slug: 'users.assign_role', description: 'Asignar roles', category: 'users' },
      { slug: 'loans.view', description: 'Ver préstamos', category: 'loans' },
      { slug:  'collection.view', description: 'Ver cobranza', category: 'collection' },
      { slug:  'collection.register', description: 'Registrar pagos', category: 'collection' },
      { slug: 'collection.manage', description: 'Gestionar cobranza', category:  'collection' },
      { slug: 'routes.view', description: 'Ver rutas', category: 'routes' },
      { slug: 'routes.create', description: 'Crear rutas', category: 'routes' },
      { slug: 'routes.edit', description: 'Editar rutas', category: 'routes' },
      { slug: 'routes.assign', description: 'Asignar rutas', category: 'routes' },
      { slug:  'reports.view', description: 'Ver reportes', category:  'reports' },
      { slug: 'reports.export', description: 'Exportar reportes', category: 'reports' },
    ],
  },

  // ─────────────────────────────────────────────────────
  // 🎯 AGREGAR NUEVOS TEMPLATES AQUÍ
  // ─────────────────────────────────────────────────────
  // {
  //   id: 'nuevo_template',
  //   name: 'Nombre del Template',
  //   description: 'Descripción.. .',
  //   icon: '🎉',
  //   recommended: false,
  //   totalPermissions: 10,
  //   permissions: [
  //     { slug: 'ejemplo.permiso', description: 'Descripción', category: 'categoria' },
  //   ],
  // },
];


export const getAllTemplates = (): PermissionTemplate[] => {
  return PERMISSION_TEMPLATES;
};

export const getTemplateById = (templateId: string): PermissionTemplate | null => {
  return PERMISSION_TEMPLATES.find(t => t.id === templateId) || null;
};

export const getTemplatePreview = (templateId: string) => {
  const template = getTemplateById(templateId);
  if (!template) return null;

  const categoryCounts = template.permissions.reduce((acc, perm) => {
    acc[perm.category] = (acc[perm.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    id:  template.id,
    name: template.name,
    description: template.description,
    icon: template.icon,
    recommended: template.recommended,
    totalPermissions: template.totalPermissions,
    categoryCounts,
    permissions: template.permissions,
  };
};

export const getValidTemplateIds = (): string[] => {
  return PERMISSION_TEMPLATES.map(t => t.id);
};

export const isValidTemplateId = (templateId: string): boolean => {
  return PERMISSION_TEMPLATES. some(t => t.id === templateId);
};