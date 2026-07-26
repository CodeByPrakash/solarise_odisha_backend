import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import usersRoutes from "./routes/users.routes.js";
import areaBlocksRoutes from "./routes/areaBlocks.routes.js";
import consumersRoutes from "./routes/consumers.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import documentsRoutes from "./routes/documents.routes.js";
import bankLoansRoutes from "./routes/bankLoans.routes.js";
import actionRequiredRoutes from "./routes/actionRequired.routes.js";
import ownershipTransfersRoutes from "./routes/ownershipTransfers.routes.js";
import materialDeliveriesRoutes from "./routes/materialDeliveries.routes.js";
import installationProgressRoutes from "./routes/installationProgress.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
const app = express();
const PORT = process.env.PORT || 'your_port';

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/api/users", usersRoutes);
app.use("/api/areaBlocks", areaBlocksRoutes);
app.use('/api/consumers', consumersRoutes);
app.use('/api/projects', projectsRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/bank-loans", bankLoansRoutes);
app.use("/api/actions", actionRequiredRoutes);
app.use("/api/ownership-transfers", ownershipTransfersRoutes);
app.use("/api/material-deliveries", materialDeliveriesRoutes);
app.use("/api/installation", installationProgressRoutes);
app.use("/api/payments", paymentsRoutes);

pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error(err);
    }
    console.log(res.rows);
});

app.listen(PORT, () => {
    console.log(`Server port ${PORT}`);
});