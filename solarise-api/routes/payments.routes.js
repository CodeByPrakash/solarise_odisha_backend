import { Router } from "express";
import {
    getPaymentsByProject,
    createPayment,
    updatePaymentStatus,
    getPendingPayments,
    getPaymentsSummary,
} from "../controllers/payments.controller.js";

const router = Router();

// Static paths BEFORE dynamic /:id
router.get("/pending", getPendingPayments);                     // GET /api/payments/pending
router.get("/summary", getPaymentsSummary);                     // GET /api/payments/summary
router.get("/project/:projectId", getPaymentsByProject);        // GET /api/payments/project/:projectId

// Core
router.post("/", createPayment);                                // POST /api/payments
router.patch("/:id/status", updatePaymentStatus);               // PATCH /api/payments/:id/status

export default router;
