import React from "react";
import { ethers } from "ethers";

function WalletLogin() {
    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("⚠️ MetaMask nicht gefunden.");
            return;
        }

        try {
            // Wallet-Verbindung anfragen
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const walletAddress = await signer.getAddress();

            console.log("✅ Verbunden mit Wallet:", walletAddress);

            // Backend-Request, um Token mit Wallet-Adresse zu erstellen
            const response = await fetch("https://www.goldsilverstuff.com/_functions/createLoginToken", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress })
            });

            const data = await response.json();

            if (!data.token) {
                alert("❌ Token konnte nicht erstellt werden.");
                return;
            }

            // Weiterleitung mit Token in URL
            window.location.href = `https://www.goldsilverstuff.com/dashboard?accessToken=${data.token}`;
        } catch (error) {
            console.error("❌ Wallet-Verbindung fehlgeschlagen:", error);
            alert("Verbindung zur Wallet fehlgeschlagen.");
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

