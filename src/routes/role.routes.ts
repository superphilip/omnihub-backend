import { Router } from 'express';
import { authenticate, requirePrimaryRole } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateBody.js';
import * as RoleController from '../controllers/role.controller.js';
import {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsToRoleSchema,
  removePermissionsFromRoleSchema,
} from '../validators/role.validator.js';

const router = Router();

// Todas las rutas requieren autenticación y rol principal
router.use(authenticate);
router.use(requirePrimaryRole);

// CRUD de roles
router.post(
  '/',
  validateBody(createRoleSchema),
  RoleController.createRole
);

router.get('/', RoleController.getAllRoles);

router.get('/:id', RoleController.getRoleById);

router.put(
  '/:id',
  validateBody(updateRoleSchema),
  RoleController.updateRole
);

router.delete('/:id', RoleController.deleteRole);

// Asignar/quitar permisos masivamente
router.post(
  '/:id/permissions',
  validateBody(assignPermissionsToRoleSchema),
  RoleController.assignPermissionsToRole
);

router.delete(
  '/:id/permissions',
  validateBody(removePermissionsFromRoleSchema),
  RoleController.removePermissionsFromRole
);

export default router;