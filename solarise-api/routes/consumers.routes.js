import { Router } from "express";
import { getAllConsumers, getConsumerById, createConsumer, updateConsumer, deleteConsumer } from "../controllers/consumers.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";
const router = Router();

router.get("/", authenticateToken, authorizeRoles('agent', 'admin', 'site_manager', 'doc_team', 'accounts'), getAllConsumers);
router.get("/:id", authenticateToken, authorizeRoles('agent', 'admin', 'site_manager', 'doc_team', 'accounts'), getConsumerById);
router.post("/", authenticateToken, authorizeRoles('agent', 'admin', 'site_manager', 'doc_team', 'accounts'), createConsumer);
router.put("/:id", authenticateToken, authorizeRoles('admin', 'agent', 'doc_team'), updateConsumer);
router.delete("/:id", authenticateToken, authorizeRoles('admin'), deleteConsumer);

export default router;