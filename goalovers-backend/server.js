
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  }
}));

const matches = [
  {
    id: "match-1",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    kickoff: "2026-11-01T15:00:00Z"
  },
  {
    id: "match-2",
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    kickoff: "2026-11-02T20:00:00Z"
  },
  {
    id: "match-3",
    homeTeam: "Liverpool",
    awayTeam: "Manchester City",
    kickoff: "2026-11-03T17:30:00Z"
  }
];

const predictions = [];

app.get("/", (req, res) => {
  res.json({
    name: "GOALOVERS API",
    mode: "demo",
    message: "API is running. No real-money services are enabled."
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, mode: "demo" });
});

app.get("/api/matches", (req, res) => {
  res.json({ matches });
});

app.get("/api/predictions", (req, res) => {
  res.json({ predictions });
});

app.post("/api/predictions", (req, res) => {
  const { matchId, homeScore, awayScore, nickname } = req.body || {};

  const match = matches.find(item => item.id === matchId);

  if (!match) {
    return res.status(400).json({ error: "Invalid match." });
  }

  if (
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0 ||
    homeScore > 20 ||
    awayScore > 20
  ) {
    return res.status(400).json({
      error: "Scores must be whole numbers from 0 to 20."
    });
  }

  const safeNickname = String(nickname || "Guest")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 24) || "Guest";

  const duplicate = predictions.some(
    prediction =>
      prediction.matchId === matchId &&
      prediction.nickname === safeNickname
  );

  if (duplicate) {
    return res.status(409).json({
      error: "This demo nickname already submitted for this match."
    });
  }

  const prediction = {
    id: String(Date.now()),
    matchId,
    nickname: safeNickname,
    homeScore,
    awayScore
  };

  predictions.push(prediction);

  res.status(201).json({
    message: "Demo prediction saved.",
    prediction
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`GOALOVERS demo API running on port ${PORT}`);
});
