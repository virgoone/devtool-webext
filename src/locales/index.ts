import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    global: {
      name: "Devtool",
      extName: "Devtool - Operational auxiliary tools",
      extDescription: "Operational auxiliary tools for web development."
    },
    popup: {
      input: {
        placeholder: "Enter text or link to generate QR code"
      },
      button: {
        copy: "Copy image",
        copying: "Copying...",
        copySuccess: "Copied",
        copyError: "Copy failed",
        download: "Download image"
      },
      donate: "Donate to the author",
      help: "Help | Changelog",
      wechat: "Author weChat",
      contact: "Communication",
      qqGroup: "QQ group",
      telegramGroup: "Telegram group",
      wechatGroup: "WeChat group",
      batchExportAuthor: "Batch export $1 information",
      batchExportPost: "Batch export $1 data",
      batchExportPostByUrl: "Export based on $1 links",
      batchExportPostComment: "Batch export $1 comments"
    },
    options: {
      title: "Options",
      general: {
        basic: "Basic Settings",
        help: "Help",
        feedback: "Feedback"
      },
      basic: {
        title: "Basic Settings",
        appearance: {
          title: "Appearance",
          theme: "Theme",
          placeholder: "Select theme",
          options: {
            auto: "Auto",
            light: "Light",
            dark: "Dark"
          }
        },
        language: {
          title: "Language",
          placeholder: "Select language",
          options: {
            zh: "简体中文",
            en: "English"
          }
        },
        ai: {
          title: "AI Settings",
          provider: {
            title: "Provider",
            placeholder: "Select provider",
            options: {
              openai: "OpenAI",
              xai: "X AI",
            }
          },
          apikey: {
            title: "API Key",
            placeholder: "Enter your API key",
            description: "Your API key is stored in your browser and will never be sent elsewhere."
          },
          model: {
            title: "Model",
            placeholder: "Select model",
            refreshBtn: "Refresh",
          },
          customWebsite: {
            title: "Custom Website",
            placeholder: "Enter your custom website url",
          },
          customModel: {
            title: "Custom Model",
            placeholder: "Enter your custom model name",
          }
        },
        form: {
          reset: "Reset",
          save: "Save",
        }
      }
    },
    content: {
      mods: {
        scanQRCodeModal: {
          title: "Scanned QR code content",
          error: {
            invalidUrl: "Content is not a valid URL"
          },
          button: {
            openLink: "Open link",
            link: "Link",
            content: "Content",
            copy: "Copy",
            copySuccess: "Copied",
            copyError: "Copy failed"
          }
        },
        genQRCodeModal: {
          title: "Generate QR code",
          input: {
            placeholder: "Enter text or link to generate QR code"
          },
          button: {
            copy: "Copy image",
            copying: "Copying...",
            copySuccess: "Copied",
            copyError: "Copy failed",
            download: "Download image"
          }
        }
      }
    }
  },
  zh: {
    global: {
      name: "程序员助手",
      extName: "程序员助手 - 开发辅助工具",
      extDescription: "开发辅助工具，支持一键生成二维码、扫码识别二维码等..."
    },
    popup: {
      input: {
        placeholder: "输入文字或链接生成二维码"
      },
      button: {
        copy: "复制图片",
        copySuccess: "已复制",
        copyError: "复制失败",
        download: "下载图片"
      },
      contact: "沟通交流",
      telegramGroup: "Telegram交流群",
      qqGroup: "QQ交流群",
      wechatGroup: "微信交流群",
      wechat: "作者微信",
      donate: "打赏作者",
      help: "帮助｜更新日志"
    },
    options: {
      title: "设置",
      general: {
        basic: "基础设置",
        help: "帮助",
        feedback: "反馈"
      },
      basic: {
        title: "基础设置",
        appearance: {
          title: "外观",
          theme: "主题",
          placeholder: "选择主题",
          options: {
            auto: "自动",
            light: "浅色",
            dark: "深色"
          }
        },
        language: {
          title: "语言",
          placeholder: "选择语言",
          options: {
            zh: "简体中文",
            en: "English"
          }
        },
        ai: {
          title: "AI 访问",
          provider: {
            title: "服务提供商",
            placeholder: "选择服务提供商",
            options: {
              openai: "OpenAI",
              xai: "X AI",
            }
          },
          apikey: {
            title: "API Key",
            placeholder: "输入API KEY",
            description: "您的API密钥存储在您的浏览器中，绝不会发送到其他地方。"
          },
          model: {
            title: "模型",
            placeholder: "选择模型",
            refreshBtn: "刷新模型",
          },
          customWebsite: {
            title: "使用我自己的网址",
            placeholder: "请输入自定义网址地址",
          },
          customModel: {
            title: "使用自定义模型名称",
            placeholder: "请输入自定义模型名称",
          }
        },
        form: {
          reset: "恢复默认",
          save: "保 存",
        }
      }
    },
    content: {
      mods: {
        scanQRCodeModal: {
          title: "解析二维码",
          error: {
            invalidUrl: "内容不是有效的URL"
          },
          button: {
            openLink: "打开链接",
            link: "链接",
            content: "内容",
            copy: "复制",
            copySuccess: "已复制",
            copyError: "复制失败"
          }
        },
        genQRCodeModal: {
          title: "生成二维码",
          input: {
            placeholder: "输入文字或链接生成二维码"
          },
          button: {
            copy: "复制图片",
            copying: "复制中...",
            copySuccess: "已复制",
            copyError: "复制失败",
            download: "下载图片"
          }
        }
      }
    }
  }
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n
