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
            alert("Kein Zugriffstoken gefunden!");
            return;
        }

        fetch(`https://www.goldsilverstuff.com/_functions/verifyToken?token=${token}`)
            .then(res => res.json())
            .then(data => {
                if (!data.valid) throw new Error("Token ungültig");
                setIsAuthorized(true);
            })
            .catch(err => {
                console.error("Fehler:", err);
                window.location.href = "https://www.goldsilverstuff.com/error";
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
            
            // Weiterleitung zum Dashboard NACH erfolgreichem Login
            window.location.href = "https://www.goldsilverstuff.com/dashboard/";
        } catch (err) {
            console.error("Fehler bei Wallet-Verbindung:", err);
            alert("Login fehlgeschlagen!");
        }
    };

    // 3. UI-Rendering
    if (!isAuthorized) {
        return <div style={{ padding: "2rem" }}>🔒 Zugriff verweigert</div>;
    }

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>Wallet Login</h2>
            {!userAddress ? (
                <button 
                    onClick={connectWallet}
                    style={{ padding: "10px 20px", cursor: "pointer" }}
                >
                    Mit Wallet verbinden
                </button>
            ) : (
                <p>✅ Weiterleitung zum Dashboard...</p>
            )}
        </div>
    );
}

export default WalletLogin;