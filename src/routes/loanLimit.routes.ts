import { Router } from "express";
import * as loanLimitControllers from "../controllers/loanLimit.controller.js";
import { authenticate, checkRouteAccess } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);

router.post("/", loanLimitControllers.createLoanLimit);
router.get("/", loanLimitControllers.getAllLoanLimits);
router.get("/:id", loanLimitControllers.getLoanLimitById);
router.put("/:id", loanLimitControllers.updateLoanLimit);
router.delete("/:id", loanLimitControllers.deleteLoanLimit);

export default router;