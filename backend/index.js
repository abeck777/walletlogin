// backend/index.js
import express from "express";
import cors from "cors";
import { randomBytes } from "crypto";
import { ethers } from "ethers";

const app = express();
app.use(cors({ origin: "http://localhost:3000" })); // React läuft standardmäßig auf 3000
app.use(express.json());

// Temporäres In-Memory-Store für Nonces
const nonces = new Map();

// 1) GET /api/nonce?token=…
app.get("/api/nonce", (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: "Missing token" });
  const nonce = randomBytes(16).toString("hex");
  nonces.set(token, nonce);
  res.json({ nonce });
});

// 2) POST /api/verify
app.post("/api/verify", (req, res) => {
  const { token, address, signature, nonce } = req.body;
  const expected = nonces.get(token);
  if (!expected || expected !== nonce) {
    return res.status(400).json({ success: false });
  }
  const message = `Bitte bestätige: ${nonce}`;
  let recovered;
  try {
    recovered = ethers.utils.verifyMessage(message, signature);
  } catch {
    return res.status(400).json({ success: false });
  }
  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return res.status(401).json({ success: false });
  }
  nonces.delete(token);
  res.json({ success: true });
});

app.listen(4000, () => console.log("Backend läuft auf http://localhost:4000"));
