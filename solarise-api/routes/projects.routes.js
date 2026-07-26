import { Router } from "express";
import {
    getAllProjects,
    getProjectsDashboard,
    getProjectsByStatus,
    getProjectById,
    createProject,
    updateProjectStatus,
    updateProject,
    deleteProject,
} from "../controllers/projects.controller.js";

const router = Router();

// Dashboard & Status filter endpoints (defined before /:id parameter)
router.get("/dashboard", getProjectsDashboard);         // GET /api/projects/dashboard
router.get("/status/:status", getProjectsByStatus);     // GET /api/projects/status/:status

// Main CRUD endpoints
router.get("/", getAllProjects);                         // GET /api/projects
router.get("/:id", getProjectById);                      // GET /api/projects/:id
router.post("/", createProject);                         // POST /api/projects
router.patch("/:id/status", updateProjectStatus);        // PATCH /api/projects/:id/status
router.put("/:id", updateProject);                       // PUT /api/projects/:id
router.delete("/:id", deleteProject);                   // DELETE /api/projects/:id

export default router;
