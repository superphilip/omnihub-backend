import { Router } from "express";
import {
  createInstallment,
  getAllInstallments,
  getInstallmentById,
  updateInstallment,
  deleteInstallment,
} from "../controllers/installment.controller.js";
import { authenticate, checkRouteAccess } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(checkRouteAccess);

router.post("/", createInstallment);
router.get("/", getAllInstallments);
router.get("/:id", getInstallmentById);
router.put("/:id", updateInstallment);
router.delete("/:id", deleteInstallment);

export default router;