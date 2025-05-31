import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

function WalletLogin() {
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("accessToken");
        if (!token) return;

        fetch(`https://www.goldsilverstuff.com/_functions/verifyToken?token=${token}`)
            .then(res => res.json())
            .then(data => setIsAuthorized(data.valid));
    }, []);

    const connectWallet = async () => {
        const web3Modal = new Web3Modal();
        const instance = await web3Modal.connect();
        const provider = new ethers.BrowserProvider(instance);
        await provider.getSigner();
        window.location.href = "https://www.goldsilverstuff.com/dashboard/";
    };

    return !isAuthorized ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>🔒 Ungültiger Token</div>
    ) : (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <button onClick={connectWallet} style={{ padding: "10px 20px" }}>
                Mit Wallet verbinden
            </button>
        </div>
    );
}

export default WalletLogin;