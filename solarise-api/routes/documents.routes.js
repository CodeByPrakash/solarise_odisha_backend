import { Router } from "express";
import {
    getDocumentsByConsumer,
    createDocument,
    verifyDocument,
    rejectDocument,
    reuploadDocument,
    getDocumentStatusSummary,
} from "../controllers/documents.controller.js";

const router = Router();

// Static paths first
router.get("/status-summary", getDocumentStatusSummary);       // GET /api/documents/status-summary
router.get("/consumer/:consumerId", getDocumentsByConsumer);   // GET /api/documents/consumer/:consumerId

// Core CRUD
router.post("/", createDocument);                              // POST /api/documents

// Actions on specific document
router.patch("/:id/verify", verifyDocument);                   // PATCH /api/documents/:id/verify
router.patch("/:id/reject", rejectDocument);                   // PATCH /api/documents/:id/reject
router.post("/:id/reupload", reuploadDocument);                // POST /api/documents/:id/reupload

export default router;
