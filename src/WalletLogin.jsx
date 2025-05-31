import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

function WalletLogin() {
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Token validieren
    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("accessToken");
        if (!token) return;
        
        fetch(`https://www.goldsilverstuff.com/_functions/verifyToken?token=${token}`)
            .then(res => res.json())
            .then(data => setIsAuthorized(data.valid));
    }, []);

    // Wallet verbinden
    const connectWallet = async () => {
        try {
            const web3Modal = new Web3Modal();
            const instance = await web3Modal.connect();
            const provider = new ethers.BrowserProvider(instance);
            await provider.getSigner();
            
            // Weiterleitung zum Dashboard
            window.location.href = "https://www.goldsilverstuff.com/dashboard/";
        } catch (err) {
            console.error("Wallet-Fehler:", err);
        }
    };

    return !isAuthorized ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            🔒 Ungültiger Zugriffstoken
        </div>
    ) : (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <button 
                onClick={connectWallet}
                style={{ padding: "10px 20px", fontSize: "16px" }}
            >
                Mit Wallet verbinden
            </button>
        </div>
    );
}

export default WalletLogin;