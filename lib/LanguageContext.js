"use client";

import { createContext, useContext, useState, useEffect } from "react";
import translations from "./translations.json";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  // Load language from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("parai-lang");
    if (saved && (saved === "en" || saved === "ta")) {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const next = language === "en" ? "ta" : "en";
    setLanguage(next);
    localStorage.setItem("parai-lang", next);
  };

  const t = (path) => {
    const keys = path.split(".");
    let result = translations[language];
    for (const key of keys) {
      result = result?.[key];
    }
    return result || path;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
