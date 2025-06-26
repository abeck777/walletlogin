// src/WalletLogin.jsx
import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

export default function WalletLogin() {
  const [token, setToken] = useState(null);
  const [connector, setConnector] = useState("metamask");
  const [language, setLanguage] = useState("de");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langRef = useRef();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    if (!accessToken) {
      alert("❌ Zugriffstoken fehlt in der URL.");
      return;
    }
    setToken(accessToken);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const connectors = [
    { id: "metamask", name: "MetaMask", logo: "/logos/metamask.png" },
    { id: "walletconnect", name: "WalletConnect", logo: "/logos/walletconnect.png" },
    { id: "coinbase", name: "Coinbase Wallet", logo: "/logos/coinbase.png" }
  ];

  const languages = [
    { code: "de", label: "Deutsch" },
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "pl", label: "Polski" },
    { code: "ru", label: "Русский" },
    { code: "zh", label: "中文" },
    { code: "it", label: "Italiano" },
    { code: "es", label: "Español" },
    { code: "pt", label: "Português" },
    { code: "ja", label: "日本語" },
    { code: "hi", label: "हिंदी" },
    { code: "af", label: "Afrikaans" }
  ];

  const translations = {
    /* translations omitted for brevity; assume same as before */
  };

  function connectHandler() {
    if (!token) {
      alert(translations[language].guidePrefix + translations[language].connect.replace("{name}", connectors.find(c => c.id === connector).name));
      return;
    }
    (async () => {
      let provider;
      try {
        if (connector === "metamask") {
          if (!window.ethereum) { alert("⚠️ Bitte installiere MetaMask."); return; }
          await window.ethereum.request({ method: "eth_requestAccounts" });
          provider = new ethers.BrowserProvider(window.ethereum);
        } else if (connector === "walletconnect") {
          const wc = await EthereumProvider.init({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID, chains: [1], showQrModal: true });
          await wc.enable();
          provider = new ethers.BrowserProvider(wc);
        } else {
          const cb = new CoinbaseWalletSDK({ appName: "MeinShop", darkMode: false });
          const cbProv = cb.makeWeb3Provider(process.env.NEXT_PUBLIC_INFURA_URL, 1);
          await cbProv.request({ method: "eth_requestAccounts" });
          provider = new ethers.BrowserProvider(cbProv);
        }
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        window.location.href = `https://www.goldsilverstuff.com/wallet-callback?token=${token}&wallet=${address}`;
      } catch (err) {
        console.error(err);
        alert("❌ Verbindung zur Wallet fehlgeschlagen.");
      }
    })();
  }

  const t = translations[language];
  const connectText = t.connect.replace("{name}", connectors.find(c => c.id === connector).name);
  const currentLang = languages.find(l => l.code === language);

  return (
    <div style={{ position: 'relative', maxWidth: '400px', margin: '2rem auto', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      {/* Language Dropdown */}
      <div ref={langRef} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
        <button onClick={() => setLangMenuOpen(!langMenuOpen)} style={{ display: 'flex', alignItems: 'center', padding: '4px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
          <img src={`/logos/${currentLang.code}.png`} alt={currentLang.label} style={{ width: '16px', height: '16px', marginRight: '4px' }} />
          <span style={{ fontSize: '12px' }}>{currentLang.label}</span>
        </button>
        {langMenuOpen && (
          <div style={{ marginTop: '4px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {languages.map(lang => (
              <div key={lang.code} onClick={() => { setLanguage(lang.code); setLangMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', cursor: 'pointer' }}>
                <img src={`/logos/${lang.code}.png`} alt={lang.label} style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                <span style={{ fontSize: '12px' }}>{lang.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <img src="/logos/company-logo.png" alt="Company Logo" style={{ maxWidth: '150px', marginBottom: '0.5rem' }} />
      <p style={{ marginBottom: '1.5rem', fontSize: '16px', fontWeight: 'bold', color: '#555' }}>GoldSilverStuff.com©</p>

      <h2 style={{ marginBottom: '1rem' }}>{t.header}</h2>

      {/* Rest of component unchanged */}
    </div>
  );
}
