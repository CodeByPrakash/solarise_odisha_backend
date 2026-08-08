import { Router } from "express";
import {
    getAllStatusHistory,
    getStatusHistoryByProject,
    createStatusHistory,
} from "../controllers/statusHistory.controller.js";

import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Status History
 *   description: Project status change history
 */

/**
 * @swagger
 * /api/status-history:
 *   get:
 *     summary: Get all status history entries
 *     tags: [Status History]
 *     responses:
 *       200:
 *         description: List of status history
 */
router.get("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getAllStatusHistory);

/**
 * @swagger
 * /api/status-history/project/{projectId}:
 *   get:
 *     summary: Get status history by project
 *     tags: [Status History]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status history for the project
 */
router.get("/project/:projectId", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getStatusHistoryByProject);

/**
 * @swagger
 * /api/status-history:
 *   post:
 *     summary: Create a status history entry
 *     tags: [Status History]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [project_id, old_status, new_status]
 *             properties:
 *               project_id:
 *                 type: integer
 *               old_status:
 *                 type: string
 *               new_status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Status history created
 */
router.post("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team'), createStatusHistory);

export default router;