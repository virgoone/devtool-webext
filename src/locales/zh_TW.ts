export default {
  name: "程式員助手",
  extName: "程式員助手 - 開發輔助工具",
  extDescription: "開發輔助工具，支援一鍵生成二維碼、掃碼識別二維碼等...",
  popup: {
    input: {
      placeholder: "輸入文字或連結生成二維碼"
    },
    button: {
      copy: "複製圖片",
      copySuccess: "已複製",
      copyError: "複製失敗",
      download: "下載圖片"
    },
    contact: "溝通交流",
    telegramGroup: "Telegram交流群",
    qqGroup: "QQ交流群",
    wechatGroup: "微信交流群",
    wechat: "作者微信",
    donate: "打賞作者",
    help: "幫助｜更新日誌"
  },
  options: {
    title: "設定",
    general: {
      basic: "基礎設定",
      qrRules: "二維碼規則",
      help: "幫助",
      feedback: "回饋"
    },
    basic: {
      title: "基礎設定",
      appearance: {
        title: "外觀",
        theme: "主題",
        placeholder: "選擇主題",
        options: {
          auto: "自動",
          light: "淺色",
          dark: "深色"
        }
      },
      language: {
        title: "語言",
        placeholder: "選擇語言",
        options: {
          zh: "繁體中文",
          en: "英文"
        }
      },
      ai: {
        title: "AI 存取",
        provider: {
          title: "服務提供商",
          placeholder: "選擇服務提供商",
          options: {
            openai: "OpenAI",
            xai: "X AI"
          }
        },
        apikey: {
          title: "API Key",
          placeholder: "輸入API KEY",
          description: "您的API密鑰存儲在您的瀏覽器中，絕不會發送到其他地方。"
        },
        model: {
          title: "模型",
          placeholder: "選擇模型",
          refreshBtn: "重新整理模型"
        },
        customWebsite: {
          title: "使用我自己的網址",
          placeholder: "請輸入自定義網址地址"
        },
        customModel: {
          title: "使用自定義模型名稱",
          placeholder: "請輸入自定義模型名稱"
        }
      },
      form: {
        reset: "重置",
        save: "儲存"
      }
    },
    qrRules: {
      title: "二維碼規則配置",
      globalSwitch: {
        title: "啟用二維碼規則",
        description: "開啟後，生成二維碼時會根據配置的規則自動拼接URL參數"
      },
      rulesList: {
        title: "規則列表",
        empty: "暫無規則，點擊\"新增規則\"開始配置"
      },
      buttons: {
        add: "新增規則",
        edit: "編輯",
        delete: "刪除",
        import: "導入規則",
        export: "匯出規則",
        save: "儲存",
        cancel: "取消",
        addParameter: "新增參數"
      },
      dialog: {
        addTitle: "新增規則",
        editTitle: "編輯規則",
        ruleName: "規則名稱",
        ruleNamePlaceholder: "例如：認證參數組",
        ruleDescription: "描述（可選）",
        ruleDescriptionPlaceholder: "規則說明...",
        ruleEnabled: "啟用此規則",
        domainPattern: "域名匹配",
        domainPatternPlaceholder: "例如：*.baidu.com 或 https://example.com",
        domainPatternDescription: "支援通配符 * 匹配，預設 * 表示匹配所有域名",
        parameters: {
          title: "參數配置",
          empty: "暫無參數，點擊\"新增參數\"開始配置",
          paramKey: "參數鍵",
          paramKeyPlaceholder: "例如：auth, adsource",
          paramType: "參數類型",
          fixedType: "固定參數 - 設定固定值，生成時自動拼接",
          inputType: "輸入參數 - 生成時顯示輸入框，使用者手動輸入",
          paramValue: "參數值",
          paramValuePlaceholder: "例如：1, true, user",
          paramDefaultValue: "預設值（可選）",
          paramDefaultValuePlaceholder: "輸入參數的預設值",
          deleteParam: "刪除參數"
        }
      },
      messages: {
        importSuccess: "規則導入成功",
        importError: "導入失敗：JSON格式錯誤",
        exportSuccess: "規則匯出成功",
        addSuccess: "規則新增成功",
        updateSuccess: "規則更新成功",
        deleteSuccess: "規則刪除成功",
        validationError: "規則名稱不能為空",
        paramValidationError: "參數鍵不能為空",
        fixedValueRequired: "固定參數必須設定值"
      }
    }
  },
  // Content script translations
  scanQRCodeModalTitle: "解析二維碼",
  genQRCodeModalTitle: "生成二維碼",
  originalUrl: "原始連結",
  qrPlaceholder: "輸入文字或連結生成二維碼",
  urlConfig: "URL參數配置",
  urlConfigDesc: "配置要新增到連結中的參數",
  generatedUrl: "生成的連結",
  finalUrl: "最終連結",
  copyImage: "複製圖片",
  copying: "複製中...",
  copySuccess: "已複製",
  copyError: "複製失敗",
  downloadImage: "下載圖片",
  copyLink: "複製連結",
  copyEncodeLink: "複製編碼連結",
  linkCopied: "連結已複製到剪貼簿",
  linkCopyFailed: "複製連結失敗",
  encodeLinkCopied: "編碼連結已複製到剪貼簿",
  encodeLinkCopyFailed: "複製編碼連結失敗",
  invalidUrl: "內容不是有效的URL",
  openLink: "開啟連結",
  link: "連結",
  content: "內容",
  copy: "複製",
  linkQRInjectorTitle: "連結二維碼圖示",
  linkQRInjectorDescription: "在頁面連結旁顯示二維碼圖示，點擊生成二維碼"
}
