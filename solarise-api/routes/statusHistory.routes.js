import { Router } from "express";
import {
    getAllStatusHistory,
    getStatusHistoryByProject,
    createStatusHistory,
} from "../controllers/statusHistory.controller.js";

import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getAllStatusHistory);
router.get("/project/:projectId", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getStatusHistoryByProject);
router.post("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), createStatusHistory);

export default router;