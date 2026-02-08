import { Router } from "express";
import * as loanControllers from "../controllers/loan.controller.js";
import { authenticate, checkRouteAccess } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);

router.post("/", loanControllers.createLoan);
router.get("/", loanControllers.getAllLoans);
router.get("/:id", loanControllers.getLoanById);
router.put("/:id", loanControllers.updateLoan);
router.put("/:id", loanControllers.toogleLoanActiveStatus);

export default router;