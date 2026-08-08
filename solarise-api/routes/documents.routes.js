import { Router } from "express";
import {
    getAllDocuments,
    getDocumentById,
    getDocumentsByConsumer,
    createDocument,
    verifyDocument,
    rejectDocument,
    reuploadDocument,
    getDocumentStatusSummary,
} from "../controllers/documents.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document upload, verification & management
 */

/**
 * @swagger
 * /api/documents/status-summary:
 *   get:
 *     summary: Get document status summary
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Summary of document statuses
 */
router.get("/status-summary", authenticateToken, authorizeRoles('doc_team', 'admin', 'agent', 'site_manager', 'accounts'), getDocumentStatusSummary);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get("/", authenticateToken, authorizeRoles('agent', 'admin', 'doc_team', 'site_manager', 'accounts'), getAllDocuments);

/**
 * @swagger
 * /api/documents/consumer/{consumerId}:
 *   get:
 *     summary: Get documents by consumer ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: consumerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of documents for the consumer
 */
router.get("/consumer/:consumerId", authenticateToken, authorizeRoles('agent', 'admin', 'doc_team', 'site_manager', 'accounts'), getDocumentsByConsumer);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document details
 *       404:
 *         description: Document not found
 */
router.get("/:id", authenticateToken, authorizeRoles('agent', 'admin', 'doc_team', 'site_manager', 'accounts'), getDocumentById);

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [consumer_id, doc_type, file_url]
 *             properties:
 *               consumer_id:
 *                 type: integer
 *               doc_type:
 *                 type: string
 *               file_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document created
 */
router.post("/", authenticateToken, authorizeRoles('agent', 'doc_team', 'admin', 'site_manager'), createDocument);

/**
 * @swagger
 * /api/documents/{id}/verify:
 *   patch:
 *     summary: Verify a document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document verified
 */
router.patch("/:id/verify", authenticateToken, authorizeRoles('admin', 'doc_team'), verifyDocument);

/**
 * @swagger
 * /api/documents/{id}/reject:
 *   patch:
 *     summary: Reject a document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document rejected
 */
router.patch("/:id/reject", authenticateToken, authorizeRoles('admin', 'doc_team'), rejectDocument);

/**
 * @swagger
 * /api/documents/{id}/reupload:
 *   post:
 *     summary: Re-upload a rejected document
 *     tags: [Documents]
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
 *             properties:
 *               file_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document re-uploaded
 */
router.post("/:id/reupload", authenticateToken, authorizeRoles('agent', 'admin', 'doc_team', 'site_manager'), reuploadDocument);

export default router;
