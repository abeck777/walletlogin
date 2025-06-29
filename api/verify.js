// api/verify.js
import { ethers } from "ethers";

export default async function handler(req, res) {
  const { token, address, signature, nonce } = req.body;
  global.nonces = global.nonces || new Map();
  const expected = global.nonces.get(token);
  if (!expected || expected !== nonce) return res.status(400).json({ success: false });
  const message = `Bitte bestätige: ${nonce}`;
  let recovered;
  try { recovered = ethers.utils.verifyMessage(message, signature); }
  catch { return res.status(400).json({ success: false }); }
  if (recovered.toLowerCase() !== address.toLowerCase()) return res.status(401).json({ success: false });
  global.nonces.delete(token);
  res.json({ success: true });
}
