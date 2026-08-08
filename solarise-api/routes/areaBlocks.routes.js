import { Router } from "express";
import {
    getAllAreaBlocks,
    getAreaBlockById,
    createAreaBlock,
    updateAreaBlock,
    deleteAreaBlock,
} from "../controllers/areaBlocks.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Area Blocks
 *   description: Geographic area/block management
 */

/**
 * @swagger
 * /api/areaBlocks:
 *   get:
 *     summary: Get all area blocks
 *     tags: [Area Blocks]
 *     responses:
 *       200:
 *         description: List of all area blocks
 */
router.get("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getAllAreaBlocks);      // GET /api/areaBlocks

/**
 * @swagger
 * /api/areaBlocks/{id}:
 *   get:
 *     summary: Get area block by ID
 *     tags: [Area Blocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Area block data
 *       404:
 *         description: Area block not found
 */
router.get("/:id", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getAreaBlockById);     // GET /api/areaBlocks/3

/**
 * @swagger
 * /api/areaBlocks:
 *   post:
 *     summary: Create a new area block
 *     tags: [Area Blocks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [block_name, district, state]
 *             properties:
 *               block_name:
 *                 type: string
 *                 example: "Bhubaneswar Block A"
 *               district:
 *                 type: string
 *                 example: "Khurda"
 *               state:
 *                 type: string
 *                 example: "Odisha"
 *     responses:
 *       201:
 *         description: Area block created
 */
router.post("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), createAreaBlock);      // POST /api/areaBlocks

/**
 * @swagger
 * /api/areaBlocks/{id}:
 *   put:
 *     summary: Update an area block
 *     tags: [Area Blocks]
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
 *               block_name:
 *                 type: string
 *               district:
 *                 type: string
 *               state:
 *                 type: string
 *     responses:
 *       200:
 *         description: Area block updated
 *       404:
 *         description: Area block not found
 */
router.put("/:id", authenticateToken, authorizeRoles('admin', 'agent', 'doc_team'), updateAreaBlock);      // PUT /api/areaBlocks/3

/**
 * @swagger
 * /api/areaBlocks/{id}:
 *   delete:
 *     summary: Delete an area block
 *     tags: [Area Blocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Area block deleted
 *       404:
 *         description: Area block not found
 */
router.delete("/:id", authenticateToken, authorizeRoles('admin'), deleteAreaBlock);      // DELETE /api/areaBlocks/3

export default router;
