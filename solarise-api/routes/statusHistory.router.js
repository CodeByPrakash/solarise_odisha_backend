import { Router } from "express";
import {
    getAllStatusHistory,
    getStatusHistoryByProject,
    createStatusHistory,
} from "../controllers/statusHistory.controller.js";

const router = Router();

router.get("/", getAllStatusHistory);
router.get("/project/:projectId", getStatusHistoryByProject);
router.post("/", createStatusHistory);

export default router;
