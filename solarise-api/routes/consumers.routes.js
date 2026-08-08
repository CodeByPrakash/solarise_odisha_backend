import { Router } from "express";
import { getAllConsumers, getConsumerById, createConsumer, updateConsumer, deleteConsumer } from "../controllers/consumers.controller.js";
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
 *     summary: Get all consumers
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
 * /api/consumers/{id}:
 *   delete:
 *     summary: Delete a consumer
 *     tags: [Consumers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete("/:id", authenticateToken, authorizeRoles('admin'), deleteConsumer);

export default router;