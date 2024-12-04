import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/i18n/module"],
  srcDir: "src",
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'zh_CN',
    minimum_chrome_version: "102",
    background: {
      type: 'module'
    },
    permissions: [
      "activeTab",
      "contextMenus",
      "clipboardWrite",
      "clipboardRead",
      "scripting",
      "offscreen",
			"userScripts",
      "tabs"
    ],
    host_permissions: [
      "<all_urls>"
    ],
  }
});