import { Router } from "express";
import {
    getChecklistByProject,
    initChecklist,
    completeItem,
    getProgress,
    saveChecklistBatch,
} from "../controllers/installationProgress.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Installation Progress
 *   description: Installation checklist & progress tracking
 */

/**
 * @swagger
 * /api/installation/project/{projectId}:
 *   get:
 *     summary: Get checklist by project
 *     tags: [Installation Progress]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Installation checklist
 */
router.get("/project/:projectId", authenticateToken, authorizeRoles("admin", "agent", "site_manager"), getChecklistByProject);

/**
 * @swagger
 * /api/installation/project/{projectId}/init:
 *   post:
 *     summary: Initialize installation checklist
 *     tags: [Installation Progress]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Checklist initialized
 */
router.post("/project/:projectId/init", authenticateToken, authorizeRoles("admin", "site_manager"), initChecklist);

router.post("/project/:projectId/batch", authenticateToken, authorizeRoles("admin", "site_manager", "agent", "doc_team", "accounts"), saveChecklistBatch);

/**
 * @swagger
 * /api/installation/project/{projectId}/progress:
 *   get:
 *     summary: Get installation progress percentage
 *     tags: [Installation Progress]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Progress data
 */
router.get("/project/:projectId/progress", authenticateToken, authorizeRoles("admin", "agent", "site_manager"), getProgress);

/**
 * @swagger
 * /api/installation/{id}/complete:
 *   patch:
 *     summary: Mark checklist item complete
 *     tags: [Installation Progress]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item completed
 */
router.patch("/:id/complete", authenticateToken, authorizeRoles('site_manager', 'admin'), completeItem);

export default router;
