// pages/api/verify.js
import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { nonces } from "./nonce";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }
  const { token, address, signature, nonce } = req.body as {
    token?: string;
    address?: string;
    signature?: string;
    nonce?: string;
  };
  if (!token || !address || !signature || !nonce) {
    return res.status(400).json({ success: false, error: "Missing parameters" });
  }

  const stored = nonces.get(token);
  if (stored !== nonce) {
    return res.status(400).json({ success: false, error: "Invalid or expired nonce" });
  }

  try {
    // Verifizieren der Nachricht "token:nonce"
    const message = `${token}:${nonce}`;
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      throw new Error("Address mismatch");
    }
    nonces.delete(token); // einmaliger Gebrauch
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Verify failed:", err);
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }
}
