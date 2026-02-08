import { Router } from "express";
import * as RouteController from "../controllers/route.controller.js";
import * as UserRouteController from "../controllers/userRoute.controller.js";
import { authenticate, checkRouteAccess } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authenticate, checkRouteAccess, RouteController.createRoute);
router.get("/", authenticate, checkRouteAccess, RouteController.getAllRoutes);
router.get("/:id", authenticate, checkRouteAccess, RouteController.getRouteById);
router.put("/:id", authenticate, checkRouteAccess, RouteController.updateRoute);
router.put("/:id/disable", authenticate, checkRouteAccess, RouteController.disableRoute);

router.post("/:routeId/users", authenticate, checkRouteAccess, UserRouteController.assignUsers);
router.delete("/:routeId/users/:userId", authenticate, checkRouteAccess, UserRouteController.removeUser);
router.get("/:routeId/users", authenticate, checkRouteAccess, UserRouteController.getUsersByRoute);
router.get("/users/:userId", authenticate, checkRouteAccess, UserRouteController.getRoutesByUser);

export default router;