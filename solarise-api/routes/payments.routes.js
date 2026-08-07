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

// Static paths BEFORE dynamic /:id
router.get("/pending", authenticateToken, authorizeRoles('accounts', 'admin'), getPendingPayments);                     // GET /api/payments/pending
router.get("/summary", authenticateToken, authorizeRoles('accounts', 'admin'), getPaymentsSummary);                     // GET /api/payments/summary
router.get("/project/:projectId", authenticateToken, authorizeRoles('accounts', 'admin'), getPaymentsByProject);        // GET /api/payments/project/:projectId

// Core
router.post("/", authenticateToken, authorizeRoles('accounts', 'admin'), createPayment);                                // POST /api/payments
router.patch("/:id/status", authenticateToken, authorizeRoles('accounts', 'admin'), updatePaymentStatus);               // PATCH /api/payments/:id/status

export default router;
