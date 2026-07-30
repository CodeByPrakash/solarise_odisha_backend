import pool from "../config/db.js";

// Get all notifications
export const getAllNotifications = async (req, res) => {
    try {
        // Database query will go here
        const result = await pool.query(
            "SELECT * FROM notifications"
        );
        res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: result.rows
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
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY id DESC",
            [id]
        );
        res.status(200).json({
            success: true,
            message: "User notifications fetched successfully",
            user_id: id,
            notifications: result.rows
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

        // Database query will go here
        const result = await pool.query(
            "SELECT id FROM notifications WHERE id = $1",
            [id]
        );
        res.status(200).json({
            success: true,
            message: "Notification fetched successfully",
            notification_id: id
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

        const result = await pool.query(
            "INSERT INTO notifications (user_id, project_id, title, body) VALUES ($1, $2, $3, $4) RETURNING id",
            [user_id, project_id, title, body]
        );

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification_id: result.rows[0].id
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
