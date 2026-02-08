import { Router } from "express";
import * as expenseCategoryController from "../controllers/expenseCategory.controller.js";
import { authenticate, checkRouteAccess } from "../middlewares/authMiddleware.js";


const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);

router.post("/", expenseCategoryController.createExpenseCategory);
router.put("/:id", authenticate, expenseCategoryController.updateExpenseCategory);
router.delete("/:id", authenticate, expenseCategoryController.deleteExpenseCategory);
router.get("/", expenseCategoryController.getAllExpenseCategories);

export default router;