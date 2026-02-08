import { Router } from 'express';
import * as cashRegisterController from '../controllers/cashRegister.controller.js';
import { authenticate, checkRouteAccess } from '../middlewares/authMiddleware.js';


const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);


router.post('/', cashRegisterController.openCashRegister);
router.put('/:id/close', cashRegisterController.closeCashRegister);
router.get('/', cashRegisterController.getAllCashRegisters);
router.get('/:id', cashRegisterController.getCashRegisterById);

export default router;