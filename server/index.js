require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET /api/scores - Get leaderboard
app.get("/api/scores", async (req, res) => {
  try {
    const { world_id, map_id, is_infinite, limit = 20 } = req.query;

    let query = `
            SELECT id, username, world_id, map_id, is_infinite, wave, kills, score, created_at
            FROM scores
        `;
    const conditions = [];
    const params = [];

    if (world_id !== undefined) {
      params.push(parseInt(world_id));
      conditions.push(`world_id = $${params.length}`);
    }

    if (map_id !== undefined) {
      params.push(parseInt(map_id));
      conditions.push(`map_id = $${params.length}`);
    }

    if (is_infinite !== undefined) {
      params.push(is_infinite === "true");
      conditions.push(`is_infinite = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    params.push(parseInt(limit));
    query += ` ORDER BY score DESC LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// GET /api/scores/user/:username - Get user's scores
app.get("/api/scores/user/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `SELECT id, username, world_id, map_id, is_infinite, wave, kills, score, created_at
             FROM scores
             WHERE username = $1
             ORDER BY score DESC
             LIMIT 50`,
      [username],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching user scores:", error);
    res.status(500).json({ error: "Failed to fetch user scores" });
  }
});

// POST /api/scores - Submit a new score
app.post("/api/scores", async (req, res) => {
  try {
    const { username, world_id, map_id, is_infinite, wave, kills, score } =
      req.body;

    // Validation
    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      return res.status(400).json({ error: "Invalid username" });
    }
    if (username.length > 32) {
      return res.status(400).json({ error: "Username too long" });
    }
    if (typeof world_id !== "number" || world_id < 1) {
      return res.status(400).json({ error: "Invalid world_id" });
    }
    if (typeof map_id !== "number" || map_id < 1) {
      return res.status(400).json({ error: "Invalid map_id" });
    }
    if (typeof is_infinite !== "boolean") {
      return res.status(400).json({ error: "Invalid is_infinite" });
    }
    if (typeof wave !== "number" || wave < 1) {
      return res.status(400).json({ error: "Invalid wave" });
    }
    if (typeof kills !== "number" || kills < 0) {
      return res.status(400).json({ error: "Invalid kills" });
    }
    if (typeof score !== "number" || score < 0) {
      return res.status(400).json({ error: "Invalid score" });
    }

    const result = await pool.query(
      `INSERT INTO scores (username, world_id, map_id, is_infinite, wave, kills, score)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, username, world_id, map_id, is_infinite, wave, kills, score, created_at`,
      [username.trim(), world_id, map_id, is_infinite, wave, kills, score],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error submitting score:", error);
    res.status(500).json({ error: "Failed to submit score" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🏆 Leaderboard server running on port ${PORT}`);
});
