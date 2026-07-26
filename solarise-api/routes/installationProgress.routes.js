import { Router } from "express";
import {
    getChecklistByProject,
    initChecklist,
    completeItem,
    getProgress,
} from "../controllers/installationProgress.controller.js";

const router = Router();

// Project-scoped endpoints
router.get("/project/:projectId", getChecklistByProject);           // GET  /api/installation/project/:projectId
router.post("/project/:projectId/init", initChecklist);             // POST /api/installation/project/:projectId/init
router.get("/project/:projectId/progress", getProgress);            // GET  /api/installation/project/:projectId/progress

// Item-level action
router.patch("/:id/complete", completeItem);                        // PATCH /api/installation/:id/complete

export default router;
