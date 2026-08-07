import { Router } from "express";
import {
    getAllOpenActions,
    getActionsByProject,
    createAction,
    updateActionStatus,
    getOverdueActions,
} from "../controllers/actionRequired.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
const router = Router();

// Static paths BEFORE dynamic /:id
router.get("/overdue", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getOverdueActions);                    // GET /api/actions/overdue
router.get("/project/:projectId", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getActionsByProject);       // GET /api/actions/project/:projectId

// Core
router.get("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getAllOpenActions);                            // GET /api/actions
router.post("/", authenticateToken, authorizeRoles('admin', 'site_manager', 'doc_team', 'accounts'), createAction);                               // POST /api/actions
router.patch("/:id/status", authenticateToken, authorizeRoles('admin', 'doc_team', 'site_manager'), updateActionStatus);              // PATCH /api/actions/:id/status

export default router;
