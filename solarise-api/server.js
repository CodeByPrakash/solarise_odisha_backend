import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import usersRoutes from "./routes/users.routes.js";
import areaBlocksRoutes from "./routes/areaBlocks.routes.js";
import consumersRoutes from "./routes/consumers.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";
import statusHistoryRoutes from "./routes/statusHistory.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/api/users", usersRoutes);
app.use("/api/areaBlocks", areaBlocksRoutes);
app.use('/api/consumers', consumersRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/status-history', statusHistoryRoutes);

pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.error("Database health check failed:", err.message);
        return;
    }

    if (result?.rows?.[0]) {
        console.log("Database connected:", result.rows[0]);
    }
});

app.listen(PORT, () => {
    console.log(`Server port ${PORT}`);
});