import { Router } from "express";
import {
    getAllBankLoans,
    getBankLoanByConsumer,
    createBankLoan,
    updateBankLoan,
    deleteBankLoan,
} from "../controllers/bankLoans.controller.js";

const router = Router();

// Static path before dynamic /:id
router.get("/consumer/:consumerId", getBankLoanByConsumer);  // GET /api/bank-loans/consumer/:consumerId

// Core CRUD
router.get("/", getAllBankLoans);                             // GET /api/bank-loans
router.post("/", createBankLoan);                            // POST /api/bank-loans
router.put("/:id", updateBankLoan);                          // PUT /api/bank-loans/:id
router.delete("/:id", deleteBankLoan);                       // DELETE /api/bank-loans/:id

export default router;
