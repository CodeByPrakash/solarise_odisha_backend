import { Router } from "express";
import { login, register, getProfile } from "../controllers/auth.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", login);          // POST /api/auth/login
router.post("/register", register);    // POST /api/auth/register
router.get("/me", authenticateToken, getProfile); // GET /api/auth/me

export default router;