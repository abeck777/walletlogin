// src/WalletLogin.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

export default function WalletLogin() {
  const [token, setToken] = useState(null);
  const [connector, setConnector] = useState("metamask");
  const [language, setLanguage] = useState("de");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    if (!accessToken) {
      alert("❌ Zugriffstoken fehlt in der URL.");
      return;
    }
    setToken(accessToken);
  }, []);

  const connectors = [
    { id: "metamask",      name: "MetaMask",        logo: "/logos/metamask.png" },
    { id: "walletconnect", name: "WalletConnect",   logo: "/logos/walletconnect.png" },
    { id: "coinbase",      name: "Coinbase Wallet", logo: "/logos/coinbase.png" }
  ];

  const languages = [
    { code: "de", label: "Deutsch" },
    { code: "en", label: "English" },
    { code: "fr", label: "Français" }
  ];

  const connectWallet = async () => {
    if (!token) {
      alert("❌ Zugriffstoken nicht geladen.");
      return;
    }

    let provider;
    try {
      if (connector === "metamask") {
        if (!window.ethereum) {
          alert("⚠️ Bitte installiere MetaMask.");
          return;
        }
        await window.ethereum.request({ method: "eth_requestAccounts" });
        provider = new ethers.BrowserProvider(window.ethereum);

      } else if (connector === "walletconnect") {
        const wc = await EthereumProvider.init({
          projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
          chains: [1],
          showQrModal: true
        });
        await wc.enable();
        provider = new ethers.BrowserProvider(wc);

      } else {
        const cbWallet = new CoinbaseWalletSDK({ appName: "MeinShop", darkMode: false });
        const cbProvider = cbWallet.makeWeb3Provider(
          process.env.NEXT_PUBLIC_INFURA_URL,
          1
        );
        await cbProvider.request({ method: "eth_requestAccounts" });
        provider = new ethers.BrowserProvider(cbProvider);
      }

      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      window.location.href = `https://www.goldsilverstuff.com/wallet-callback?token=${token}&wallet=${walletAddress}`;

    } catch (err) {
      console.error("❌ Wallet-Verbindung fehlgeschlagen", err);
      alert("❌ Verbindung zur Wallet fehlgeschlagen.");
    }
  };

  return (
    <div style={{ position: 'relative', maxWidth: '400px', margin: '2rem auto', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      {/* Sprach-Auswahl Dropdown */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '4px', fontSize: '12px' }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>

      <img src="/logos/company-logo.png" alt="Company Logo" style={{ maxWidth: '150px', marginBottom: '0.5rem' }} />
      <p style={{ marginBottom: '1.5rem', fontSize: '16px', fontWeight: 'bold', color: '#555' }}>
        GoldSilverStuff.com©
      </p>

      <h2 style={{ marginBottom: '1rem' }}>🔐 Wallet-Verbindung starten</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        {connectors.map(c => (
          <button
            key={c.id}
            onClick={() => setConnector(c.id)}
            style={{
              flex: 1,
              padding: '0.75rem',
              margin: '0 0.25rem',
              border: connector === c.id ? '2px solid #0070f3' : '1px solid #ccc',
              borderRadius: '8px',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img src={c.logo} alt={c.name} style={{ width: '24px', height: '24px', marginRight: '0.5rem' }} />
            {c.name}
          </button>
        ))}
      </div>

      <button
        onClick={connectWallet}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '18px',
          backgroundColor: '#222',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Mit {connectors.find(c => c.id === connector)?.name} verbinden
      </button>

      <p style={{ marginTop: '1.5rem', fontSize: '14px', color: '#555' }}>
        Noch keine Wallet? <a href="https://www.youtube-nocookie.com/watch?v=465676767787" target="_blank" rel="noopener noreferrer">Hier gibt's eine 2-Minuten-Anleitung</a>.
      </p>

      <button
        onClick={() => { window.location.href = '/wallet-login-page'; }}
        style={{
          marginTop: '2rem',
          padding: '8px 16px',
          fontSize: '14px',
          backgroundColor: '#eee',
          color: '#222',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        zurück zur Login-Seite
      </button>
    </div>
  );
}
