import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "hu";

interface Translations {
  // Header
  appName: string;
  create: string;
  library: string;
  explore: string;
  pricing: string;
  signIn: string;
  getApp: string;

  // Hero
  tagline: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDescription: string;

  // Mode Selector
  selectStyle: string;
  formal: string;
  creative: string;
  technical: string;
  marketing: string;
  formalDesc: string;
  creativeDesc: string;
  technicalDesc: string;
  marketingDesc: string;

  // Prompt Input
  placeholder: string;
  fileButton: string;
  characters: string;
  supportedFormats: string;
  imageLoaded: string;
  fileLoaded: string;
  fileReadError: string;
  enhance: string;

  // Enhanced Result
  enhancedPrompt: string;
  newPrompt: string;
  copy: string;
  copied: string;
  copiedToClipboard: string;
  copyFailed: string;
  words: string;
  enhancing: string;
  promptSuccess: string;

  // History
  history: string;
  promptHistory: string;
  deleteAll: string;
  loading: string;
  noHistory: string;
  enhancedPromptLabel: string;
  useAsBase: string;
  delete: string;

  // Features Section
  howItWorks: string;
  simpleUsage: string;
  largeTexts: string;
  largeTextsDesc: string;
  fileUpload: string;
  fileUploadDesc: string;
  proPrompt: string;
  proPromptDesc: string;
  instantResult: string;
  instantResultDesc: string;

  // Footer
  updates: string;
  privacyPolicy: string;
  terms: string;
  copyright: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Header
    appName: "PromptCraft",
    create: "Create",
    library: "Library",
    explore: "Explore",
    pricing: "Pricing",
    signIn: "Sign In",
    getApp: "Get App",

    // Hero
    tagline: "AI Prompt Enhancer",
    heroTitle1: "Transform into",
    heroTitle2: "pro prompts",
    heroDescription: "Paste your text, upload a file or image, and PromptCraft transforms it into a professional, well-structured prompt.",

    // Mode Selector
    selectStyle: "Select style",
    formal: "Formal",
    creative: "Creative",
    technical: "Technical",
    marketing: "Marketing",
    formalDesc: "Professional, business style",
    creativeDesc: "Creative, expressive style",
    technicalDesc: "Precise, detailed description",
    marketingDesc: "Persuasive, sales style",

    // Prompt Input
    placeholder: "Paste your text, upload a file or image... (Ctrl+Enter to submit)",
    fileButton: "File / Image",
    characters: "characters",
    supportedFormats: "Supported formats: .md, .txt, .jpg, .png",
    imageLoaded: "image loaded",
    fileLoaded: "successfully loaded",
    fileReadError: "Failed to read file",
    enhance: "Enhance",

    // Enhanced Result
    enhancedPrompt: "Enhanced Prompt",
    newPrompt: "New prompt",
    copy: "Copy",
    copied: "Copied",
    copiedToClipboard: "Copied to clipboard!",
    copyFailed: "Failed to copy",
    words: "words",
    enhancing: "Enhancing prompt...",
    promptSuccess: "Prompt enhanced successfully!",

    // History
    history: "History",
    promptHistory: "Prompt history",
    deleteAll: "Delete all",
    loading: "Loading...",
    noHistory: "No history yet",
    enhancedPromptLabel: "Enhanced prompt:",
    useAsBase: "Use as new base →",
    delete: "Delete",

    // Features Section
    howItWorks: "How It Works?",
    simpleUsage: "Simple usage, professional results.",
    largeTexts: "Large Texts",
    largeTextsDesc: "Paste thousands of characters, PromptCraft processes everything.",
    fileUpload: "File Upload",
    fileUploadDesc: "Upload .md, .txt files and the AI processes them automatically.",
    proPrompt: "Pro Prompt",
    proPromptDesc: "AI analyzes the content and creates a professional, well-structured prompt.",
    instantResult: "Instant Result",
    instantResultDesc: "Real-time streaming response - watch as the enhanced prompt is created.",

    // Footer
    updates: "Updates",
    privacyPolicy: "Privacy Policy",
    terms: "Terms",
    copyright: "© 2025 PromptCraft. All rights reserved.",
  },
  hu: {
    // Header
    appName: "PromptCraft",
    create: "Létrehozás",
    library: "Könyvtár",
    explore: "Felfedezés",
    pricing: "Árazás",
    signIn: "Bejelentkezés",
    getApp: "Alkalmazás",

    // Hero
    tagline: "AI Prompt Javító",
    heroTitle1: "Alakítsd át",
    heroTitle2: "profi prompttá",
    heroDescription: "Illeszd be a szöveged, tölts fel fájlt vagy képet, és a PromptCraft átalakítja professzionális, jól strukturált prompttá.",

    // Mode Selector
    selectStyle: "Válassz stílust",
    formal: "Formális",
    creative: "Kreatív",
    technical: "Technikai",
    marketing: "Marketing",
    formalDesc: "Professzionális, üzleti stílus",
    creativeDesc: "Kreatív, kifejező stílus",
    technicalDesc: "Precíz, részletes leírás",
    marketingDesc: "Meggyőző, értékesítő stílus",

    // Prompt Input
    placeholder: "Illeszd be a szöveget, tölts fel fájlt vagy képet... (Ctrl+Enter a küldéshez)",
    fileButton: "Fájl / Kép",
    characters: "karakter",
    supportedFormats: "Támogatott formátumok: .md, .txt, .jpg, .png",
    imageLoaded: "kép betöltve",
    fileLoaded: "sikeresen betöltve",
    fileReadError: "Nem sikerült beolvasni a fájlt",
    enhance: "Javítás",

    // Enhanced Result
    enhancedPrompt: "Javított Prompt",
    newPrompt: "Új prompt",
    copy: "Másolás",
    copied: "Másolva",
    copiedToClipboard: "Vágólapra másolva!",
    copyFailed: "Nem sikerült másolni",
    words: "szó",
    enhancing: "Prompt javítása folyamatban...",
    promptSuccess: "Prompt sikeresen javítva!",

    // History
    history: "Előzmények",
    promptHistory: "Prompt előzmények",
    deleteAll: "Összes törlése",
    loading: "Betöltés...",
    noHistory: "Még nincs előzmény",
    enhancedPromptLabel: "Javított prompt:",
    useAsBase: "Használat új alapként →",
    delete: "Törlés",

    // Features Section
    howItWorks: "Hogyan Működik?",
    simpleUsage: "Egyszerű használat, profi eredmény.",
    largeTexts: "Nagy Szövegek",
    largeTextsDesc: "Másold be akár több ezer karakternyi szöveget is, a PromptCraft mindent feldolgoz.",
    fileUpload: "Fájl Feltöltés",
    fileUploadDesc: "Tölts fel .md, .txt fájlokat és az AI automatikusan feldolgozza.",
    proPrompt: "Profi Prompt",
    proPromptDesc: "Az AI elemzi a tartalmat és professzionális, jól strukturált promptot készít.",
    instantResult: "Azonnali Eredmény",
    instantResultDesc: "Valós idejű streaming válasz - látod ahogy készül a javított prompt.",

    // Footer
    updates: "Frissítések",
    privacyPolicy: "Adatvédelmi irányelvek",
    terms: "Felhasználási feltételek",
    copyright: "© 2025 PromptCraft. Minden jog fenntartva.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language;
      if (saved && (saved === "en" || saved === "hu")) return saved;
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("hu")) return "hu";
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
