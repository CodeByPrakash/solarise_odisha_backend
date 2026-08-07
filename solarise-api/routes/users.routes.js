import { Router } from "express";
import { authorizeRoles, authenticateToken } from '../middleware/auth.middleware.js';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
} from "../controllers/users.controller.js";

const router = Router();

router.get("/", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getAllUsers);
router.get("/:id", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getUserById);
router.get("/role/:role", authenticateToken, authorizeRoles('admin', 'agent', 'site_manager', 'doc_team', 'accounts'), getUsersByRole);
router.post("/", authenticateToken, authorizeRoles('admin'), createUser);
router.put("/:id", authenticateToken, authorizeRoles('admin'), updateUser);
router.delete("/:id", authenticateToken, authorizeRoles('admin'), deleteUser);

export default router;
