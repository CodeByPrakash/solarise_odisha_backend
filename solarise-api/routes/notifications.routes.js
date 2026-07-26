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
router.get("/", getAllNotifications);

// GET /api/notifications/user/3
router.get("/user/:id", getUserNotifications);

// GET /api/notifications/3
router.get("/:id", getNotificationById);

// POST /api/notifications
router.post("/", createNotification);

// PATCH /api/notifications/3/read
router.patch("/:id/read", markNotificationAsRead);

// DELETE /api/notifications/3
router.delete("/:id", deleteNotification);

export default router;