// pages/api/nonce.js
import { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "crypto";

// In-Memory Store für Nonces (nur für Demo, bei Realbetrieb persistent speichern!)
export const nonces = new Map<string,string>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }
  const token = req.query.token as string;
  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }
  const nonce = randomBytes(8).toString("hex");
  nonces.set(token, nonce);
  return res.status(200).json({ nonce });
}
