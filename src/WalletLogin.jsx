// src/WalletLogin.jsx
import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import CookieConsent from "react-cookie-consent";

export default function WalletLogin() {
  const [token, setToken] = useState(null);
  const [connector, setConnector] = useState("metamask");
  const [language, setLanguage] = useState("de");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langRef = useRef(null);

  // Token aus URL lesen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    if (!accessToken) {
      alert("❌ Zugriffstoken fehlt in der URL.");
      return;
    }
    setToken(accessToken);
  }, []);

  // Schließt Sprachmenü bei Klick außerhalb
  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const connectors = [
    { id: "metamask", name: "MetaMask", logo: "/logos/metamask.png" },
    { id: "walletconnect", name: "WalletConnect", logo: "/logos/walletconnect.png" },
    { id: "coinbase", name: "Coinbase Wallet", logo: "/logos/coinbase.png" }
  ];

  const languages = [
    { code: "de", label: "Deutsch", flag: "/logos/germany.png" },
    { code: "en", label: "English", flag: "/logos/usa.png" },
    { code: "fr", label: "Français", flag: "/logos/france.png" },
    { code: "pl", label: "Polski", flag: "/logos/poland.png" },
    { code: "ru", label: "Русский", flag: "/logos/russia.png" },
    { code: "zh", label: "中文", flag: "/logos/china.png" },
    { code: "it", label: "Italiano", flag: "/logos/italy.png" },
    { code: "es", label: "Español", flag: "/logos/spain.png" },
    { code: "pt", label: "Português", flag: "/logos/portugal.png" },
    { code: "ja", label: "日本語", flag: "/logos/japan.png" },
    { code: "hi", label: "हिंदी", flag: "/logos/india.png" },
    { code: "af", label: "Afrikaans", flag: "/logos/southafrica.png" }
  ];

  const translations = {
    de: { header: "🔐 Wallet-Verbindung starten", guidePrefix: "Noch keine Wallet? ", guideLink: "Hier gibt's eine 2-Minuten-Anleitung.", connect: "Mit {name} verbinden", back: "zurück zur Login-Seite", cookie: "Diese Website verwendet Cookies, um dein Erlebnis zu verbessern.", accept: "Akzeptieren" },
    en: { header: "🔐 Connect Wallet", guidePrefix: "No wallet yet? ", guideLink: "Here's a 2-minute guide.", connect: "Connect with {name}", back: "Back to login page", cookie: "This website uses cookies to enhance your experience.", accept: "Accept" }
    // weitere Sprachen nach Bedarf
  };

  const t = translations[language] || translations.de;
  const connectText = t.connect.replace("{name}", connectors.find(c => c.id === connector).name);
  const currentLang = languages.find(l => l.code === language);

  async function connectHandler() {
    if (!token) {
      alert(t.guidePrefix + t.connect.replace("{name}", connectors.find(c => c.id === connector).name));
      return;
    }
    try {
      let provider;
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
  }

  return (
    <>
      <div style={{ position: 'relative', maxWidth: '400px', margin: '2rem auto', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        {/* Language Dropdown */}
        <div ref={langRef} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
          <button onClick={() => setLangMenuOpen(!langMenuOpen)} style={{ display: 'flex', alignItems: 'center', padding: '4px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
            <img src={currentLang.flag} alt={currentLang.label} style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            <span style={{ fontSize: '12px' }}>{currentLang.label}</span>
          </button>
          {langMenuOpen && (
            <div style={{ marginTop: '4px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {languages.map(lang => (
                <div key={lang.code} onClick={() => { setLanguage(lang.code); setLangMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', cursor: 'pointer' }}>
                  <img src={lang.flag} alt={lang.label} style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  <span style={{ fontSize: '12px' }}>{lang.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <img src="/logos/company-logo.png" alt="Company Logo" style={{ maxWidth: '150px', marginBottom: '0.5rem' }} />
        <p style={{ marginBottom: '1.5rem', fontSize: '16px', fontWeight: 'bold', color: '#555' }}>GoldSilverStuff.com©</p>
        <h2 style={{ marginBottom: '1rem' }}>{t.header}</h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          {connectors.map(c => (
            <button key={c.id} onClick={() => setConnector(c.id)} style={{ flex: 1, padding: '0.75rem', margin: '0 0.25rem', border: connector === c.id ? '2px solid #0070f3' : '1px solid #ccc', borderRadius: '8px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={c.logo} alt={c.name} style={{ width: '24px', height: '24px', marginRight: '0.5rem' }} />{c.name}
            </button>
          ))}
        </div>
        <button onClick={connectHandler} style={{ width: '100%', padding: '12px', fontSize: '18px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{connectText}</button>
        <p style={{ marginTop: '1.5rem', fontSize: '14px', color: '#555' }}>{t.guidePrefix}<a href="https://www.youtube-nocookie.com/watch?v=465676767787" target="_blank" rel="noopener noreferrer">{t.guideLink}</a></p>
        <button onClick={() => { window.location.href = '/wallet-login-page'; }} style={{ marginTop: '2rem', padding: '8px 16px', fontSize: '14px', backgroundColor: '#eee', color: '#222', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>{t.back}</button>
      </div>
      <CookieConsent
        location="bottom"
        buttonText={t.accept}
        cookieName="goldsilver_cookies"
        style={{ background: "#2B373B" }}
        buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
      >
        {t.cookie} <a href="https://goldsilverstuff.com/privacy-policy" style={{ color: "#FFD700" }}>Privacy Policy</a>
      </CookieConsent>
    </>
  );
}
