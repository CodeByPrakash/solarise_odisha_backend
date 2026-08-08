import { Router } from "express";
import { login, register, getProfile } from "../controllers/auth.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

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
router.post("/login", login);          // POST /api/auth/login

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, email, phone, password]
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Prakash Kumar"
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
 *       409:
 *         description: Email or phone already exists
 */
router.post("/register", register);    // POST /api/auth/register

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
router.get("/me", authenticateToken, getProfile); // GET /api/auth/me

export default router;