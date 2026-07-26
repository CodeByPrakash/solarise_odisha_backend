import { Router } from "express";
import {
    getAllOpenActions,
    getActionsByProject,
    createAction,
    updateActionStatus,
    getOverdueActions,
} from "../controllers/actionRequired.controller.js";

const router = Router();

// Static paths BEFORE dynamic /:id
router.get("/overdue", getOverdueActions);                    // GET /api/actions/overdue
router.get("/project/:projectId", getActionsByProject);       // GET /api/actions/project/:projectId

// Core
router.get("/", getAllOpenActions);                            // GET /api/actions
router.post("/", createAction);                               // POST /api/actions
router.patch("/:id/status", updateActionStatus);              // PATCH /api/actions/:id/status

export default router;
