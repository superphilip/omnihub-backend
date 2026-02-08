import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validateBody.js';
import { loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refreshToken);

export default router;