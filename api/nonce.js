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

  // 1) Nonce erzeugen
  const nonce = randomBytes(8).toString("hex");

  // 2) Cookie setzen (httpOnly, secure, sameSite)
  res.setHeader("Set-Cookie", serialize("gs_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 300, // 5 Minuten
  }));

  // 3) auch im JSON zurückgeben (Client signiert daraus)
  return res.status(200).json({ nonce });
}
