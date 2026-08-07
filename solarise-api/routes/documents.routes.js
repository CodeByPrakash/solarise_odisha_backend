import { Router } from "express";
import {
    getDocumentsByConsumer,
    createDocument,
    verifyDocument,
    rejectDocument,
    reuploadDocument,
    getDocumentStatusSummary,
} from "../controllers/documents.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

// Static paths first
router.get("/status-summary", authenticateToken, authorizeRoles('doc_team', 'admin'), getDocumentStatusSummary);       // GET /api/documents/status-summary
router.get("/consumer/:consumerId", authenticateToken, authorizeRoles('agent', 'admin', 'doc_team', 'site_manager'), getDocumentsByConsumer);   // GET /api/documents/consumer/:consumerId

// Core CRUD
router.post("/", authenticateToken, authorizeRoles('agent', 'admin'), createDocument);                              // POST /api/documents

// Actions on specific document
router.patch("/:id/verify", authenticateToken, authorizeRoles('admin', 'doc_team'), verifyDocument);                   // PATCH /api/documents/:id/verify
router.patch("/:id/reject", authenticateToken, authorizeRoles('admin', 'doc_team'), rejectDocument);                   // PATCH /api/documents/:id/reject
router.post("/:id/reupload", authenticateToken, authorizeRoles('agent', 'admin', 'doc_team'), reuploadDocument);                // POST /api/documents/:id/reupload

export default router;
