import { Router } from "express";
import {
    getDeliveryByProject,
    createDelivery,
    updateDelivery,
} from "../controllers/materialDeliveries.controller.js";

const router = Router();

// Static path before dynamic /:id
router.get("/project/:projectId", getDeliveryByProject);   // GET /api/material-deliveries/project/:projectId

// Core
router.post("/", createDelivery);                          // POST /api/material-deliveries
router.put("/:id", updateDelivery);                        // PUT /api/material-deliveries/:id

export default router;
