import { type PluginOption } from "vite"
import { defineConfig } from "wxt"

import type { Manifest } from "wxt/browser"

import type { Command } from "@/constants/command"
import react from "@vitejs/plugin-react-swc"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/i18n/module"],
  srcDir: "src",
  vite: () => ({
    plugins: [react()] as PluginOption[]
  }),
  manifest: {
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "zh_CN",
    minimum_chrome_version: "102",
    background: {
      type: "module"
    },
    permissions: [
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
    } satisfies Record<Command, Manifest.WebExtensionManifestCommandsType>,
    host_permissions: ["<all_urls>"],
    web_accessible_resources: [
      {
        resources: ["/assets/highlight-painter.js"],
        matches: ["<all_urls>"]
      }
    ]
  }
})
