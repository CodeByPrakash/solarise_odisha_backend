import { Router } from "express";
import {
  getAllConsumers,
  getConsumerById,
  createConsumer,
  updateConsumer,
  deleteConsumer,
  restoreConsumer,
  deactivateConsumer,
  activateConsumer
} from "../controllers/consumers.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Consumers
 *   description: Consumer management
 */

/**
 * @swagger
 * /api/consumers:
 *   get:
 *     summary: Get all consumers (regular roles receive active only, admins receive all)
 *     tags: [Consumers]
 *     responses:
 *       200:
 *         description: List of consumers
 */
router.get("/", authenticateToken, authorizeRoles('agent', 'admin', 'site_manager', 'doc_team', 'accounts'), getAllConsumers);

/**
 * @swagger
 * /api/consumers/{id}:
 *   get:
 *     summary: Get consumer by ID
 *     tags: [Consumers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Consumer data
 *       404:
 *         description: Not found
 */
router.get("/:id", authenticateToken, authorizeRoles('agent', 'admin', 'site_manager', 'doc_team', 'accounts'), getConsumerById);

/**
 * @swagger
 * /api/consumers:
 *   post:
 *     summary: Create a consumer
 *     tags: [Consumers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, phone, address, area_block_id]
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Full name (split into first_name + last_name in backend)
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               area_block_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/", authenticateToken, authorizeRoles('agent', 'admin', 'site_manager', 'doc_team', 'accounts'), createConsumer);

/**
 * @swagger
 * /api/consumers/{id}:
 *   put:
 *     summary: Update a consumer
 *     tags: [Consumers]
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
 *               full_name:
 *                 type: string
 *                 description: Full name (split into first_name + last_name in backend)
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/:id", authenticateToken, authorizeRoles('admin', 'agent', 'doc_team'), updateConsumer);

/**
 * @swagger
 * /api/consumers/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a consumer profile (sets is_active = FALSE)
 *     tags: [Consumers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deactivated
 */
router.patch("/:id/deactivate", authenticateToken, authorizeRoles('admin', 'doc_team'), deactivateConsumer);

/**
 * @swagger
 * /api/consumers/{id}/activate:
 *   patch:
 *     summary: Activate a deactivated consumer profile (sets is_active = TRUE)
 *     tags: [Consumers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Activated
 */
router.patch("/:id/activate", authenticateToken, authorizeRoles('admin', 'doc_team'), activateConsumer);

// Backwards compatibility routes
router.delete("/:id", authenticateToken, authorizeRoles('admin', 'doc_team'), deleteConsumer);
router.patch("/:id/restore", authenticateToken, authorizeRoles('admin', 'doc_team'), restoreConsumer);

export default router;