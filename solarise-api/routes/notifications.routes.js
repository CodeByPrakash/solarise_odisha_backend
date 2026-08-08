import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
import {
    getAllNotifications,
    getUserNotifications,
    getNotificationById,
    createNotification,
    markNotificationAsRead,
    deleteNotification,
} from "../controllers/notifications.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getAllNotifications);

/**
 * @swagger
 * /api/notifications/user/{id}:
 *   get:
 *     summary: Get notifications for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User notifications
 */
router.get("/user/:id", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getUserNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification data
 */
router.get("/:id", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getNotificationById);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, message]
 *             properties:
 *               user_id:
 *                 type: integer
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), createNotification);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.patch("/:id/read", authenticateToken, authorizeRoles('admin', 'site_manager', 'doc_team', 'accounts'), markNotificationAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
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
router.delete("/:id", authenticateToken, authorizeRoles('admin', 'doc_team'), deleteNotification);

export default router;