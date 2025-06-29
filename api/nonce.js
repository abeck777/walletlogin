// api/nonce.js
import { randomBytes } from "crypto";

export default function handler(req, res) {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: "Missing token" });
  global.nonces = global.nonces || new Map();
  const nonce = randomBytes(16).toString("hex");
  global.nonces.set(token, nonce);
  res.json({ nonce });
}
