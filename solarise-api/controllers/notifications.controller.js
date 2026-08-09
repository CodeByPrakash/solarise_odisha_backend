import pool from "../config/db.js";

// Get all notifications (ordered by newest first)
export const getAllNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM notifications ORDER BY created_at DESC, id DESC"
        );
        res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: result.rows,
            notifications: result.rows
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get notifications for a particular user
export const getUserNotifications = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC, id DESC",
            [id]
        );
        res.status(200).json({
            success: true,
            message: "User notifications fetched successfully",
            user_id: id,
            notifications: result.rows,
            data: result.rows
        });
    } catch (error) {
        console.error("Error fetching user notifications:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get a single notification by ID
export const getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM notifications WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification fetched successfully",
            notification_id: id,
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Error fetching notification:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Create a notification
export const createNotification = async (req, res) => {
    try {
        const {
            user_id,
            project_id,
            title,
            body
        } = req.body;

        if (!user_id || !title) {
            return res.status(400).json({
                success: false,
                message: "user_id and title are required fields"
            });
        }

        const result = await pool.query(
            "INSERT INTO notifications (user_id, project_id, title, body) VALUES ($1, $2, $3, $4) RETURNING *",
            [user_id, project_id || null, title, body || null]
        );

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification_id: result.rows[0].id,
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            "UPDATE notifications SET is_read = TRUE WHERE id = $1",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification_id: id
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            "DELETE FROM notifications WHERE id = $1",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
            notification_id: id
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};