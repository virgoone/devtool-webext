import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { storage } from "@wxt-dev/storage";

// 导入 TS 翻译文件
import enTranslations from "./en";
import zhCNTranslations from "./zh_CN";
import zhTWTranslations from "./zh_TW";

// 配置资源
const resources = {
  en: {
    translation: enTranslations,
  },
  zh: {
    translation: zhCNTranslations,
  },
  "zh-TW": {
    translation: zhTWTranslations,
  },
};

// 初始化 i18next
i18n.use(initReactI18next).init({
  resources,
  lng: "zh", // 默认语言
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React 已经安全处理了
  },
  debug: false,
});

// 从存储中加载语言设置
async function loadLanguageFromStorage() {
  try {
    const config = await storage.getItem("local:appConfig");
    if (config && typeof config === "object" && "language" in config) {
      const language = (config as any).language;
      if (language && typeof language === "string") {
        await i18n.changeLanguage(language);
      }
    }
  } catch (error) {
    console.warn("Failed to load language from storage:", error);
  }
}

// 监听语言变化
storage.watch("local:appConfig", (newConfig) => {
  if (newConfig && typeof newConfig === "object" && "language" in newConfig) {
    const language = (newConfig as any).language;
    if (language && typeof language === "string" && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }
});

// 初始化语言
loadLanguageFromStorage();

export { i18n };
export default i18n;