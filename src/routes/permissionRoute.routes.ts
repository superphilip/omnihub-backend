import { Router } from 'express';
import * as permissionRouteController from '../controllers/permissionRoute.controller.js';
import { assignPermissionSchema, updateRouteConfigSchema } from '../validators/permissionRoute.validator.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate, requirePrimaryRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requirePrimaryRole);

router.get('/', permissionRouteController.getAllRoutes);

router.get('/:routeKey', permissionRouteController.getRouteDetails);

router.post(
  '/:routeKey/assign-permission',
  validateBody(assignPermissionSchema),
  permissionRouteController.assignPermissionToRoute
);

router.delete(
  '/:routeKey/permissions/:permissionId',
  permissionRouteController.removePermissionFromRoute
);

router.put(
  '/:routeKey',
  validateBody(updateRouteConfigSchema),
  permissionRouteController.updateRouteConfig
);

export default router;