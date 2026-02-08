import { Router } from 'express';
import { authenticate, requirePrimaryRole } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateBody.js';
import * as PermissionController from '../controllers/permission.controller.js';
import {
  createPermissionSchema,
  updatePermissionSchema,
  assignPermissionToRoleSchema,
} from '../validators/permission.validator.js';

const router = Router();

// Todas las rutas requieren autenticación y rol principal
router. use(authenticate);
router.use(requirePrimaryRole);

// CRUD de permisos
router. post(
  '/',
  validateBody(createPermissionSchema),
  PermissionController.createPermission
);

router.get('/', PermissionController.getAllPermissions);

router.get('/:id', PermissionController.getPermissionById);

router.put(
  '/:id',
  validateBody(updatePermissionSchema),
  PermissionController.updatePermission
);

router.delete('/:id', PermissionController.deletePermission);

// Asignar/quitar permiso a rol
router.post(
  '/:id/assign-to-role',
  validateBody(assignPermissionToRoleSchema),
  PermissionController.assignPermissionToRole
);

router.delete(
  '/:id/roles/:roleId',
  PermissionController.removePermissionFromRole
);

export default router;