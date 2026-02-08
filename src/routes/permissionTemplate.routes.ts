import { Router } from 'express';
import { authenticate, requirePrimaryRole } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateBody.js';
import { applyTemplateSchema } from '../validators/permissionTemplate.validator.js';
import * as PermissionTemplateController from '../controllers/permissionTemplate.controller.js';

const router = Router();


router.use(authenticate);
router.use(requirePrimaryRole);

router.get('/', PermissionTemplateController.getTemplates);
router.get('/:templateId/preview', PermissionTemplateController.getTemplatePreview);
router.post(
  '/apply',
  validateBody(applyTemplateSchema),
  PermissionTemplateController.applyPermissionTemplate
);

export default router;