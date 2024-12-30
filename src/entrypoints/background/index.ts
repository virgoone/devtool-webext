import "./message"

import { browser } from "wxt/browser"

import { COMMANDS } from "@/constants/command"
import { debug } from "@/utils/debug"
import { sendMessage } from "@/utils/messaging/extension"
import { scanQRCodeFromImage } from "@/utils/qr-scanner"

import { CONTEXT_MENU_ITEMS, setupContextMenus } from "./context-menu"

export default defineBackground(() => {
  // 监听消息
  browser.runtime.onInstalled.addListener(() => {
    setupContextMenus()
  })
  browser.commands.onCommand.addListener(async (command) => {
    if (command !== COMMANDS.openOptionsPage) return
    browser.runtime.openOptionsPage()
  })
  browser.contextMenus.onClicked.addListener((info, tab) => {
    debug("contextMenus on clicked", info, tab)
    switch (info.menuItemId) {
      case CONTEXT_MENU_ITEMS.GENERATE_QR_SELECTION: {
        debug("generate qr selection", info.selectionText)
        if (info.selectionText && tab?.id) {
          sendMessage(
            "openQrCodeDialog",
            {
              type: "gen",
              result: info.selectionText
            },
            tab.id
          )
        }
        break
      }
      case CONTEXT_MENU_ITEMS.BASE64_ENCODE: {
        debug("base64 encode", info.selectionText)
        sendMessage(
          "sendTextMessage",
          {
            type: "base64-encode",
            result: info.selectionText!
          },
          tab?.id
        )
        break
      }
      case CONTEXT_MENU_ITEMS.BASE64_DECODE: {
        debug("base64 decode", info.selectionText)
        sendMessage(
          "sendTextMessage",
          {
            type: "base64-decode",
            result: info.selectionText!
          },
          tab?.id
        )
        break
      }

      case CONTEXT_MENU_ITEMS.GENERATE_QR_LINK: {
        if (info.linkUrl && tab?.id) {
          debug("gen qr link", info.linkUrl)
          sendMessage(
            "openQrCodeDialog",
            {
              type: "gen",
              result: info.linkUrl
            },
            tab.id
          )
        }
        break
      }

      case CONTEXT_MENU_ITEMS.SCAN_QR: {
        if (info.srcUrl && tab?.id) {
          scanQRCodeFromImage(info.srcUrl)
            .then((result) => {
              debug("扫码成功--->", result)
              if (result) {
                // 发送消息给 content script 显示 Modal
                sendMessage(
                  "openQrCodeDialog",
                  {
                    type: "scan",
                    result
                  },
                  tab.id
                )
              }
            })
            .catch((error) => {
              debug("扫码失败--->", error)
              // 可以选择显示错误 Modal
              sendMessage("openQrCodeDialog", {
                type: "scan",
                result: `扫描失败: ${error.message}`
              })
            })
        }
        break
      }
    }
  })
  // browser.action.onClicked.addListener((tab: any) => {
  //   console.log(tab);
  //   // browser.action.setPopup({ popup: "popup333.html" });
  //   // browser.action.openPopup();
  // })
})
