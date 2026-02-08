
import * as routeService from "../services/route.service.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createRouteValidator, updateRouteValidator } from "../validators/route.validators.js";

export const createRoute = asyncHandler(async (req, res) => {
  const route = await routeService.createRouteService(req.body);
  return res.status(201).json({ success: true, data: route });
});

export const getAllRoutes = asyncHandler(async (req, res) => {
  const routes = await routeService.getAllRoutesService();
  return res.json({ success: true, data: routes });
});

export const getRouteById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const route = await routeService.getRouteByIdService(id as string);
  return res.json({ success: true, data: route });
});

export const updateRoute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await routeService.updateRouteService(id as string, req.body);
  return res.json({ success: true, data: updated });
});

export const disableRoute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await routeService.disableRouteService(id as string);
  return res.json({ success: true, data: updated });
});