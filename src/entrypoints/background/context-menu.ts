import { scanQRCodeFromImage } from "@/utils/qr-scanner"
import { sendMessage } from "@/utils/messaging/extension";
import { browser, ContextMenus, Tabs } from 'wxt/browser'

export const CONTEXT_MENU_ITEMS = {
  GENERATE_QR_SELECTION: "generate-qr-selection",
  GENERATE_QR_LINK: "generate-qr-link",
  SCAN_QR: "scan-qr"
} as const

export function setupContextMenus() {
  // Create menu item for text selection
  browser.contextMenus.create({
    id: CONTEXT_MENU_ITEMS.GENERATE_QR_SELECTION,
    title: "将选中文字生成二维码",
    contexts: ["selection"]
  })

  // Create menu item for links
  browser.contextMenus.create({
    id: CONTEXT_MENU_ITEMS.GENERATE_QR_LINK,
    title: "将链接生成二维码",
    contexts: ["link"]
  })

  // Create menu item for images
  browser.contextMenus.create({
    id: CONTEXT_MENU_ITEMS.SCAN_QR,
    title: "解析二维码",
    contexts: ["image"]
  })
}