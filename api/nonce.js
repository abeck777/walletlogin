// pages/api/nonce.js
import { randomBytes } from "crypto";

// In-Memory Store für Nonces (nur Demo; in Produktion bitte persistent speichern!)
export const nonces = new Map();

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end("Method Not Allowed");
  }
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }
  const nonce = randomBytes(8).toString("hex");
  nonces.set(token, nonce);
  return res.status(200).json({ nonce });
}
