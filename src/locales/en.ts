export default {
  name: "Devtool",
  extName: "Devtool - Operational auxiliary tools",
  extDescription: "Operational auxiliary tools for web development.",
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
      qrRules: "QR Rules",
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
          zh: "Simplified Chinese",
          en: "English"
        }
      },
      ai: {
        title: "AI Access",
        provider: {
          title: "Service Provider",
          placeholder: "Select service provider",
          options: {
            openai: "OpenAI",
            xai: "X AI"
          }
        },
        apikey: {
          title: "API Key",
          placeholder: "Enter API KEY",
          description: "Your API key is stored in your browser and is never sent anywhere else."
        },
        model: {
          title: "Model",
          placeholder: "Select model",
          refreshBtn: "Refresh models"
        },
        customWebsite: {
          title: "Use my own website",
          placeholder: "Enter custom website address"
        },
        customModel: {
          title: "Use custom model name",
          placeholder: "Enter custom model name"
        }
      },
      form: {
        reset: "Reset",
        save: "Save"
      }
    },
    qrRules: {
      title: "QR Code Rules Configuration",
      globalSwitch: {
        title: "Enable QR Rules",
        description: "When enabled, URL parameters will be automatically appended when generating QR codes"
      },
      rulesList: {
        title: "Rules List",
        empty: "No rules yet, click \"Add Rule\" to start configuring"
      },
      buttons: {
        add: "Add Rule",
        edit: "Edit",
        delete: "Delete",
        import: "Import Rules",
        export: "Export Rules",
        save: "Save",
        cancel: "Cancel",
        addParameter: "Add Parameter"
      },
      dialog: {
        addTitle: "Add Rule",
        editTitle: "Edit Rule",
        ruleName: "Rule Name",
        ruleNamePlaceholder: "e.g.: Authentication Parameter Group",
        ruleDescription: "Description (Optional)",
        ruleDescriptionPlaceholder: "Rule description...",
        ruleEnabled: "Enable this rule",
        domainPattern: "Domain Pattern",
        domainPatternPlaceholder: "e.g.: *.baidu.com or https://example.com",
        domainPatternDescription: "Supports wildcard * matching, default * matches all domains",
        parameters: {
          title: "Parameter Configuration",
          empty: "No parameters yet, click \"Add Parameter\" to start configuring",
          paramKey: "Parameter Key",
          paramKeyPlaceholder: "e.g.: auth, adsource",
          paramType: "Parameter Type",
          fixedType: "Fixed Parameter - Set fixed value, automatically append when generating",
          inputType: "Input Parameter - Show input field when generating, user enters manually",
          paramValue: "Parameter Value",
          paramValuePlaceholder: "e.g.: 1, true, user",
          paramDefaultValue: "Default Value (Optional)",
          paramDefaultValuePlaceholder: "Default value for input parameter",
          deleteParam: "Delete Parameter"
        }
      },
      messages: {
        importSuccess: "Rules imported successfully",
        importError: "Import failed: Invalid JSON format",
        exportSuccess: "Rules exported successfully",
        addSuccess: "Rule added successfully",
        updateSuccess: "Rule updated successfully",
        deleteSuccess: "Rule deleted successfully",
        validationError: "Rule name cannot be empty",
        paramValidationError: "Parameter key cannot be empty",
        fixedValueRequired: "Fixed parameter must have a value"
      }
    }
  },
  // Content script translations
  scanQRCodeModalTitle: "Scanned QR code content",
  genQRCodeModalTitle: "Generate QR code",
  originalUrl: "Original URL",
  qrPlaceholder: "Enter text or link to generate QR code",
  urlConfig: "URL Parameters Config",
  urlConfigDesc: "Configure parameters to add to the link",
  generatedUrl: "Generated URL",
  finalUrl: "Final URL",
  copyImage: "Copy image",
  copying: "Copying...",
  copySuccess: "Copied",
  copyError: "Copy failed",
  downloadImage: "Download image",
  copyLink: "Copy Link",
  copyEncodeLink: "Copy Encoded Link",
  linkCopied: "Link copied to clipboard",
  linkCopyFailed: "Failed to copy link",
  encodeLinkCopied: "Encoded link copied to clipboard",
  encodeLinkCopyFailed: "Failed to copy encoded link",
  invalidUrl: "Content is not a valid URL",
  openLink: "Open link",
  link: "Link",
  content: "Content",
  copy: "Copy",
  linkQRInjectorTitle: "Link QR Icons",
  linkQRInjectorDescription: "Show QR code icons next to page links, click to generate QR code"
}
