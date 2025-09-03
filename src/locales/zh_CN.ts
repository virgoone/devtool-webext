export default {
  name: "程序员助手",
  extName: "程序员助手 - 开发辅助工具",
  extDescription: "开发辅助工具，支持一键生成二维码、扫码识别二维码等...",
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
      qrRules: "二维码规则",
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
          en: "英文"
        }
      },
      ai: {
        title: "AI 访问",
        provider: {
          title: "服务提供商",
          placeholder: "选择服务提供商",
          options: {
            openai: "OpenAI",
            xai: "X AI"
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
          refreshBtn: "刷新模型"
        },
        customWebsite: {
          title: "使用我自己的网址",
          placeholder: "请输入自定义网址地址"
        },
        customModel: {
          title: "使用自定义模型名称",
          placeholder: "请输入自定义模型名称"
        }
      },
      form: {
        reset: "重置",
        save: "保存"
      }
    },
    qrRules: {
      title: "二维码规则配置",
      globalSwitch: {
        title: "启用二维码规则",
        description: "开启后，生成二维码时会根据配置的规则自动拼接URL参数"
      },
      rulesList: {
        title: "规则列表",
        empty: "暂无规则，点击\"添加规则\"开始配置"
      },
      buttons: {
        add: "添加规则",
        edit: "编辑",
        delete: "删除",
        import: "导入规则",
        export: "导出规则",
        save: "保存",
        cancel: "取消",
        addParameter: "添加参数"
      },
      dialog: {
        addTitle: "添加规则",
        editTitle: "编辑规则",
        ruleName: "规则名称",
        ruleNamePlaceholder: "例如：认证参数组",
        ruleDescription: "描述（可选）",
        ruleDescriptionPlaceholder: "规则说明...",
        ruleEnabled: "启用此规则",
        domainPattern: "域名匹配",
        domainPatternPlaceholder: "例如：*.baidu.com 或 https://example.com",
        domainPatternDescription: "支持通配符 * 匹配，默认 * 表示匹配所有域名",
        parameters: {
          title: "参数配置",
          empty: "暂无参数，点击\"添加参数\"开始配置",
          paramKey: "参数键",
          paramKeyPlaceholder: "例如：auth, adsource",
          paramType: "参数类型",
          fixedType: "固定参数 - 设置固定值，生成时自动拼接",
          inputType: "输入参数 - 生成时显示输入框，用户手动输入",
          paramValue: "参数值",
          paramValuePlaceholder: "例如：1, true, user",
          paramDefaultValue: "默认值（可选）",
          paramDefaultValuePlaceholder: "输入参数的默认值",
          deleteParam: "删除参数"
        }
      },
      messages: {
        importSuccess: "规则导入成功",
        importError: "导入失败：JSON格式错误",
        exportSuccess: "规则导出成功",
        addSuccess: "规则添加成功",
        updateSuccess: "规则更新成功",
        deleteSuccess: "规则删除成功",
        validationError: "规则名称不能为空",
        paramValidationError: "参数键不能为空",
        fixedValueRequired: "固定参数必须设置值"
      }
    }
  },
  // Content script translations
  scanQRCodeModalTitle: "解析二维码",
  genQRCodeModalTitle: "生成二维码",
  originalUrl: "原始链接",
  qrPlaceholder: "输入文字或链接生成二维码",
  urlConfig: "URL参数配置",
  urlConfigDesc: "配置要添加到链接中的参数",
  generatedUrl: "生成的链接",
  finalUrl: "最终链接",
  copyImage: "复制图片",
  copying: "复制中...",
  copySuccess: "已复制",
  copyError: "复制失败",
  downloadImage: "下载图片",
  copyLink: "复制链接",
  copyEncodeLink: "复制编码链接",
  linkCopied: "链接已复制到剪贴板",
  linkCopyFailed: "复制链接失败",
  encodeLinkCopied: "编码链接已复制到剪贴板",
  encodeLinkCopyFailed: "复制编码链接失败",
  invalidUrl: "内容不是有效的URL",
  openLink: "打开链接",
  link: "链接",
  content: "内容",
  copy: "复制",
  linkQRInjectorTitle: "链接二维码图标",
  linkQRInjectorDescription: "在页面链接旁显示二维码图标，点击生成二维码"
}
