import { Router } from "express";
import {
    getAllAreaBlocks,
    getAreaBlockById,
    createAreaBlock,
    updateAreaBlock,
    deleteAreaBlock,
} from "../controllers/areaBlocks.controller.js";

const router = Router();

router.get("/", getAllAreaBlocks);      // GET /api/areaBlocks
router.get("/:id", getAreaBlockById);     // GET /api/areaBlocks/3
router.post("/", createAreaBlock);      // POST /api/areaBlocks
router.put("/:id", updateAreaBlock);      // PUT /api/areaBlocks/3
router.delete("/:id", deleteAreaBlock);      // DELETE /api/areaBlocks/3

export default router;
