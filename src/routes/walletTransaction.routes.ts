import { Router } from "express";
import * as walletTransactionController from "../controllers/walletTransaction.controller.js";
import { authenticate, checkRouteAccess } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);

router.post("/", walletTransactionController.createWalletTransaction);
router.put("/:id", authenticate, walletTransactionController.updateWalletTransaction);
router.delete("/:id", authenticate, walletTransactionController.deleteWalletTransaction);
router.get("/:walletId", walletTransactionController.getTransactionsByWallet);

export default router;