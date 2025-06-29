// pages/api/verify.js
import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { token, address, signature } = req.body as {
    token?: string;
    address?: string;
    signature?: string;
  };
  if (!token || !address || !signature) {
    return res.status(400).json({ success: false, error: "Missing parameters" });
  }

  try {
    // hier verifizieren wir exakt das, was der Client signiert hat:
    const recovered = ethers.verifyMessage(token, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      throw new Error("Address mismatch");
    }

    // alles gut
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Verify failed:", err);
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }
}
