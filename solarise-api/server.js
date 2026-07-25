import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import usersRoutes from "./routes/users.routes.js";
import areaBlocksRoutes from "./routes/areaBlocks.routes.js";
import consumersRoutes from "./routes/consumers.routes.js";


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

pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error(err);
    }
    console.log(res.rows);
});

app.listen(PORT, () => {
    console.log(`Server port ${PORT}`);
});