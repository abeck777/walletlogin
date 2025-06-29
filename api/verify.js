// api/verify.js
import { ethers } from 'ethers';

export default async function handler(req, res) {
  const { token, address, signature } = req.body;
  if (!token || !address || !signature) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }

  // Message = Token
  const message = `Bitte bestätige: ${token}`;

  let recovered;
  try {
    recovered = ethers.utils.verifyMessage(message, signature);
  } catch (e) {
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }

  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return res.status(401).json({ success: false, error: 'Address mismatch' });
  }

  // alles gut
  return res.status(200).json({ success: true });
}
