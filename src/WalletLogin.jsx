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

  // Sprachmenü schließen bei Klick außerhalb
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
    { id: "metamask",      name: "MetaMask",        logo: "/logos/metamask.png" },
    { id: "walletconnect", name: "WalletConnect",   logo: "/logos/walletconnect.png" },
    { id: "coinbase",      name: "Coinbase Wallet", logo: "/logos/coinbase.png" }
  ];

  const languages = [
    { code: "de", label: "Deutsch",    flag: "/logos/germany.png" },
    { code: "en", label: "English",    flag: "/logos/usa.png" },
    { code: "fr", label: "Français",   flag: "/logos/france.png" },
    { code: "pl", label: "Polski",     flag: "/logos/poland.png" },
    { code: "ru", label: "Русский",    flag: "/logos/russia.png" },
    { code: "zh", label: "中文",       flag: "/logos/china.png" },
    { code: "it", label: "Italiano",   flag: "/logos/italy.png" },
    { code: "es", label: "Español",    flag: "/logos/spain.png" },
    { code: "pt", label: "Português",  flag: "/logos/portugal.png" },
    { code: "ja", label: "日本語",      flag: "/logos/japan.png" },
    { code: "hi", label: "हिंदी",      flag: "/logos/india.png" },
    { code: "af", label: "Afrikaans",  flag: "/logos/southafrica.png" }
  ];

  const translations = {
    de: { header: "🔐 Wallet-Verbindung starten", guidePrefix: "Noch keine Wallet? ", guideLink: "Hier gibt's eine 2-Minuten-Anleitung.", connect: "Mit {name} verbinden", back: "zurück zur Login-Seite", cookie: "Diese Website verwendet Cookies, um dein Erlebnis zu verbessern.", accept: "Akzeptieren" },
    en: { header: "🔐 Connect Wallet",          guidePrefix: "No wallet yet? ",     guideLink: "Here's a 2-minute guide.",       connect: "Connect with {name}",  back: "Back to login page",      cookie: "This website uses cookies to enhance your experience.", accept: "Accept" },
    fr: { header: "🔐 Connecter le portefeuille", guidePrefix: "Pas encore de portefeuille ? ", guideLink: "Voici un guide de 2 minutes.", connect: "Se connecter avec {name}", back: "Retour à la page de connexion", cookie: "Ce site utilise des cookies pour améliorer votre expérience.", accept: "Accepter" },
    // … Weitere Sprachen wie gehabt …
  };

  const t = translations[language] || translations.de;
  const connectText = t.connect.replace("{name}", connectors.find(c => c.id === connector).name);
  const currentLang = languages.find(l => l.code === language) || languages[0];

  async function connectHandler() {
    if (!token) {
      alert(t.guidePrefix + connectText);
      return;
    }

    try {
      let provider;

      if (connector === "metamask") {
        // MetaMask: echtes MetaMask-Provider-Objekt finden
        const { ethereum } = window;
        if (!ethereum) {
          alert("⚠️ Bitte installiere MetaMask.");
          return;
        }
        const mm = ethereum.providers?.find(p => p.isMetaMask) ?? ethereum;
        if (!mm || !mm.isMetaMask) {
          alert("⚠️ MetaMask nicht gefunden.");
          return;
        }
        await mm.request({ method: "eth_requestAccounts" });
        provider = new ethers.BrowserProvider(mm);

      } else if (connector === "walletconnect") {
        // WalletConnect unverändert
        const wc = await EthereumProvider.init({
          projectId: process.env.REACT_APP_WC_PROJECT_ID,
          rpcMap: { 1: process.env.REACT_APP_INFURA_URL },
          chains: [1],
          showQrModal: true
        });
        await wc.enable();
        provider = new ethers.BrowserProvider(wc);

      } else {
        // Coinbase Wallet SDK
        const cb = new CoinbaseWalletSDK({ appName: "MeinShop", darkMode: false });
        const cbProv = cb.makeWeb3Provider(process.env.REACT_APP_INFURA_URL, 1);
        await cbProv.request({ method: "eth_requestAccounts" });
        provider = new ethers.BrowserProvider(cbProv);
      }

      // Signer und Adresse
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Wir signieren direkt den Access-Token
      let signature;
      try {
        signature = await signer.signMessage(`Bitte bestätige: ${token}`);
      } catch (err) {
        if (err.code === 4001) {
          alert("✋ Signatur abgelehnt – bitte bestätige in deiner Wallet.");
          return;
        }
        throw err;
      }

      // Einziger Verify-Call
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, address, signature })
      });
      const { success, error } = await res.json();
      if (!res.ok || !success) {
        console.error(error);
        throw new Error("Signatur ungültig – bitte erneut versuchen.");
      }

      // Weiterleitung auf Callback
      window.location.href = `https://www.goldsilverstuff.com/wallet-callback?token=${token}&wallet=${address}`;

    } catch (err) {
      console.error(err);
      alert(`⚠️ Fehler: ${err.message}`);
    }
  }

  return (
    <>
      <div style={{ position: 'relative', maxWidth: '400px', margin: '2rem auto', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        {/* Sprachwahl */}
        <div ref={langRef} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
          <button onClick={() => setLangMenuOpen(!langMenuOpen)} style={{
            display: 'flex', alignItems: 'center', padding: '4px',
            background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer'
          }}>
            <img src={currentLang.flag} alt="" style={{ width: '16px', marginRight: '4px' }} />
            <span style={{ fontSize: '12px' }}>{currentLang.label}</span>
          </button>
          {langMenuOpen && (
            <div style={{
              marginTop: '4px', background: '#fff', border: '1px solid #ccc',
              borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {languages.map(l => (
                <div key={l.code} onClick={() => { setLanguage(l.code); setLangMenuOpen(false); }} style={{
                  display: 'flex', alignItems: 'center', padding: '4px 8px', cursor: 'pointer'
                }}>
                  <img src={l.flag} alt="" style={{ width: '16px', marginRight: '8px' }} />
                  <span style={{ fontSize: '12px' }}>{l.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logo & Header */}
        <img src="/logos/company-logo.png" alt="Logo" style={{ maxWidth: '150px', marginBottom: '0.5rem' }} />
        <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#555', marginBottom: '1rem' }}>GoldSilverStuff.com©</p>
        <h2 style={{ marginBottom: '1.5rem' }}>{t.header}</h2>

        {/* Connector Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          {connectors.map(c => (
            <button key={c.id} onClick={() => setConnector(c.id)} style={{
              flex: 1, padding: '0.75rem', margin: '0 0.25rem',
              border: connector === c.id ? '2px solid #0070f3' : '1px solid #ccc',
              borderRadius: '8px', background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src={c.logo} alt="" style={{ width: '24px', marginRight: '0.5rem' }} />
              {c.name}
            </button>
          ))}
        </div>

        {/* Connect-Button */}
        <button onClick={connectHandler} style={{
          width: '100%', padding: '12px', fontSize: '18px',
          backgroundColor: '#222', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: 'pointer'
        }}>
          {connectText}
        </button>

        {/* Guide & Back */}
        <p style={{ marginTop: '1rem', fontSize: '14px', color: '#555' }}>
          {t.guidePrefix}
          <a href="https://www.youtube-nocookie.com/watch?v=465676767787" target="_blank" rel="noopener noreferrer">{t.guideLink}</a>
        </p>
        <button onClick={() => window.location.href = '/'} style={{
          marginTop: '1rem', padding: '8px 16px', fontSize: '14px',
          backgroundColor: '#eee', color: '#222', border: '1px solid #ccc',
          borderRadius: '4px', cursor: 'pointer'
        }}>
          {t.back}
        </button>

        {/* Cookie Consent */}
        <CookieConsent
          location="bottom"
          buttonText={t.accept}
          cookieName="goldsilver_cookies"
          style={{ background: "#2B373B" }}
          buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
        >
          {t.cookie}{" "}
          <a href="https://goldsilverstuff.com/privacy-policy" style={{ color: "#FFD700" }}>
            Privacy Policy
          </a>
        </CookieConsent>
      </div>
    </>
  );
}
