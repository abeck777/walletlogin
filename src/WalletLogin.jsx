// src/WalletLogin.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

export default function WalletLogin() {
  const [token, setToken] = useState(null);
  const [connector, setConnector] = useState("metamask");

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
    { id: "metamask", name: "MetaMask", logo: "/logos/metamask.png" },
    { id: "walletconnect", name: "WalletConnect", logo: "/logos/walletconnect.png" },
    { id: "coinbase", name: "Coinbase Wallet", logo: "/logos/coinbase.png" }
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
        const wcProvider = await EthereumProvider.init({
          projectId: "DEIN_WC_V2_PROJECT_ID",
          chains: [1],
          showQrModal: true
        });
        await wcProvider.enable();
        provider = new ethers.BrowserProvider(wcProvider);

      } else if (connector === "coinbase") {
        const cbWallet = new CoinbaseWalletSDK({ appName: "MeinShop", darkMode: false });
        const cbProvider = cbWallet.makeWeb3Provider(
          "https://mainnet.infura.io/v3/DEINE_INFURA_ID",
          1
        );
        await cbProvider.request({ method: "eth_requestAccounts" });
        provider = new ethers.BrowserProvider(cbProvider);
      }

      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      console.log(`✅ Verbunden mit Wallet: ${walletAddress}`);

      window.location.href = `https://www.goldsilverstuff.com/wallet-callback?token=${token}&wallet=${walletAddress}`;
    } catch (error) {
      console.error("❌ Wallet-Verbindung fehlgeschlagen:", error);
      alert("❌ Verbindung zur Wallet fehlgeschlagen.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <img src="/logos/company-logo.png" alt="Company Logo" style={{ maxWidth: '150px', marginBottom: '1.5rem' }} />
      <h2 style={{ marginBottom: '1rem' }}>🔐 Wallet-Verbindung starten</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        {connectors.map(c => (
          <button
            key={c.id}
            onClick={() => setConnector(c.id)}
            style={{
              flex: 1, padding: '0.75rem', margin: '0 0.25rem',
              border: connector === c.id ? '2px solid #0070f3' : '1px solid #ccc',
              borderRadius: '8px', background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
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
          width: '100%', padding: '12px', fontSize: '18px',
          backgroundColor: '#222', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: 'pointer'
        }}
      >
        Mit {connectors.find(c => c.id === connector)?.name} verbinden
      </button>
    </div>
  );
}
