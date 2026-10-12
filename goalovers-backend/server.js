
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;

// Set FRONTEND_ORIGIN in deployment, for example:
// https://your-goalovers-site.netlify.app
const allowedOrigin = process.env.FRONTEND_ORIGIN;

app.use(helmet());
app.use(express.json({ limit: "10kb" }));

app.use(cors({
  origin: allowedOrigin
    ? allowedOrigin.split(",").map(origin => origin.trim())
    : false
}));

const matches = [
  {
    id: "M101",
    league: "Premier League • Demo",
    home: "London FC",
    away: "Manchester Blue",
    kickoff: "Demo fixture"
  },
  {
    id: "M102",
    league: "La Liga • Demo",
    home: "Madrid Stars",
    away: "Catalonia FC",
    kickoff: "Demo fixture"
  },
  {
    id: "M103",
    league: "Champions Cup • Demo",
    home: "Munich Red",
    away: "Paris City",
    kickoff: "Demo fixture"
  }
];

// Temporary memory only. Data disappears when the server restarts.
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
  // Demo endpoint: only suitable for testing.
  res.json({ predictions });
});

app.post("/api/predictions", (req, res) => {
  const { matchId, homeScore, awayScore, nickname } = req.body || {};

  if (
    typeof matchId !== "string" ||
    !matches.some(match => match.id === matchId)
  ) {
    return res.status(400).json({ error: "Invalid demo match." });
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
      error: "Scores must be whole numbers between 0 and 20."
    });
  }

  const safeNickname =
    typeof nickname === "string"
      ? nickname.trim().replace(/[<>]/g, "").slice(0, 24)
      : "Demo Player";

  // This API intentionally has no real user authentication.
  // It is for prototype testing only.
  const duplicate = predictions.some(
    item => item.matchId === matchId &&
            item.nickname === safeNickname
  );

  if (duplicate) {
    return res.status(409).json({
      error: "This demo player already submitted for this match."
    });
  }

  const match = matches.find(item => item.id === matchId);

  const submittedAtMs = Date.now();

const prediction = {
  id: `DEMO-${submittedAtMs}-${Math.random().toString(36).slice(2, 8)}`,
  matchId,
  match: `${match.home} vs ${match.away}`,
  nickname: safeNickname || "Demo Player",
  homeScore,
  awayScore,
  createdAt: new Date(submittedAtMs).toISOString(),
  submittedAtMs
};

  predictions.push(prediction);

  res.status(201).json({
    message: "Demo prediction saved.",
    prediction
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`GOALOVERS demo API running on port ${PORT}`);
});
