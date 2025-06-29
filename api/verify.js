// pages/api/verify.js
import { ethers } from "ethers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const { token, address, signature } = req.body;
  if (!token || !address || !signature) {
    return res.status(400).json({ success: false, error: "Missing parameters" });
  }

  try {
    // genau die Nachricht verifizieren, die der Client signiert hat:
    const recovered = ethers.verifyMessage(token, signature);

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    // alles okay
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Verify failed:", err);
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }
}
