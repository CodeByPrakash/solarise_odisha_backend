import { Router } from "express";

import {
    getAllNotifications,
    getUserNotifications,
    getNotificationById,
    createNotification,
    markNotificationAsRead,
    deleteNotification,
} from "../controllers/notifications.controller.js";

const router = Router();

// GET /api/notifications
router.get("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getAllNotifications);

// GET /api/notifications/user/3
router.get("/user/:id", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getUserNotifications);

// GET /api/notifications/3
router.get("/:id", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getNotificationById);

// POST /api/notifications
router.post("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), createNotification);

// PATCH /api/notifications/3/read
router.patch("/:id/read", authenticateToken, authorizeRoles('admin', 'site_manager', 'doc_team', 'accounts'), markNotificationAsRead);

// DELETE /api/notifications/3
router.delete("/:id", authenticateToken, authorizeRoles('admin', 'doc_team'), deleteNotification);

export default router;