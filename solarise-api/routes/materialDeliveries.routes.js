import { Router } from "express";
import {
    getDeliveryByProject,
    createDelivery,
    updateDelivery,
} from "../controllers/materialDeliveries.controller.js";
import { authorizeRoles, authenticateToken } from "../middleware/auth.middleware.js";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Material Deliveries
 *   description: Solar panel material delivery tracking
 */

/**
 * @swagger
 * /api/material-deliveries/project/{projectId}:
 *   get:
 *     summary: Get deliveries by project ID
 *     tags: [Material Deliveries]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Delivery data for project
 */
router.get("/project/:projectId", authenticateToken, authorizeRoles('admin', 'site_manager'), getDeliveryByProject);

/**
 * @swagger
 * /api/material-deliveries:
 *   post:
 *     summary: Create a delivery record
 *     tags: [Material Deliveries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [project_id, material_type]
 *             properties:
 *               project_id:
 *                 type: integer
 *               material_type:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               delivery_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Delivery created
 */
router.post("/", authenticateToken, authorizeRoles('admin', 'site_manager'), createDelivery);

/**
 * @swagger
 * /api/material-deliveries/{id}:
 *   put:
 *     summary: Update a delivery
 *     tags: [Material Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               material_type:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               delivery_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/:id", authenticateToken, authorizeRoles('admin', 'site_manager'), updateDelivery);

export default router;
