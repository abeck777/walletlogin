import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

function WalletLogin() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Token aus der URL lesen
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");

    if (!accessToken) {
      alert("❌ Zugriffstoken fehlt in der URL.");
      return;
    }

    setToken(accessToken);
  }, []);

  const connectWallet = async () => {
    if (!token) {
      alert("❌ Zugriffstoken nicht geladen.");
      return;
    }

    if (!window.ethereum) {
      alert("⚠️ Bitte installiere MetaMask.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      console.log("✅ Verbunden mit Wallet:", walletAddress);

      // Weiterleitung zurück zu Wix mit Token und Wallet-Adresse
      const redirectUrl = `https://www.goldsilverstuff.com/wallet-redirect?token=${token}&wallet=${walletAddress}`;
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("❌ Wallet-Verbindung fehlgeschlagen:", error);
      alert("❌ Verbindung zur Wallet fehlgeschlagen.");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>🔐 Wallet-Verbindung starten</h2>
      <button
        onClick={connectWallet}
        style={{
          padding: "12px 24px",
          fontSize: "18px",
          backgroundColor: "#222",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Wallet verbinden mit MetaMask
      </button>
    </div>
  );
}

export default WalletLogin;

