import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import Web3Modal from 'web3modal';

function WalletLogin() {
    const [userAddress, setUserAddress] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // 1. Token-Validierung beim Laden der Seite
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("accessToken");

        if (!token) {
            alert("Kein Zugriffstoken gefunden! Bitte über die Hauptseite einloggen.");
            return;
        }

        // Wix-Backend-URL anpassen (z. B. deine Wix-Editor-URL)
        fetch(`https://editor.wix.com/html/editor/web/renderer/edit/0120c8e2-d111-4dd7-87bb-fe8b208ece0c?metaSiteId=59a1bc1a-6d78-4e7a-9036-5aa177254aa3/_functions/verifyToken?token=${token}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.valid) {
                    alert("Token ungültig oder abgelaufen!");
                } else {
                    setIsAuthorized(true); // Zugriff erlauben
                }
            })
            .catch((err) => {
                console.error("Token-Verifizierung fehlgeschlagen:", err);
                alert("Serverfehler – bitte später versuchen.");
            });

        // Auto-Logout nach 5 Minuten
        const timeout = setTimeout(() => {
            setUserAddress(null);
            alert("Automatisch ausgeloggt wegen Inaktivität.");
        }, 5 * 60 * 1000);

        return () => clearTimeout(timeout);
    }, []);

    // 2. Wallet verbinden (MetaMask, etc.)
    const connectWallet = async () => {
        try {
            const web3Modal = new Web3Modal();
            const instance = await web3Modal.connect();
            const provider = new BrowserProvider(instance);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            // Optional: Signiere eine Nachricht zur Sicherheit
            const signature = await signer.signMessage("Login auf GoldSilverStuff");
            console.log("Angemeldet mit Adresse:", address);

            setUserAddress(address);

            // Hier könntest du die Adresse an dein Wix-Backend senden
            // z. B. für User-Registrierung oder Session-Tracking
        } catch (err) {
            console.error("Wallet-Verbindung fehlgeschlagen:", err);
            alert("Fehler bei der Wallet-Verbindung!");
        }
    };

    // 3. UI-Rendering
    if (!isAuthorized) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <p>🔒 Zugriff verweigert. Bitte über die Hauptseite einloggen.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem", fontFamily: "Arial", maxWidth: "500px", margin: "0 auto" }}>
            <h2>Wallet Login</h2>
            {!userAddress ? (
                <button 
                    onClick={connectWallet}
                    style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
                >
                    Mit Wallet verbinden
                </button>
            ) : (
                <div>
                    <p>✅ Angemeldet als: <strong>{userAddress}</strong></p>
                    <p>Du kannst nun VIP-Zahlungen durchführen.</p>
                </div>
            )}
        </div>
    );
}

export default WalletLogin;