import { Router } from "express";
import * as walletController from "../controllers/wallet.controller.js";
import { authenticate, checkRouteAccess } from "../middlewares/authMiddleware.js";


const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);


router.post("/", walletController.createWallet);
router.put("/:walletId", authenticate, walletController.updateWallet);
router.delete("/:walletId", authenticate, walletController.deleteWallet);
router.get("/", walletController.getAllWallets);
router.get("/user/:userId", walletController.getWalletByUserId);
router.get("/:walletId", walletController.getWalletById);

export default router;