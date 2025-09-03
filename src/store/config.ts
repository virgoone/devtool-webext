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
  language: Language.en,
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
