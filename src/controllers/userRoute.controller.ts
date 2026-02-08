import * as userRouteService from "../services/userRoute.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const assignUsers = asyncHandler(async (req, res) => {
    const { routeId} = req.params;
    const userId = req.user?.id;
    const assigned = await userRouteService.assignUsersToRouteService(routeId as string, req.body, userId as string);
    res.status(201).json({ success: true, data: assigned });
});

export const removeUser = asyncHandler(async (req, res) => {
    const { routeId, userId } = req.params;
    const result = await userRouteService.removeUserFromRouteService(routeId as string, userId as string);
    res.json(result);
});

export const getUsersByRoute = asyncHandler(async (req, res) => {
    const { routeId } = req.params;
    const list = await userRouteService.getUsersByRouteService(routeId as string);
    res.json({ success: true, data: list });
});

export const getRoutesByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const list = await userRouteService.getRoutesByUserService(userId as string);
    res.json({ success: true, data: list });
});