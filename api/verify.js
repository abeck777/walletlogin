// pages/api/verify.js
import { ethers } from "ethers";

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

  // Next.js API-Routen parsen Cookies automatisch in req.cookies
  const stored = req.cookies.gs_nonce;
  if (stored !== nonce) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid or expired nonce" });
  }

  try {
    const message = `${token}:${nonce}`;
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      throw new Error("Address mismatch");
    }
    // Nonce nur einmal verwenden: Cookie löschen
    res.setHeader("Set-Cookie", serialize("gs_nonce", "", {
      maxAge: -1,
      path: "/",
    }));
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Verify failed:", err);
    return res
      .status(400)
      .json({ success: false, error: "Invalid signature" });
  }
}
