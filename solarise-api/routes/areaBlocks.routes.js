import { Router } from "express";
import {
    getAllAreaBlocks,
    getAreaBlockById,
    createAreaBlock,
    updateAreaBlock,
    deleteAreaBlock,
} from "../controllers/areaBlocks.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
const router = Router();

router.get("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getAllAreaBlocks);      // GET /api/areaBlocks
router.get("/:id", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getAreaBlockById);     // GET /api/areaBlocks/3
router.post("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), createAreaBlock);      // POST /api/areaBlocks
router.put("/:id", authenticateToken, authorizeRoles('admin', 'agent', 'doc_team'), updateAreaBlock);      // PUT /api/areaBlocks/3
router.delete("/:id", authenticateToken, authorizeRoles('admin'), deleteAreaBlock);      // DELETE /api/areaBlocks/3

export default router;
