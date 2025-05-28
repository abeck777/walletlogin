import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import Web3Modal from 'web3modal';

function WalletLogin() {
  const [userAddress, setUserAddress] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const checkToken = async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("accessToken");

    if (!token) {
      alert("Kein Zugriffstoken gefunden!");
      return;
    }

    try {
      const res = await fetch(`https://www.deine-wix-domain.com/_functions/verifyToken?token=${token}`);
      const data = await res.json();
      if (!data.valid) {
        alert("Token ist abgelaufen oder ungültig.");
        return;
      }
      setIsAuthorized(true);
    } catch (err) {
      console.error("Token-Verifizierung fehlgeschlagen:", err);
    }
  };

  useEffect(() => {
    checkToken();

    // Auto-Logout nach 5 Min Inaktivität
    const timeout = setTimeout(() => {
      setUserAddress(null);
      alert("Automatisch ausgeloggt wegen Inaktivität.");
    }, 5 * 60 * 1000); // 5 Min

    return () => clearTimeout(timeout);
  }, []);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal();
      const instance = await web3Modal.connect();
      const provider = new BrowserProvider(instance);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const signature = await signer.signMessage("Login auf GoldSilverStuff");
      console.log("Adresse:", address);
      console.log("Signatur:", signature);
      setUserAddress(address);

      // Optional: hier später an dein Wix-Backend senden und prüfen ob registriert
      // fetch('/_functions/checkOrRegisterUser', { ... })

    } catch (err) {
      console.error("Wallet Verbindung fehlgeschlagen:", err);
    }
  };

  if (!isAuthorized) {
    return <p>Zugriff verweigert. Bitte über die Hauptseite einloggen.</p>;
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Wallet Login</h2>
      <button onClick={connectWallet}>Mit Wallet verbinden</button>
      {userAddress && (
        <p>Angemeldet als: <strong>{userAddress}</strong></p>
      )}
    </div>
  );
}

export default WalletLogin;
