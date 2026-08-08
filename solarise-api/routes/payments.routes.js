import { Router } from "express";
import {
    getPaymentsByProject,
    createPayment,
    updatePaymentStatus,
    getPendingPayments,
    getPaymentsSummary,
} from "../controllers/payments.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment tracking & management
 */

/**
 * @swagger
 * /api/payments/pending:
 *   get:
 *     summary: Get pending payments
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of pending payments
 */
router.get("/pending", authenticateToken, authorizeRoles('accounts', 'admin'), getPendingPayments);

/**
 * @swagger
 * /api/payments/summary:
 *   get:
 *     summary: Get payments summary
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Payments summary data
 */
router.get("/summary", authenticateToken, authorizeRoles('accounts', 'admin'), getPaymentsSummary);

/**
 * @swagger
 * /api/payments/project/{projectId}:
 *   get:
 *     summary: Get payments by project ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment records for project
 */
router.get("/project/:projectId", authenticateToken, authorizeRoles('accounts', 'admin'), getPaymentsByProject);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a payment record
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [project_id, amount, payment_type]
 *             properties:
 *               project_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *               payment_type:
 *                 type: string
 *               payment_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created
 */
router.post("/", authenticateToken, authorizeRoles('accounts', 'admin'), createPayment);

/**
 * @swagger
 * /api/payments/{id}/status:
 *   patch:
 *     summary: Update payment status
 *     tags: [Payments]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/status", authenticateToken, authorizeRoles('accounts', 'admin'), updatePaymentStatus);

export default router;
