// pages/api/nonce.js
import { randomBytes } from "crypto";
import { serialize } from "cookie";

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

  // HTTP-only Cookie setzen
  res.setHeader("Set-Cookie", serialize("gs_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 300, // 5 Minuten
  }));

  return res.status(200).json({ nonce });
}
