import { Router } from "express";
import * as investorController from "../controllers/investor.controller.js";
import { authenticate, checkRouteAccess } from "../middlewares/authMiddleware.js";


const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);

router.post("/", investorController.createInvestor);
router.put("/:id", authenticate, investorController.updateInvestor);
router.delete("/:id", authenticate, investorController.deleteInvestor);
router.get("/", investorController.getAllInvestors);
router.get("/:id",investorController.getInvestorById);

export default router;