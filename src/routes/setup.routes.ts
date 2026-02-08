import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { initialSetupSchema } from '../validators/setup.validator.js';
import * as SetupController from '../controllers/setup.controller.js';

const router = Router();

// Verificar estado del setup
router.get('/status', SetupController.getSetupStatus);
// Inicializar sistema (solo funciona si no está configurado)
router.post(
  '/initialize',
  validateBody(initialSetupSchema),
  SetupController.initializeSystem
);

export default router;