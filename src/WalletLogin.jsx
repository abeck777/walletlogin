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
    { id: "metamask", name: "MetaMask", logo: "/logos/metamask.png" },
    { id: "walletconnect", name: "WalletConnect", logo: "/logos/walletconnect.png" },
    { id: "coinbase", name: "Coinbase Wallet", logo: "/logos/coinbase.png" }
  ];

  const languages = [
    { code: "de", label: "Deutsch",    flag: "/logos/germany.png" },
    { code: "en", label: "English",    flag: "/logos/usa.png" },
    { code: "fr", label: "Français",   flag: "/logos/france.png" },
    { code: "pl", label: "Polski",     flag: "/logos/poland.png" },
    { code: "ru", label: "Русский",    flag: "/logos/russia.png" },
    { code: "zh", label: "中文",        flag: "/logos/china.png" },
    { code: "it", label: "Italiano",   flag: "/logos/italy.png" },
    { code: "es", label: "Español",    flag: "/logos/spain.png" },
    { code: "pt", label: "Português",  flag: "/logos/portugal.png" },
    { code: "ja", label: "日本語",      flag: "/logos/japan.png" },
    { code: "hi", label: "हिंदी",       flag: "/logos/india.png" },
    { code: "af", label: "Afrikaans",  flag: "/logos/southafrica.png" }
  ];

  const translations = {
    de: { header: "🔐 Wallet-Verbindung starten", guidePrefix: "Noch keine Wallet? ", guideLink: "Hier gibt's eine 2-Minuten-Anleitung.", connect: "Mit {name} verbinden", back: "zurück zur Login-Seite", cookie: "Diese Website verwendet Cookies, um dein Erlebnis zu verbessern.", accept: "Akzeptieren" },
    en: { header: "🔐 Connect Wallet",         guidePrefix: "No wallet yet? ", guideLink: "Here's a 2-minute guide.", connect: "Connect with {name}",  back: "Back to login page",      cookie: "This website uses cookies to enhance your experience.", accept: "Accept" },
    fr: { header: "🔐 Connecter le portefeuille", guidePrefix: "Pas encore de portefeuille ? ", guideLink: "Voici un guide de 2 minutes.", connect: "Se connecter avec {name}", back: "Retour à la page de connexion", cookie: "Ce site utilise des cookies pour améliorer votre expérience.", accept: "Accepter" },
    pl: { header: "🔐 Połącz portfel",           guidePrefix: "Jeszcze nie masz portfela? ", guideLink: "Oto przewodnik w 2 minuty.", connect: "Połącz z {name}",     back: "Powrót do strony logowania", cookie: "Ta strona używa plików cookie, aby poprawić Twoje doświadczenie.", accept: "Akceptuj" },
    ru: { header: "🔐 Подключить кошелёк",       guidePrefix: "Ещё нет кошелька? ", guideLink: "Вот двухминутное руководство.", connect: "Подключиться к {name}", back: "Вернуться на страницу входа", cookie: "Этот сайт использует файлы cookie для улучшения вашего опыта.", accept: "Принять" },
    zh: { header: "🔐 连接钱包",                guidePrefix: "还没有钱包？ ", guideLink: "这里有一个2分钟教程。", connect: "使用{name}连接",   back: "返回登录页面",          cookie: "此网站使用 Cookie 来增强您的体验。", accept: "接受" },
    it: { header: "🔐 Connetti portafoglio",    guidePrefix: "Non hai ancora un portafoglio? ", guideLink: "Ecco una guida di 2 minuti.", connect: "Connetti con {name}", back: "Torna alla pagina di accesso", cookie: "Questo sito utilizza i cookie per migliorare la tua esperienza.", accept: "Accetta" },
    es: { header: "🔐 Conectar billetera",      guidePrefix: "¿No tienes cartera? ", guideLink: "Aquí tienes una guía de 2 minutos.", connect: "Conectar con {name}", back: "Volver a la página de inicio de sesión", cookie: "Este sitio utiliza cookies para mejorar tu experiencia.", accept: "Aceptar" },
    pt: { header: "🔐 Conectar carteira",       guidePrefix: "Ainda não tem uma carteira? ", guideLink: "Aqui está um guia de 2 minutos.", connect: "Conectar com {name}", back: "Voltar à página de login", cookie: "Este site usa cookies para melhorar sua experiência.", accept: "Aceitar" },
    ja: { header: "🔐 ウォレットを接続",         guidePrefix: "まだウォレットがないですか？ ", guideLink: "2分ガイドはこちら。", connect: "{name}で接続", back: "ログインページに戻る",      cookie: "このサイトではクッキーを使用してユーザー体験を向上させています。", accept: "同意する" },
    hi: { header: "🔐 वॉलेट कनेक्ट करें",       guidePrefix: "अभी तक वॉलेट नहीं है? ", guideLink: "यहाँ 2-मिनट मार्गदर्शिका है।", connect: "{name} से कनेक्ट करें", back: "लॉगिन पेज पर वापस जाएँ", cookie: "यह वेबसाइट आपके अनुभव को बेहतर बनाने के लिए कुकीज़ का उपयोग करती है।", accept: "स्वीकार करें" },
    af: { header: "🔐 Sluit beursie aan",       guidePrefix: "Nog geen beursie? ", guideLink: "Hier is ’n 2-minuut gids.", connect: "Verbind met {name}", back: "Terug na aanmeldbladsy",      cookie: "Hierdie webwerf gebruik koekies om u ervaring te verbeter.", accept: "Aksepteer" }
  };

  const t = translations[language];
  const connectText = t.connect.replace("{name}", connectors.find(c => c.id === connector).name);
  const currentLang = languages.find(l => l.code === language);

  async function connectHandler() {
    if (!token) {
      alert(t.guidePrefix + connectText);
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
          projectId: process.env.REACT_APP_WC_PROJECT_ID,
          rpcMap: { 1: process.env.REACT_APP_INFURA_URL },
          chains: [1],
          showQrModal: true
        });
        await wc.enable();
        provider = new ethers.BrowserProvider(wc);

      } else /* coinbase */ {
        const cbWallet = new CoinbaseWalletSDK({ appName: "MeinShop", darkMode: false });
        const cbProv = cbWallet.makeWeb3Provider(process.env.REACT_APP_INFURA_URL, 1);
        await cbProv.request({ method: "eth_requestAccounts" });
        provider = new ethers.BrowserProvider(cbProv);
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Zusätzliche Signatur für MetaMask & Coinbase
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

      // EIP-4361 Flow: Nonce holen, signieren, verifizieren
      const nonceRes = await fetch(`/api/nonce?token=${token}`);
      if (!nonceRes.ok) throw new Error("Nonce konnte nicht geladen werden");
      const { nonce } = await nonceRes.json();
      const signature = await signer.signMessage(`Bitte bestätige: ${nonce}`);
      const verifyRes = await fetch(`/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, address, signature, nonce })
      });
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || !verifyJson.success) {
        throw new Error("Signatur ungültig – bitte erneut versuchen.");
      }

      // Weiterleitung
      window.location.href = `https://www.goldsilverstuff.com/wallet-callback?token=${token}&wallet=${address}`;

    } catch (err) {
      console.error(err);
      alert(`⚠️ Fehler: ${err.message}`);
    }
  }

  return (
    <>
      <div style={{ position: '}
