import React, { useEffect } from "react";
import { ethers } from "ethers";

function WalletLogin() {
    useEffect(() => {
        // Stelle sicher, dass ein Token in der URL vorhanden ist
        const token = new URLSearchParams(window.location.search).get("accessToken");
        if (!token) {
            alert("⚠️ Kein Zugriffstoken gefunden.");
        }
    }, []);

    const connectWallet = async () => {
        const token = new URLSearchParams(window.location.search).get("accessToken");
        if (!token) {
            alert("⚠️ Zugriffstoken fehlt in der URL.");
            return;
        }

        if (!window.ethereum) {
            alert("⚠️ MetaMask nicht gefunden. Bitte installiere MetaMask.");
            return;
        }

        try {
            // Verbindung zur Wallet herstellen
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const walletAddress = await signer.getAddress();

            console.log("✅ Verbunden mit Wallet:", walletAddress);

            // Weiterleitung zur Wix-Dashboard-Seite mit Wallet-Adresse
            window.location.href = https://www.goldsilverstuff.com/dashboard?accessToken=${token}&wallet=${walletAddress};
        } catch (error) {
            console.error("❌ Wallet-Verbindung fehlgeschlagen:", error);
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

