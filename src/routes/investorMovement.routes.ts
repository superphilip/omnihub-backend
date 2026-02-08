import { Router } from "express";
import * as investorMovementController from "../controllers/investorMovement.controller.js";
import { authenticate, checkRouteAccess } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);

router.post("/", investorMovementController.createInvestorMovement);
router.put("/:id", authenticate, investorMovementController.updateInvestorMovement);
router.delete("/:id", authenticate, investorMovementController.deleteInvestorMovement);
router.get("/:investorId", investorMovementController.getMovementsByInvestor);

export default router;