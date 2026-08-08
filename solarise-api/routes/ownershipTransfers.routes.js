import { Router } from "express";
import {
    getTransferByActionId,
    createTransfer,
    updateTransfer,
} from "../controllers/ownershipTransfers.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Ownership Transfers
 *   description: Property ownership transfer management
 */

/**
 * @swagger
 * /api/ownership-transfers/{actionId}:
 *   get:
 *     summary: Get transfer by action ID
 *     tags: [Ownership Transfers]
 *     parameters:
 *       - in: path
 *         name: actionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transfer data
 */
router.get("/:actionId", authenticateToken, authorizeRoles("admin", "agent", "doc_team", "accounts"), getTransferByActionId);

/**
 * @swagger
 * /api/ownership-transfers:
 *   post:
 *     summary: Create a transfer record
 *     tags: [Ownership Transfers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action_id]
 *             properties:
 *               action_id:
 *                 type: integer
 *               transfer_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transfer created
 */
router.post("/", authenticateToken, authorizeRoles("admin", "agent", "doc_team"), createTransfer);

/**
 * @swagger
 * /api/ownership-transfers/{id}:
 *   put:
 *     summary: Update a transfer
 *     tags: [Ownership Transfers]
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
 *               transfer_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/:id", authenticateToken, authorizeRoles("admin", "doc_team"), updateTransfer);

export default router;
