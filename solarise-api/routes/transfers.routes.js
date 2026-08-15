import express from "express";
import {
    initiateTransfer,
    getPendingTransfers,
    acceptTransfer,
    rejectTransfer
} from "../controllers/transfers.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticateToken, initiateTransfer);
router.get("/pending", authenticateToken, getPendingTransfers);
router.post("/:id/accept", authenticateToken, acceptTransfer);
router.post("/:id/reject", authenticateToken, rejectTransfer);

export default router;
