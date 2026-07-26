import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersByRole,
} from "../controllers/users.controller.js";

const router = Router();

router.get("/", getAllUsers);      // GET /api/users
router.get("/:id", getUserById);     // GET /api/users/3
router.get("/role/:role", getUsersByRole); // GET /api/users/role/agent
router.post("/", createUser);      // POST /api/users
router.put("/:id", updateUser);      // PUT /api/users/3
router.delete("/:id", deleteUser);      // DELETE /api/users/3

export default router;
