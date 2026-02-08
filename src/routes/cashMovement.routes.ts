import { Router } from 'express';
import * as cashMovementController from '../controllers/cashMovement.controller.js';
import { authenticate, checkRouteAccess } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);

router.post('/', cashMovementController.createCashMovement);
router.get('/:cashRegisterId', cashMovementController.getMovementsByRegister);

export default router;