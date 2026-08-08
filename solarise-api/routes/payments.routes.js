import { Router } from "express";
import {
    getAllPayments,
    getPaymentById,
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
router.get("/pending", authenticateToken, authorizeRoles('accounts', 'admin', 'site_manager', 'agent'), getPendingPayments);

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
router.get("/summary", authenticateToken, authorizeRoles('accounts', 'admin', 'site_manager', 'agent', 'doc_team'), getPaymentsSummary);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payment records
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of payment records
 */
router.get("/", authenticateToken, authorizeRoles('accounts', 'admin', 'site_manager', 'agent', 'doc_team'), getAllPayments);

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
router.get("/project/:projectId", authenticateToken, authorizeRoles('accounts', 'admin', 'site_manager', 'agent', 'doc_team'), getPaymentsByProject);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment record by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment record details
 *       404:
 *         description: Payment record not found
 */
router.get("/:id", authenticateToken, authorizeRoles('accounts', 'admin', 'site_manager', 'agent', 'doc_team'), getPaymentById);

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
 *                 enum: [processing_fee, security_deposit, consumer_payment, loan_disbursal, subsidy_cfa, subsidy_sfa]
 *               reference_no:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created
 */
router.post("/", authenticateToken, authorizeRoles('accounts', 'admin', 'site_manager', 'agent', 'doc_team'), createPayment);

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
