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
router.get("/dashboard", getProjectsDashboard);         // GET /api/projects/dashboard
router.get("/status/:status", getProjectsByStatus);     // GET /api/projects/status/:status

// Main CRUD endpoints
// require auth for project operations
router.use(authenticateToken);

router.get("/", getAllProjects);                         // GET /api/projects (authenticated)
router.get("/:id", getProjectById);                      // GET /api/projects/:id (authenticated)
router.post("/", authorizeRoles("admin","agent"), createProject);                         // POST /api/projects
router.patch("/:id/status", authorizeRoles("admin","agent"), updateProjectStatus);        // PATCH /api/projects/:id/status
router.put("/:id", authorizeRoles("admin","agent"), updateProject);                       // PUT /api/projects/:id
router.delete("/:id", authorizeRoles("admin","agent"), deleteProject);                   // DELETE /api/projects/:id

export default router;
