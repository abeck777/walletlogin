// React-Komponente: WalletLogin.jsx
import React, { useEffect } from "react";
import { ethers } from "ethers";

function WalletLogin() {
  useEffect(() => {
    // OPTIONALE Prüfung, falls du vorher einen accessToken von Wix mitgegeben hättest.
    // In diesem Flow brauchen wir aber keinen initialen Token, weil wir ihn
    // erst nach Wallet-Verbindung in Wix erzeugen.
    const urlParams = new URLSearchParams(window.location.search);
    const existingToken = urlParams.get("accessToken");
    if (existingToken) {
      console.log("ℹ️ Vorhandener accessToken in URL:", existingToken);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("⚠️ MetaMask nicht gefunden. Bitte installiere MetaMask.");
      return;
    }

    try {
      // 1) MetaMask-Request
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // 2) Wallet-Adresse abholen (Ether.js v5-Beispiel; bei v6: BrowserProvider)
      //    Wenn du Ethers v5 installiert hast, benutze providers.Web3Provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();

      console.log("✅ Verbunden mit Wallet:", walletAddress);

      // 3) HTTP-Request an Wix-Endpoint _functions/createLoginToken
      const response = await fetch(
        "https://www.goldsilverstuff.com/_functions/createLoginToken",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: walletAddress })
        }
      );

      if (!response.ok) {
        console.error("❌ Wix-Token-Endpoint antwortete mit Status", response.status);
        alert("⚠️ Im Backend-Request ging etwas schief.");
        return;
      }

      const data = await response.json(); // erwartet { token: "tkn_..." }
      const token = data.token;
      console.log("📦 Token von Wix erhalten:", token);

      // 4) Weiterleitung zur Wix Dashboard-Seite mit accessToken in Query
      window.location.href = `https://www.goldsilverstuff.com/dashboard?accessToken=${token}`;
    } catch (err) {
      console.error("❌ Wallet-Verbindung fehlgeschlagen:", err);
      alert("Verbindung zur Wallet fehlgeschlagen. Bitte versuche es erneut.");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <button
        onClick={connectWallet}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        🔐 Wallet verbinden
      </button>
    </div>
  );
}

export default WalletLogin;
