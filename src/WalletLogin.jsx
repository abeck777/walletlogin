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
    // ... weitere Sprachen ...
  };

  const t = translations[language] || translations.de;
  const connectText = t.connect.replace("{name}", connectors.find(c => c.id === connector).name);
  const currentLang = languages.find(l => l.code === language);

  async function connectHandler() {
    if (!token) {
      alert(t.guidePrefix + connectText);
      return;
    }
    let provider;
    if (connector === "metamask") {
      if (!window.ethereum) { alert("⚠️ Bitte installiere MetaMask."); return; }
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.BrowserProvider(window.ethereum);

    } else if (connector === "walletconnect") {
      const wc = await EthereumProvider.init({
        projectId: process.env.REACT_APP_WC_PROJECT_ID,
        rpcMap: { 1: process.env.REACT_APP_INFURA_URL },
        chains: [1],
        showQrModal: true
      });
      await wc.enable();
      provider = new ethers.BrowserProvider(wc);

    } else if (connector === "coinbase") {
      // Coinbase mit festem RPC-URL (funktioniert) statt env var
      const cb = new CoinbaseWalletSDK({ appName: "MeinShop", darkMode: false });
      const cbProv = cb.makeWeb3Provider(
        "https://mainnet.infura.io/v3/0aa5ee5532ee4f80b41a67e208e6c184",
        1
      );
      await cbProv.request({ method: "eth_requestAccounts" });
      provider = new ethers.BrowserProvider(cbProv);
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    window.location.href = `https://www.goldsilverstuff.com/wallet-callback?token=${token}&wallet=${address}`;
  }

  return (
    <>
      <div style={{ maxWidth:'400px', margin:'2rem auto', textAlign:'center', fontFamily:'Arial, sans-serif' }}>
        {/* Sprach-Dropdown */}
        {/* ... Sprache code ... */}

        <img src="/logos/company-logo.png" alt="Company Logo" style={{ maxWidth:'150px', marginBottom:'0.5rem' }} />
        <p style={{ marginBottom:'1.5rem', fontSize:'16px', fontWeight:'bold', color:'#555' }}>GoldSilverStuff.com©</p>
        <h2>{t.header}</h2>

        {/* Wallet-Buttons */}
        <div style={{ display:'flex', justifyContent:'space-between', margin:'1.5rem 0' }}>
          {connectors.map(c => (
            <button key={c.id} onClick={()=>setConnector(c.id)} style={{ flex:1, margin:'0 4px', padding:'8px', border:connector===c.id? '2px solid #0070f3' :'1px solid #ccc', borderRadius:'8px', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src={c.logo} alt={c.name} style={{ width:'24px', marginRight:'8px' }} />{c.name}
            </button>
          ))}
        </div>

        <button onClick={connectHandler} style={{ width:'100%', padding:'12px', background:'#222', color:'#fff', border:'none', borderRadius:'8px' }}>{connectText}</button>

        <p style={{ margin:'1rem 0', fontSize:'14px', color:'#555' }}>{t.guidePrefix}<a href="https://www.youtube-nocookie.com/watch?v=465676767787" target="_blank" rel="noopener noreferrer">{t.guideLink}</a></p>

        <button onClick={()=>window.location.href='/wallet-login-page'} style={{ marginTop:'16px', padding:'8px 16px', background:'#eee', border:'1px solid #ccc', borderRadius:'4px' }}>{t.back}</button>
      </div>

      <CookieConsent
        location="bottom"
        buttonText={t.accept}
        cookieName="goldsilver_cookies"
        style={{ background:'#2B373B' }}
        buttonStyle={{ color:'#4e503b', fontSize:'13px' }}
      >
        {t.cookie} <a href="https://goldsilverstuff.com/privacy-policy" style={{ color:'#FFD700' }}>Privacy Policy</a>
      </CookieConsent>
    </>
  );
}
