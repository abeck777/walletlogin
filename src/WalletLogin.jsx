import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import Web3Modal from 'web3modal';

function WalletLogin() {
    const [userAddress, setUserAddress] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // 1. Token validieren
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("accessToken");
        
        if (!token) {
            alert("Kein Token – Zugriff verweigert!");
            return;
        }

        fetch(`https://www.goldsilverstuff.com/_functions/verifyToken?token=${token}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.valid) {
                    alert("Token ungültig oder abgelaufen!");
                } else {
                    setIsAuthorized(true);
                }
            });
    }, []);

    // 2. Wallet verbinden
    const connectWallet = async () => {
        try {
            const web3Modal = new Web3Modal();
            const instance = await web3Modal.connect();
            const provider = new BrowserProvider(instance);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setUserAddress(address);
            console.log("Erfolgreich verbunden mit:", address);
        } catch (err) {
            console.error("Fehler:", err);
            alert("Wallet-Verbindung fehlgeschlagen!");
        }
    };

    // 3. UI
    if (!isAuthorized) {
        return <div style={{ padding: "2rem" }}>🔒 Zugriff verweigert. Bitte über die Hauptseite einloggen.</div>;
    }

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>Wallet Login</h2>
            {!userAddress ? (
                <button onClick={connectWallet} style={{ padding: "10px 20px", fontSize: "16px" }}>
                    Mit Wallet verbinden
                </button>
            ) : (
                <p>✅ Angemeldet als: <strong>{userAddress}</strong></p>
            )}
        </div>
    );
}

export default WalletLogin;