import { Router } from "express";
import * as expenseController from "../controllers/expense.controller.js";
import { authenticate, checkRouteAccess } from "../middlewares/authMiddleware.js";


const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);

router.post("/", expenseController.createExpense);
router.put("/:id", authenticate, expenseController.updateExpense);
router.delete("/:id", authenticate, expenseController.deleteExpense);
router.get("/", expenseController.getAllExpenses);
router.get("/:id", expenseController.getExpenseById);

export default router;