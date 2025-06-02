import React, { useEffect } from "react";
import { ethers } from "ethers";

function WalletLogin() {
    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("accessToken");
        if (!token) {
            alert("⚠️ Kein Zugriffstoken gefunden.");
        }
    }, []);

    const connectWallet = async () => {
        const accessToken = new URLSearchParams(window.location.search).get("accessToken");
        if (!accessToken) {
            alert("⚠️ Zugriffstoken fehlt in der URL.");
            return;
        }

        if (!window.ethereum) {
            alert("⚠️ MetaMask nicht gefunden.");
            return;
        }

        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const walletAddress = await signer.getAddress();

            console.log("✅ Verbunden mit Wallet:", walletAddress);

            // Token bei Wix erstellen und Wallet-Adresse mitsenden
            const response = await fetch("https://www.goldsilverstuff.com/_functions/createLoginToken", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress }) // Wallet-Adresse hier mitsenden
            });

            const data = await response.json();

            if (!data.token) {
                alert("❌ Token konnte nicht erstellt werden.");
                return;
            }

            // Weiterleitung zur Dashboard-Seite mit Token
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

