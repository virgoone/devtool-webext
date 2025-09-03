import type { Voice } from "rt-client"

import {
  DEFAULT_INPUT_TEMPLATE,
  DEFAULT_SIDEBAR_WIDTH,
  DEFAULT_TTS_ENGINE,
  DEFAULT_TTS_ENGINES,
  DEFAULT_TTS_MODEL,
  DEFAULT_TTS_MODELS,
  DEFAULT_TTS_VOICE,
  DEFAULT_TTS_VOICES,
  ServiceProvider,
  StoreKey
} from "@/constants"
import { createPersistStore } from "@/utils/store"
import { DalleQuality, DalleSize, DalleStyle } from "@/utils/typing"

export type TTSModelType = (typeof DEFAULT_TTS_MODELS)[number]
export type TTSVoiceType = (typeof DEFAULT_TTS_VOICES)[number]
export type TTSEngineType = (typeof DEFAULT_TTS_ENGINES)[number]

// QR URL 规则类型定义
export enum QRRuleType {
  Fixed = "fixed",    // 固定参数，如 auth=1
  Input = "input"     // 输入参数，如 adsource={用户输入}
}

export interface QRParameter {
  id: string          // 参数唯一ID
  key: string         // 参数键，如 "auth"
  type: QRRuleType    // 规则类型
  value?: string      // 固定参数的值，如 "1"
  defaultValue?: string // 输入参数的默认值
}

export interface QRRule {
  id: string
  name: string        // 规则名称，如 "认证参数组"
  parameters: QRParameter[]  // 多个参数
  enabled: boolean    // 是否启用
  description?: string // 规则描述
  domainPattern: string // 域名匹配规则，默认 "*" 匹配所有域名
}

export interface QRRulesConfig {
  rules: QRRule[]
  globalEnabled: boolean  // 全局启用开关
}

export enum SubmitKey {
  Enter = "Enter",
  CtrlEnter = "Ctrl + Enter",
  ShiftEnter = "Shift + Enter",
  AltEnter = "Alt + Enter",
  MetaEnter = "Meta + Enter"
}

export enum Theme {
  Auto = "auto",
  Dark = "dark",
  Light = "light"
}

export enum Language {
  zh = "zh",
  en = "en"
}

export const DEFAULT_CONFIG = {
  lastUpdate: Date.now(), // timestamp, to merge state
  language: Language.zh,
  submitKey: SubmitKey.Enter,
  avatar: "1f603",
  fontSize: 14,
  fontFamily: "",
  theme: Theme.Auto as Theme,
  sendPreviewBubble: true,
  enableAutoGenerateTitle: true,
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,

  enableArtifacts: true, // show artifacts config

  enableCodeFold: true, // code fold config

  disablePromptHint: false,

  dontShowMaskSplashScreen: false, // dont show splash screen when create chat
  hideBuiltinMasks: false, // dont add builtin masks

  enableLinkQRIcons: true, // show QR code icons next to links

  qrRulesConfig: {
    globalEnabled: true,
    rules: [
      {
        id: "default_params",
        name: "默认参数组",
        parameters: [
          {
            id: "param_auth",
            key: "auth",
            type: QRRuleType.Fixed,
            value: "1"
          },
          {
            id: "param_originUrl",
            key: "originUrl",
            type: QRRuleType.Fixed,
            value: "1"
          }
        ],
        enabled: true,
        description: "包含常用的默认参数",
        domainPattern: "*"
      }
    ]
  } as QRRulesConfig,

  modelConfig: {
    providerName: "OpenAI" as ServiceProvider,
    apiKey: "",
    temperature: 0.5,
    top_p: 1,
    max_tokens: 4000,
    presence_penalty: 0,
    frequency_penalty: 0,
    sendMemory: true,
    historyMessageCount: 4,
    compressMessageLengthThreshold: 1000,
    compressModel: "",
    compressProviderName: "",
    enableInjectSystemPrompts: true,
    template: DEFAULT_INPUT_TEMPLATE,
    size: "1024x1024" as DalleSize,
    quality: "standard" as DalleQuality,
    style: "vivid" as DalleStyle
  },

  ttsConfig: {
    enable: false,
    autoplay: false,
    engine: DEFAULT_TTS_ENGINE,
    model: DEFAULT_TTS_MODEL,
    voice: DEFAULT_TTS_VOICE,
    speed: 1.0
  }
}

export type ChatConfig = typeof DEFAULT_CONFIG

export type ModelConfig = ChatConfig["modelConfig"]
export type TTSConfig = ChatConfig["ttsConfig"]

export function limitNumber(
  x: number,
  min: number,
  max: number,
  defaultValue: number
) {
  if (isNaN(x)) {
    return defaultValue
  }

  return Math.min(max, Math.max(min, x))
}

export const TTSConfigValidator = {
  engine(x: string) {
    return x as TTSEngineType
  },
  model(x: string) {
    return x as TTSModelType
  },
  voice(x: string) {
    return x as TTSVoiceType
  },
  speed(x: number) {
    return limitNumber(x, 0.25, 4.0, 1.0)
  }
}

export const ModalConfigValidator = {
  max_tokens(x: number) {
    return limitNumber(x, 0, 512000, 1024)
  },
  presence_penalty(x: number) {
    return limitNumber(x, -2, 2, 0)
  },
  frequency_penalty(x: number) {
    return limitNumber(x, -2, 2, 0)
  },
  temperature(x: number) {
    return limitNumber(x, 0, 2, 1)
  },
  top_p(x: number) {
    return limitNumber(x, 0, 1, 1)
  }
}

export const useAppConfig = createPersistStore(
  { ...DEFAULT_CONFIG },
  (set, get) => ({
    reset() {
      set(() => ({ ...DEFAULT_CONFIG }))
    },

    setTheme(theme: Theme) {
      set(() => ({ theme }))
    },

    setLanguage(language: Language) {
      set(() => ({
        language
      }))
    },

    setEnableLinkQRIcons(enableLinkQRIcons: boolean) {
      set(() => ({
        enableLinkQRIcons
      }))
    },

    setQRRulesConfig(qrRulesConfig: QRRulesConfig) {
      set(() => ({
        qrRulesConfig
      }))
    },

    addQRRule(rule: QRRule) {
      const config = get()
      set(() => ({
        qrRulesConfig: {
          ...config.qrRulesConfig,
          rules: [...config.qrRulesConfig.rules, rule]
        }
      }))
    },

    updateQRRule(ruleId: string, updates: Partial<QRRule>) {
      const config = get()
      set(() => ({
        qrRulesConfig: {
          ...config.qrRulesConfig,
          rules: config.qrRulesConfig.rules.map(rule => 
            rule.id === ruleId ? { ...rule, ...updates } : rule
          )
        }
      }))
    },

    addQRParameter(ruleId: string, parameter: QRParameter) {
      const config = get()
      set(() => ({
        qrRulesConfig: {
          ...config.qrRulesConfig,
          rules: config.qrRulesConfig.rules.map(rule => 
            rule.id === ruleId 
              ? { ...rule, parameters: [...rule.parameters, parameter] }
              : rule
          )
        }
      }))
    },

    updateQRParameter(ruleId: string, parameterId: string, updates: Partial<QRParameter>) {
      const config = get()
      set(() => ({
        qrRulesConfig: {
          ...config.qrRulesConfig,
          rules: config.qrRulesConfig.rules.map(rule => 
            rule.id === ruleId 
              ? { 
                  ...rule, 
                  parameters: rule.parameters.map(param => 
                    param.id === parameterId ? { ...param, ...updates } : param
                  ) 
                }
              : rule
          )
        }
      }))
    },

    deleteQRParameter(ruleId: string, parameterId: string) {
      const config = get()
      set(() => ({
        qrRulesConfig: {
          ...config.qrRulesConfig,
          rules: config.qrRulesConfig.rules.map(rule => 
            rule.id === ruleId 
              ? { ...rule, parameters: rule.parameters.filter(param => param.id !== parameterId) }
              : rule
          )
        }
      }))
    },

    deleteQRRule(ruleId: string) {
      const config = get()
      set(() => ({
        qrRulesConfig: {
          ...config.qrRulesConfig,
          rules: config.qrRulesConfig.rules.filter(rule => rule.id !== ruleId)
        }
      }))
    },

    importQRRules(rules: QRRule[]) {
      const config = get()
      set(() => ({
        qrRulesConfig: {
          ...config.qrRulesConfig,
          rules: rules
        }
      }))
    },

    buildQRUrl(baseUrl: string, inputValues: Record<string, string> = {}, currentUrl?: string, enabledRulesState?: Record<string, boolean>): string {
      const config = get()
      if (!config.qrRulesConfig.globalEnabled) {
        return baseUrl
      }

      const url = new URL(baseUrl)
      
      // 简单的域名匹配函数
      const simpleMatchesPattern = (url: string, pattern: string): boolean => {
        if (pattern === "*") return true
        if (!url || !pattern) return true
        
        try {
          const urlObj = new URL(url)
          const host = urlObj.host
          
          if (pattern.includes("*")) {
            // 支持通配符匹配
            const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$")
            return regex.test(host)
          }
          
          return host === pattern || urlObj.origin === pattern
        } catch {
          return true
        }
      }
      
      // 过滤启用的规则，并根据域名匹配
      const enabledRules = config.qrRulesConfig.rules.filter(rule => {
        if (!rule.enabled) return false
        
        // 如果提供了临时启用状态，检查是否被临时禁用
        if (enabledRulesState && enabledRulesState.hasOwnProperty(rule.id)) {
          // 如果有明确的临时状态，使用临时状态
          if (!enabledRulesState[rule.id]) {
            return false
          }
        }
        
        // 如果没有提供当前URL，则跳过域名匹配
        if (!currentUrl) return true
        
        // 检查域名是否匹配
        return simpleMatchesPattern(currentUrl, rule.domainPattern || "*")
      })

      for (const rule of enabledRules) {
        for (const param of rule.parameters) {
          if (param.type === QRRuleType.Fixed && param.value) {
            url.searchParams.append(param.key, param.value)
          } else if (param.type === QRRuleType.Input && inputValues[param.id]) {
            url.searchParams.append(param.key, inputValues[param.id])
          }
        }
      }

      return url.toString()
    },

    mergeModels(newModels: any[]) {
      // if (!newModels || newModels.length === 0) {
      //   return
      // }
      // const oldModels = get().models
      // const modelMap: Record<string, LLMModel> = {}
      // for (const model of oldModels) {
      //   model.available = false
      //   modelMap[`${model.name}@${model?.provider?.id}`] = model
      // }
      // for (const model of newModels) {
      //   model.available = true
      //   modelMap[`${model.name}@${model?.provider?.id}`] = model
      // }
      // set(() => ({
      //   models: Object.values(modelMap)
      // }))
    },

    allModels() {}
  }),
  {
    name: StoreKey.Config,
    version: 4.1,

    merge(persistedState, currentState) {
      const state = persistedState as ChatConfig | undefined
      console.log("merge", state)
      if (!state) return { ...currentState }
      // const models = currentState.models.slice()
      // state.models.forEach((pModel) => {
      //   const idx = models.findIndex(
      //     (v) => v.name === pModel.name && v.provider === pModel.provider
      //   )
      //   if (idx !== -1) models[idx] = pModel
      //   else models.push(pModel)
      // })
      return { ...currentState, ...state, models: [] }
    },

    migrate(persistedState, version) {
      const state = persistedState as ChatConfig

      if (version < 4.1) {
        state.modelConfig.compressModel =
          DEFAULT_CONFIG.modelConfig.compressModel
        state.modelConfig.compressProviderName =
          DEFAULT_CONFIG.modelConfig.compressProviderName
      }

      return state as any
    }
  }
)
