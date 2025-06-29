// pages/api/verify.js
import { ethers } from "ethers";
import { serialize, parse } from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const { token, address, signature, nonce } = req.body;
  if (!token || !address || !signature || !nonce) {
    return res
      .status(400)
      .json({ success: false, error: "Missing parameters" });
  }

  // 1) Auslesen des Cookies "gs_nonce"
  const cookies = parse(req.headers.cookie || "");
  const stored = cookies.gs_nonce;
  if (!stored || stored !== nonce) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid or expired nonce" });
  }

  try {
    // 2) Verifizieren der signierten Nachricht "token:nonce"
    const message = `${token}:${nonce}`;
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      throw new Error("Address mismatch");
    }

    // 3) Einmalgebrauch: Cookie löschen
    res.setHeader(
      "Set-Cookie",
      serialize("gs_nonce", "", { maxAge: -1, path: "/" })
    );

    // 4) Alles gut
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Verify failed:", err);
    return res
      .status(400)
      .json({ success: false, error: "Invalid signature" });
  }
}
