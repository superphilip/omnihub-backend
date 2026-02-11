import { Router } from 'express';
import { authenticate, requirePrimaryRole } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateBody.js';
import { paginationMiddleware } from '../middlewares/pagination.middleware.js';

import * as RoleController from '../controllers/role.controller.js';
import {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsToRoleSchema,
  removePermissionsFromRoleSchema,
} from '../validators/role.validator.js';

const router = Router();

// Todas las rutas de Roles requieren autenticación y rol principal
router.use(authenticate);
router.use(requirePrimaryRole);

// Crear rol
router.post(
  '/',
  validateBody(createRoleSchema),
  RoleController.createRole
);

// Listar roles (paginado, filtrado) con locale aplicado vía middleware attachLocale
router.get(
  '/',
  paginationMiddleware,
  RoleController.getAllRoles
);

// Obtener rol por ID (incluye relaciones; aplica locale si está presente)
router.get(
  '/:id',
  RoleController.getRoleById
);

// Actualizar rol (nombre/descripcion base; traducciones se gestionan aparte)
router.put(
  '/:id',
  validateBody(updateRoleSchema),
  RoleController.updateRole
);

// Eliminar rol
router.delete(
  '/:id',
  RoleController.deleteRole
);

// Asignar permisos masivamente a un rol
router.post(
  '/:id/permissions',
  validateBody(assignPermissionsToRoleSchema),
  RoleController.assignPermissionsToRole
);

// Quitar permisos masivamente de un rol
router.delete(
  '/:id/permissions',
  validateBody(removePermissionsFromRoleSchema),
  RoleController.removePermissionsFromRole
);

export default router;