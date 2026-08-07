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
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

// Dashboard & Status filter endpoints (defined before /:id parameter)
router.get("/dashboard", authenticateToken, authorizeRoles('doc_team', 'accounts', 'admin'), getProjectsDashboard);         // GET /api/projects/dashboard
router.get("/status/:status", authenticateToken, authorizeRoles('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), getProjectsByStatus);     // GET /api/projects/status/:status

// Main CRUD endpoints
router.get("/", authenticateToken, authorizeRoles('admin', 'doc_team', 'site_manager', 'accounts', 'agent'), getAllProjects);                         // GET /api/projects
router.get("/:id", authenticateToken, authorizeRoles('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), getProjectById);                      // GET /api/projects/:id
router.post("/", authenticateToken, authorizeRoles('agent', 'admin'), createProject);                         // POST /api/projects
router.patch("/:id/status", authenticateToken, authorizeRoles('doc_team', 'site_manager', 'accounts', 'admin'), updateProjectStatus);        // PATCH /api/projects/:id/status
router.put("/:id", authenticateToken, authorizeRoles('doc_team', 'accounts', 'admin'), updateProject);                       // PUT /api/projects/:id
router.delete("/:id", authenticateToken, authorizeRoles('admin'), deleteProject);                   // DELETE /api/projects/:id

export default router;
