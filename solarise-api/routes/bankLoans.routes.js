import { Router } from "express";
import {
    getAllBankLoans,
    getBankLoanByConsumer,
    createBankLoan,
    updateBankLoan,
    deleteBankLoan,
} from "../controllers/bankLoans.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Bank Loans
 *   description: Bank loan tracking for solar projects
 */

/**
 * @swagger
 * /api/bank-loans/consumer/{consumerId}:
 *   get:
 *     summary: Get bank loan by consumer ID
 *     tags: [Bank Loans]
 *     parameters:
 *       - in: path
 *         name: consumerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bank loan data
 */
router.get("/consumer/:consumerId", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getBankLoanByConsumer);

/**
 * @swagger
 * /api/bank-loans:
 *   get:
 *     summary: Get all bank loans
 *     tags: [Bank Loans]
 *     responses:
 *       200:
 *         description: List of bank loans
 */
router.get("/", authenticateToken, authorizeRoles('admin', 'doc_team', 'accounts'), getAllBankLoans);

/**
 * @swagger
 * /api/bank-loans:
 *   post:
 *     summary: Create a bank loan record
 *     tags: [Bank Loans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [consumer_id, bank_name, loan_amount]
 *             properties:
 *               consumer_id:
 *                 type: integer
 *               bank_name:
 *                 type: string
 *               loan_amount:
 *                 type: number
 *               loan_status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Loan created
 */
router.post("/", authenticateToken, authorizeRoles('admin', 'doc_team', 'accounts'), createBankLoan);

/**
 * @swagger
 * /api/bank-loans/{id}:
 *   put:
 *     summary: Update a bank loan
 *     tags: [Bank Loans]
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
 *               bank_name:
 *                 type: string
 *               loan_amount:
 *                 type: number
 *               loan_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/:id", authenticateToken, authorizeRoles('admin', 'doc_team', 'accounts'), updateBankLoan);

/**
 * @swagger
 * /api/bank-loans/{id}:
 *   delete:
 *     summary: Delete a bank loan
 *     tags: [Bank Loans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete("/:id", authenticateToken, authorizeRoles('admin', 'doc_team', 'accounts'), deleteBankLoan);

export default router;
