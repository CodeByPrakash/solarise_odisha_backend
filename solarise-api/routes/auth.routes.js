import { Router } from "express";
import { login, register, getProfile } from "../controllers/auth.controller.js";
import { authenticateToken, optionalAuthenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & registration
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with credentials
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: "chinu123"
 *     responses:
 *       200:
 *         description: Login successful — returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (Authenticated & Role Restricted)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, phone, password]
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Prakash"
 *               last_name:
 *                 type: string
 *                 example: "Kumar"
 *               email:
 *                 type: string
 *                 example: "prakash@example.com"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: "securePass123"
 *               role:
 *                 type: string
 *                 enum: [admin, agent, site_manager, doc_team, accounts]
 *                 example: "agent"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Role creation not authorized
 *       409:
 *         description: Email or phone already exists
 */
router.post("/register", optionalAuthenticateToken, register);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user profile data
 *       401:
 *         description: Token missing or invalid
 */
router.get("/me", authenticateToken, getProfile);

export default router;