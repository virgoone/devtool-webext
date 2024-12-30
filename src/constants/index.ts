export const STABILITY_BASE_URL = "https://api.stability.ai"

export const OPENAI_BASE_URL = "https://api.openai.com"
export const ANTHROPIC_BASE_URL = "https://api.anthropic.com"

export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/"

export const BAIDU_BASE_URL = "https://aip.baidubce.com"
export const BAIDU_OATUH_URL = `${BAIDU_BASE_URL}/oauth/2.0/token`

export const BYTEDANCE_BASE_URL = "https://ark.cn-beijing.volces.com"

export const ALIBABA_BASE_URL = "https://dashscope.aliyuncs.com/api/"

export const TENCENT_BASE_URL = "https://hunyuan.tencentcloudapi.com"

export const MOONSHOT_BASE_URL = "https://api.moonshot.cn"
export const IFLYTEK_BASE_URL = "https://spark-api-open.xf-yun.com"

export const XAI_BASE_URL = "https://api.x.ai"

export const CHATGLM_BASE_URL = "https://open.bigmodel.cn"

export const CACHE_URL_PREFIX = "/api/cache"
export const UPLOAD_URL = `${CACHE_URL_PREFIX}/upload`

export enum Path {
  Home = "/",
  Chat = "/chat",
  Settings = "/settings",
  NewChat = "/new-chat",
  Masks = "/masks",
  Plugins = "/plugins",
  Auth = "/auth",
  Sd = "/sd",
  SdNew = "/sd-new",
  Artifacts = "/artifacts",
  SearchChat = "/search-chat"
}

export enum ApiPath {
  Cors = "",
  Azure = "/api/azure",
  OpenAI = "/api/openai",
  Anthropic = "/api/anthropic",
  Google = "/api/google",
  Baidu = "/api/baidu",
  ByteDance = "/api/bytedance",
  Alibaba = "/api/alibaba",
  Tencent = "/api/tencent",
  Moonshot = "/api/moonshot",
  Iflytek = "/api/iflytek",
  Stability = "/api/stability",
  Artifacts = "/api/artifacts",
  XAI = "/api/xai",
  ChatGLM = "/api/chatglm"
}

export enum SlotID {
  AppBody = "app-body",
  CustomModel = "custom-model"
}

export enum FileName {
  Masks = "masks.json",
  Prompts = "prompts.json"
}

export enum StoreKey {
  Chat = "wxt-devtool-store",
  Plugin = "wxt-devtool-plugin",
  Access = "access-control",
  Config = "app-config",
  Mask = "mask-store",
  Prompt = "prompt-store",
  Update = "chat-update",
  Sync = "sync",
  SdList = "sd-list"
}

export const DEFAULT_SIDEBAR_WIDTH = 300
export const MAX_SIDEBAR_WIDTH = 500
export const MIN_SIDEBAR_WIDTH = 230
export const NARROW_SIDEBAR_WIDTH = 100

export const ACCESS_CODE_PREFIX = "nk-"

export const LAST_INPUT_KEY = "last-input"
export const UNFINISHED_INPUT = (id: string) => "unfinished-input-" + id

export const STORAGE_KEY = "chatgpt-next-web"

export const REQUEST_TIMEOUT_MS = 60000

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown"

export enum ServiceProvider {
  OpenAI = "OpenAI",
  // Azure = "Azure",
  // Google = "Google",
  // Anthropic = "Anthropic",
  // Baidu = "Baidu",
  // ByteDance = "ByteDance",
  // Alibaba = "Alibaba",
  // Tencent = "Tencent",
  // Moonshot = "Moonshot",
  // Stability = "Stability",
  // Iflytek = "Iflytek",
  XAI = "XAI",
  // ChatGLM = "ChatGLM"
}

// Google API safety settings, see https://ai.google.dev/gemini-api/docs/safety-settings
// BLOCK_NONE will not block any content, and BLOCK_ONLY_HIGH will block only high-risk content.
export enum GoogleSafetySettingsThreshold {
  BLOCK_NONE = "BLOCK_NONE",
  BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH",
  BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
  BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE"
}

export enum ModelProvider {
  Stability = "Stability",
  GPT = "GPT",
  GeminiPro = "GeminiPro",
  Claude = "Claude",
  Ernie = "Ernie",
  Doubao = "Doubao",
  Qwen = "Qwen",
  Hunyuan = "Hunyuan",
  Moonshot = "Moonshot",
  Iflytek = "Iflytek",
  XAI = "XAI",
  ChatGLM = "ChatGLM"
}

export const Stability = {
  GeneratePath: "v2beta/stable-image/generate",
  ExampleEndpoint: "https://api.stability.ai"
}

export const Anthropic = {
  ChatPath: "v1/messages",
  ChatPath1: "v1/complete",
  ExampleEndpoint: "https://api.anthropic.com",
  Vision: "2023-06-01"
}

export const OpenaiPath = {
  ChatPath: "v1/chat/completions",
  SpeechPath: "v1/audio/speech",
  ImagePath: "v1/images/generations",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models"
}

export const Azure = {
  ChatPath: (deployName: string, apiVersion: string) =>
    `deployments/${deployName}/chat/completions?api-version=${apiVersion}`,
  // https://<your_resource_name>.openai.azure.com/openai/deployments/<your_deployment_name>/images/generations?api-version=<api_version>
  ImagePath: (deployName: string, apiVersion: string) =>
    `deployments/${deployName}/images/generations?api-version=${apiVersion}`,
  ExampleEndpoint: "https://{resource-url}/openai"
}

export const Google = {
  ExampleEndpoint: "https://generativelanguage.googleapis.com/",
  ChatPath: (modelName: string) =>
    `v1beta/models/${modelName}:streamGenerateContent`
}

export const Baidu = {
  ExampleEndpoint: BAIDU_BASE_URL,
  ChatPath: (modelName: string) => {
    let endpoint = modelName
    if (modelName === "ernie-4.0-8k") {
      endpoint = "completions_pro"
    }
    if (modelName === "ernie-4.0-8k-preview-0518") {
      endpoint = "completions_adv_pro"
    }
    if (modelName === "ernie-3.5-8k") {
      endpoint = "completions"
    }
    if (modelName === "ernie-speed-8k") {
      endpoint = "ernie_speed"
    }
    return `rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${endpoint}`
  }
}

export const ByteDance = {
  ExampleEndpoint: "https://ark.cn-beijing.volces.com/api/",
  ChatPath: "api/v3/chat/completions"
}

export const Alibaba = {
  ExampleEndpoint: ALIBABA_BASE_URL,
  ChatPath: "v1/services/aigc/text-generation/generation"
}

export const Tencent = {
  ExampleEndpoint: TENCENT_BASE_URL
}

export const Moonshot = {
  ExampleEndpoint: MOONSHOT_BASE_URL,
  ChatPath: "v1/chat/completions"
}

export const Iflytek = {
  ExampleEndpoint: IFLYTEK_BASE_URL,
  ChatPath: "v1/chat/completions"
}

export const XAI = {
  ExampleEndpoint: XAI_BASE_URL,
  ChatPath: "v1/chat/completions",
  ListModelPath: "v1/models"
}

export const ChatGLM = {
  ExampleEndpoint: CHATGLM_BASE_URL,
  ChatPath: "api/paas/v4/chat/completions"
}

export const DEFAULT_INPUT_TEMPLATE = `{{input}}` // input / time / model / lang
// export const DEFAULT_SYSTEM_TEMPLATE = `
// You are ChatGPT, a large language model trained by {{ServiceProvider}}.
// Knowledge cutoff: {{cutoff}}
// Current model: {{model}}
// Current time: {{time}}
// Latex inline: $x^2$
// Latex block: $$e=mc^2$$
// `;
export const DEFAULT_SYSTEM_TEMPLATE = `
You are ChatGPT, a large language model trained by {{ServiceProvider}}.
Knowledge cutoff: {{cutoff}}
Current model: {{model}}
Current time: {{time}}
Latex inline: \\(x^2\\) 
Latex block: $$e=mc^2$$
`

export const SUMMARIZE_MODEL = "gpt-4o-mini"
export const GEMINI_SUMMARIZE_MODEL = "gemini-pro"

export const DEFAULT_TTS_ENGINE = "OpenAI-TTS"
export const DEFAULT_TTS_ENGINES = ["OpenAI-TTS", "Edge-TTS"]
export const DEFAULT_TTS_MODEL = "tts-1"
export const DEFAULT_TTS_VOICE = "alloy"
export const DEFAULT_TTS_MODELS = ["tts-1", "tts-1-hd"]
export const DEFAULT_TTS_VOICES = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer"
]

export const CHAT_PAGE_SIZE = 15
export const MAX_RENDER_MSG_COUNT = 45
