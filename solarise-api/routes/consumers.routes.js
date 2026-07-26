import { Router } from "express";
import { getAllConsumers } from "../controllers/consumers.controller.js";

const router = Router();

router.get("/", getAllConsumers);

export default router;