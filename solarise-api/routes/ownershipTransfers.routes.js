import { Router } from "express";
import {
    getTransferByActionId,
    createTransfer,
    updateTransfer,
} from "../controllers/ownershipTransfers.controller.js";

const router = Router();

router.get("/:actionId", getTransferByActionId);    // GET /api/ownership-transfers/:actionId
router.post("/", createTransfer);                   // POST /api/ownership-transfers
router.put("/:id", updateTransfer);                 // PUT /api/ownership-transfers/:id

export default router;
