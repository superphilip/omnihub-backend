import { Router } from "express";
import * as loanProductControllers from "../controllers/loanProduct.controller.js";
import { authenticate, checkRouteAccess } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);

router.post("/", loanProductControllers.createLoanProduct);
router.get("/", loanProductControllers.getAllLoanProducts);
router.get("/:id", loanProductControllers.getLoanProductById);
router.put("/:id", loanProductControllers.updateLoanProduct);
router.delete("/:id", loanProductControllers.deleteLoanProduct);

export default router;