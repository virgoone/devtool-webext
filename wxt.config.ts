import { type PluginOption } from "vite"
import { defineConfig } from "wxt"

import type { Command } from "@/constants/command"
import react from "@vitejs/plugin-react-swc"

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  vite: () => ({
    plugins: [react()] as PluginOption[]
  }),
  manifest: {
    name: "程序员助手 - 开发辅助工具",
    description: "开发辅助工具，支持一键生成二维码、扫码识别二维码等...",
    minimum_chrome_version: "102",
    background: {
      type: "module"
    },
    permissions: [
      "storage",
      "activeTab",
      "contextMenus",
      "clipboardWrite",
      "clipboardRead",
      "scripting",
      "offscreen",
      "userScripts",
      "tabs",
      "sidePanel",
      "storage",
      "webRequest"
    ],
    commands: {
      openOptionsPage: {
        description: "Open the Options page",
        suggested_key: {
          default: "Alt+O"
        }
      }
    },
    host_permissions: ["<all_urls>"],
    web_accessible_resources: [
      {
        resources: ["/assets/highlight-painter.js"],
        matches: ["<all_urls>"]
      }
    ]
  }
})
