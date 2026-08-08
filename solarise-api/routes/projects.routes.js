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

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Solar project pipeline management
 */

/**
 * @swagger
 * /api/projects/dashboard:
 *   get:
 *     summary: Get projects dashboard data
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Dashboard aggregation data
 */
router.get("/dashboard", authenticateToken, authorizeRoles('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), getProjectsDashboard);         // GET /api/projects/dashboard

/**
 * @swagger
 * /api/projects/status/{status}:
 *   get:
 *     summary: Get projects filtered by status
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [new_lead, site_visit_done, docs_submitted, docs_verified, loan_applied, loan_approved, material_dispatched, installation_wip, installation_done, meter_installed, project_complete, on_hold, cancelled]
 *         description: Project pipeline status
 *     responses:
 *       200:
 *         description: List of projects with the given status
 */
router.get("/status/:status", authenticateToken, authorizeRoles('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), getProjectsByStatus);     // GET /api/projects/status/:status

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of all projects
 */
router.get("/", authenticateToken, authorizeRoles('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), getAllProjects);                         // GET /api/projects

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project data
 *       404:
 *         description: Project not found
 */
router.get("/:id", authenticateToken, authorizeRoles('agent', 'site_manager', 'doc_team', 'accounts', 'admin'), getProjectById);                      // GET /api/projects/:id

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [consumer_id, assigned_agent_id]
 *             properties:
 *               consumer_id:
 *                 type: integer
 *                 example: 1
 *               assigned_agent_id:
 *                 type: integer
 *                 example: 2
 *               site_manager_id:
 *                 type: integer
 *                 example: 3
 *               system_capacity_kw:
 *                 type: number
 *                 example: 5.5
 *               estimated_cost:
 *                 type: number
 *                 example: 350000
 *               subsidy_amount:
 *                 type: number
 *                 example: 78000
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 *       400:
 *         description: Missing required fields
 */
router.post("/", authenticateToken, authorizeRoles('admin', 'doc_team'), createProject);                         // POST /api/projects

/**
 * @swagger
 * /api/projects/{id}/status:
 *   patch:
 *     summary: Update project status
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [new_status]
 *             properties:
 *               new_status:
 *                 type: string
 *                 enum: [new_lead, site_visit_done, docs_submitted, docs_verified, loan_applied, loan_approved, material_dispatched, installation_wip, installation_done, meter_installed, project_complete, on_hold, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Project not found
 */
router.patch("/:id/status", authenticateToken, authorizeRoles('doc_team', 'site_manager', 'admin'), updateProjectStatus);        // PATCH /api/projects/:id/status

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               consumer_id:
 *                 type: integer
 *               assigned_agent_id:
 *                 type: integer
 *               site_manager_id:
 *                 type: integer
 *               system_capacity_kw:
 *                 type: number
 *               estimated_cost:
 *                 type: number
 *               subsidy_amount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated
 *       404:
 *         description: Project not found
 */
router.put("/:id", authenticateToken, authorizeRoles('doc_team', 'site_manager', 'admin'), updateProject);                       // PUT /api/projects/:id

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project deleted
 *       404:
 *         description: Project not found
 */
router.delete("/:id", authenticateToken, authorizeRoles('admin', 'doc_team'), deleteProject);                   // DELETE /api/projects/:id

export default router;
