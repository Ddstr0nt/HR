require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { db } = require("./src/config/db");
const authRoutes = require("./src/routes/auth");
const workersRoutes = require("./src/routes/workers");
const listRoutes = require("./src/routes/list");
const positionsRoutes = require("./src/routes/positions");
const professionsRoutes = require("./src/routes/professions");
const educationRoutes = require("./src/routes/education");
const gendersRoutes = require("./src/routes/genders");
const actionsRoutes = require("./src/routes/actions");
const statsRoutes = require("./src/routes/stats");

const app = express();
const PORT = process.env.PORT || 3000;

// Base middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Health check and DB connectivity probe
app.get("/health", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) return res.status(500).json({ status: "unhealthy" });
    res.json({ status: "ok" });
  });
});

// Mount routes
app.use("/", authRoutes); // /login, /register, /protected etc
app.use("/", workersRoutes); // /workers CRUD + joined fetch
app.use("/", listRoutes); // /list CRUD
app.use("/api", positionsRoutes); // /api/positions CRUD
app.use("/api", professionsRoutes); // /api/professions CRUD
app.use("/api", educationRoutes); // /api/education CRUD
app.use("/api", gendersRoutes); // /api/genders
app.use("/api", actionsRoutes); // /api/actions
app.use("/", statsRoutes); // /workers/count, /history/count, /api/*/count

// Fallback to home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
