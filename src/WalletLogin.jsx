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
    /* … restliche Sprachen … */
  ];

  const translations = {
    de: { header: "🔐 Wallet-Verbindung starten", guidePrefix: "Noch keine Wallet? ", guideLink: "Hier gibt's eine 2-Minuten-Anleitung.", connect: "Mit {name} verbinden", back: "zurück zur Login-Seite", cookie: "Diese Website verwendet Cookies, um dein Erlebnis zu verbessern.", accept: "Akzeptieren" },
    /* … restliche Übersetzungen … */
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
        // 1) MetaMask-Erkennung
        const { ethereum } = window;
        if (!ethereum) {
          alert("⚠️ Bitte installiere MetaMask.");
          return;
        }
        // Falls mehrere Injects (Brave, Coinbase, etc.), wirklich MetaMask wählen
        const mmProvider = ethereum.providers
          ? ethereum.providers.find(p => p.isMetaMask)
          : ethereum;
        if (!mmProvider || !mmProvider.isMetaMask) {
          alert("⚠️ MetaMask nicht gefunden.");
          return;
        }
        await mmProvider.request({ method: "eth_requestAccounts" });
        provider = new ethers.BrowserProvider(mmProvider);

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
        // 2) Coinbase Wallet: korrekte Signatur makeWeb3Provider(rpcUrl, chainId)
        const cb = new CoinbaseWalletSDK({
          appName: "MeinShop",
          darkMode: false
        });
        const cbProv = cb.makeWeb3Provider(process.env.REACT_APP_INFURA_URL, 1);
        await cbProv.request({ method: "eth_requestAccounts" });
        provider = new ethers.BrowserProvider(cbProv);
      }

      // Signer + Adresse
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // 3) Zusätzliche Confirmation-Message in Wallet
      if (connector === "metamask" || connector === "coinbase") {
        try {
          await signer.signMessage(`Bitte bestätige, dass dies deine Wallet ist: ${address}`);
        } catch (err) {
          if (err.code === 4001) {
            alert("✋ Signatur abgelehnt – bitte bestätige in deiner Wallet.");
            return;
          }
          throw err;
        }
      }

      // 4) EIP-4361 Flow: Nonce holen, Nachricht signieren, verifizieren
      const nonceRes = await fetch(`/api/nonce?token=${token}`);
      if (!nonceRes.ok) throw new Error("Nonce konnte nicht geladen werden");
      const { nonce } = await nonceRes.json();
      const sig = await signer.signMessage(`Bitte bestätige: ${nonce}`);
      const verifyRes = await fetch(`/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, address, signature: sig, nonce })
      });
      const { success } = await verifyRes.json();
      if (!verifyRes.ok || !success) throw new Error("Signatur ungültig – bitte erneut versuchen.");

      // 5) Weiterleitung
      window.location.href = `https://www.goldsilverstuff.com/wallet-callback?token=${token}&wallet=${address}`;

    } catch (err) {
      console.error(err);
      alert(`⚠️ Fehler: ${err.message}`);
    }
  }

  return (
    <>
      <div style={{ position:'relative', maxWidth:'400px', margin:'2rem auto', textAlign:'center', fontFamily:'Arial,sans-serif' }}>
        {/** Sprachwahl, Logo, Überschrift, Buttons … **/}
        <div style={{marginTop:'1.5rem'}}>
          {connectors.map(c => (
            <button key={c.id} onClick={() => setConnector(c.id)} style={{
              flex:1, padding:'0.75rem', margin:'0 0.25rem',
              border: connector===c.id ? '2px solid #0070f3' : '1px solid #ccc',
              borderRadius:'8px', background:'#fff', cursor:'pointer'
            }}>
              <img src={c.logo} alt={c.name} style={{width:'24px',height:'24px',marginRight:'0.5rem'}}/>
              {c.name}
            </button>
          ))}
        </div>
        <button onClick={connectHandler} style={{
          width:'100%', padding:'12px', fontSize:'18px',
          backgroundColor:'#222', color:'#fff', border:'none',
          borderRadius:'8px', cursor:'pointer', marginTop:'1rem'
        }}>
          {connectText}
        </button>
        {/** CookieConsent etc. **/}
      </div>
    </>
  );
}
