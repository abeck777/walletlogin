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

  // 1) Token aus URL
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("accessToken");
    if (!t) {
      alert("❌ Zugriffstoken fehlt in der URL.");
    } else {
      setToken(t);
    }
  }, []);

  // 2) Sprach-Dropdown schließen
  useEffect(() => {
    function onClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
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
    de: {
      header: "🔐 Wallet-Verbindung starten",
      guidePrefix: "Noch keine Wallet? ",
      guideLink: "Hier gibt's eine 2-Minuten-Anleitung.",
      connect: "Mit {name} verbinden",
      back: "zurück zur Login-Seite",
      cookie: "Diese Website verwendet Cookies, um dein Erlebnis zu verbessern.",
      accept: "Akzeptieren"
    },
    en: {
      header: "🔐 Connect Wallet",
      guidePrefix: "No wallet yet? ",
      guideLink: "Here's a 2-minute guide.",
      connect: "Connect with {name}",
      back: "Back to login page",
      cookie: "This website uses cookies to enhance your experience.",
      accept: "Accept"
    },
    fr: {
    header: "🔐 Connecter le portefeuille",
    guidePrefix: "Pas encore de portefeuille ? ",
    guideLink: "Voici un guide de 2 minutes.",
    connect: "Se connecter avec {name}",
    back: "Retour à la page de connexion",
    cookie: "Ce site utilise des cookies pour améliorer votre expérience.",
    accept: "Accepter"
    },
    pl: {
      header: "🔐 Połącz portfel",
      guidePrefix: "Jeszcze nie masz portfela? ",
      guideLink: "Oto przewodnik w 2 minuty.",
      connect: "Połącz z {name}",
      back: "Powrót do strony logowania",
      cookie: "Ta strona używa plików cookie, aby poprawić Twoje doświadczenie.",
      accept: "Akceptuj"
    },
    ru: {
      header: "🔐 Подключить кошелёк",
      guidePrefix: "Ещё нет кошелька? ",
      guideLink: "Вот двухминутное руководство.",
      connect: "Подключиться к {name}",
      back: "Вернуться на страницу входа",
      cookie: "Этот сайт использует файлы cookie для улучшения вашего опыта.",
      accept: "Принять"
    },
    zh: {
      header: "🔐 连接钱包",
      guidePrefix: "还没有钱包？ ",
      guideLink: "这里有一个2分钟教程。",
      connect: "使用{name}连接",
      back: "返回登录页面",
      cookie: "此网站使用 Cookie 来增强您的体验。",
      accept: "接受"
    },
    it: {
      header: "🔐 Connetti portafoglio",
      guidePrefix: "Non hai ancora un portafoglio? ",
      guideLink: "Ecco una guida di 2 minuti.",
      connect: "Connetti con {name}",
     back: "Torna alla pagina di accesso",
      cookie: "Questo sito utilizza i cookie per migliorare la tua esperienza.",
      accept: "Accetta"
    },
    es: {
      header: "🔐 Conectar billetera",
      guidePrefix: "¿No tienes cartera? ",
      guideLink: "Aquí tienes una guía de 2 minutos.",
     connect: "Conectar con {name}",
      back: "Volver a la página de inicio de sesión",
      cookie: "Este sitio utiliza cookies para mejorar tu experiencia.",
     accept: "Aceptar"
    },
    pt: {
      header: "🔐 Conectar carteira",
      guidePrefix: "Ainda não tem uma carteira? ",
      guideLink: "Aqui está um guia de 2 minutos.",
      connect: "Conectar com {name}",
      back: "Voltar à página de login",
      cookie: "Este site usa cookies para melhorar sua experiência.",
      accept: "Aceitar"
    },
    ja: {
      header: "🔐 ウォレットを接続",
      guidePrefix: "まだウォレットがないですか？ ",
      guideLink: "2 分ガイドはこちら。",
      connect: "{name}で接続",
      back: "ログインページに戻る",
      cookie: "このサイトではクッキーを使用してユーザー体験を向上させています。",
      accept: "同意する"
    },
    hi: {
      header: "🔐 वॉलेट कनेक्ट करें",
      guidePrefix: "अभी तक वॉलेट नहीं है? ",
      guideLink: "यहाँ 2-मिनट मार्गदर्शिका है।",
      connect: "{name} से कनेक्ट करें",
      back: "लॉगिन पेज पर वापस जाएँ",
      cookie: "यह वेबसाइट आपके अनुभव को बेहतर बनाने के लिए कुकीज़ का उपयोग करती है।",
      accept: "स्वीकार करें"
    },
    af: {
      header: "🔐 Sluit beursie aan",
      guidePrefix: "Nog geen beursie? ",
      guideLink: "Hier is ’n 2-minuut gids.",
      connect: "Verbind met {name}",
      back: "Terug na aanmeldbladsy",
      cookie: "Hierdie webwerf gebruik koekies om jou ervaring te verbeter.",
      accept: "Aksepteer"
    }
  };


  const t = translations[language] || translations.de;
  const connectText = t.connect.replace(
    "{name}",
    connectors.find(c => c.id === connector).name
  );
  const currentLang = languages.find(l => l.code === language) || languages[0];

  // 3) Click-Handler mit EIP-4361 + Nonce-Flow
  async function connectHandler() {
    if (!token) {
      alert(t.guidePrefix + connectText);
      return;
    }

    try {
      let provider;
      // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––
      // Provider auswählen
      if (connector === "metamask") {
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
        const wc = await EthereumProvider.init({
          projectId: process.env.REACT_APP_WC_PROJECT_ID,
          rpcMap: { 1: process.env.REACT_APP_INFURA_URL },
          chains: [1],
          showQrModal: true
        });
        await wc.enable();
        provider = new ethers.BrowserProvider(wc);

      } else {
        const cb = new CoinbaseWalletSDK({
          appName: "MeinShop",
          jsonRpcUrl: process.env.REACT_APP_INFURA_URL,
          chainId: 1,
          darkMode: false
        });
        const cbProv = cb.makeWeb3Provider();
        await cbProv.request({ method: "eth_requestAccounts" });
        provider = new ethers.BrowserProvider(cbProv);
      }
      // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // 3a) Nonce vom Server holen (und Cookie gesetzt)
      const nonceRes = await fetch(`/api/nonce?token=${token}`);
      if (!nonceRes.ok) throw new Error("Nonce konnte nicht geladen werden");
      const { nonce } = await nonceRes.json();

      // 3b) Nachricht signieren
      let signature;
      try {
        signature = await signer.signMessage(`${token}:${nonce}`);
      } catch (err) {
        if (err.code === 4001) {
          alert("✋ Signatur abgelehnt – bitte bestätige.");
          return;
        }
        throw err;
      }

      // 3c) Verify-Call
      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, address, signature, nonce })
      });
      const { success } = await verifyRes.json();
      if (!verifyRes.ok || !success) {
        throw new Error("Signatur ungültig – bitte erneut versuchen.");
      }

      // 3d) Redirect auf Callback
      window.location.href = `https://www.goldsilverstuff.com/wallet-callback?token=${token}&wallet=${address}`;
    } catch (err) {
      console.error(err);
      alert(`⚠️ Fehler: ${err.message}`);
    }
  }

  // 4) Render
  return (
    <div style={{
      position: "relative",
      maxWidth: "400px",
      margin: "2rem auto",
      textAlign: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      {/* Sprachwahl */}
      <div ref={langRef} style={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}>
        <button onClick={() => setLangMenuOpen(o => !o)} style={{
          display: "flex", alignItems: "center", padding: "4px",
          background: "#fff", border: "1px solid #ccc", borderRadius: "4px",
          cursor: "pointer"
        }}>
          <img src={currentLang.flag} alt="" style={{ width: "16px", marginRight: "4px" }} />
          <span style={{ fontSize: "12px" }}>{currentLang.label}</span>
        </button>
        {langMenuOpen && (
          <div style={{
            marginTop: "4px", background: "#fff",
            border: "1px solid #ccc", borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            {languages.map(l => (
              <div key={l.code} onClick={() => { setLanguage(l.code); setLangMenuOpen(false); }} style={{
                display: "flex", alignItems: "center", padding: "4px 8px", cursor: "pointer"
              }}>
                <img src={l.flag} alt="" style={{ width: "16px", marginRight: "8px" }} />
                <span style={{ fontSize: "12px" }}>{l.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logo & Header */}
      <img src="/logos/company-logo.png" alt="Logo" style={{ maxWidth: "150px", marginBottom: "0.5rem" }} />
      <p style={{ marginBottom: "1rem", fontSize: "16px", fontWeight: "bold", color: "#555" }}>
        GoldSilverStuff.com©
      </p>
      <h2 style={{ marginBottom: "1.5rem" }}>{t.header}</h2>

      {/* Connector */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        {connectors.map(c => (
          <button key={c.id} onClick={() => setConnector(c.id)} style={{
            flex: 1, padding: "0.75rem", margin: "0 0.25rem",
            border: connector === c.id ? "2px solid #0070f3" : "1px solid #ccc",
            borderRadius: "8px", background: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <img src={c.logo} alt="" style={{ width: "24px", marginRight: "0.5rem" }} />
            {c.name}
          </button>
        ))}
      </div>

      {/* Connect-Button */}
      <button onClick={connectHandler} style={{
        width: "100%", padding: "12px", fontSize: "18px",
        backgroundColor: "#222", color: "#fff", border: "none",
        borderRadius: "8px", cursor: "pointer"
      }}>
        {connectText}
      </button>

      {/* Guide & Back */}
      <p style={{ marginTop: "1rem", fontSize: "14px", color: "#555" }}>
        {t.guidePrefix}
        <a href="https://www.youtube-nocookie.com/watch?v=465676767787"
           target="_blank" rel="noopener noreferrer">
          {t.guideLink}
        </a>
      </p>
      <button onClick={() => (window.location.href = "https://www.goldsilverstuff.com/wallet-login-page")} style={{
        marginTop: "1rem", padding: "8px 16px", fontSize: "14px",
        backgroundColor: "#eee", color: "#222", border: "1px solid #ccc",
        borderRadius: "4px", cursor: "pointer"
      }}>
        {t.back}
      </button>

      {/* CookieConsent */}
      <CookieConsent
        location="bottom"
        buttonText={t.accept}
        cookieName="goldsilver_cookies"
        style={{ background: "#2B373B" }}
        buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
      >
        {t.cookie}{" "}
        <a href="https://goldsilverstuff.com/privacy-policy"
           target="_blank"
           rel="noopener noreferrer"
           style={{ color: "#FFD700" }}>
          Privacy Policy
        </a>
      </CookieConsent>
    </div>
  );
}
