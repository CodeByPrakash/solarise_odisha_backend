import { Router } from "express";
import { getAllConsumers, getConsumerById, createConsumer, updateConsumer, deleteConsumer } from "../controllers/consumers.controller.js";

const router = Router();

router.get("/", getAllConsumers);
router.get("/:id", getConsumerById);
router.post("/", createConsumer);
router.put("/:id", updateConsumer);
router.delete("/:id", deleteConsumer);

export default router;