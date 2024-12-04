import "./message";
import { scanQRCodeFromImage } from "@/utils/qr-scanner"
import { CONTEXT_MENU_ITEMS, setupContextMenus } from "./context-menu"
import { browser } from 'wxt/browser'
import { sendMessage } from "@/utils/messaging/extension";

export default defineBackground(() => {
  // 监听消息
  browser.runtime.onInstalled.addListener(() => {
    setupContextMenus()
  })
  browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
      case CONTEXT_MENU_ITEMS.GENERATE_QR_SELECTION: {
        if (info.selectionText && tab?.id) {
          sendMessage('openQrCodeDialog', {
            type: 'gen',
            result: info.selectionText
          }, tab.id)
        }
        break
      }
      case CONTEXT_MENU_ITEMS.BASE64_ENCODE: {
        sendMessage('sendTextMessage', {
          type: 'base64-encode',
          result: info.selectionText!
        }, tab?.id)
        break
      }
      case CONTEXT_MENU_ITEMS.BASE64_DECODE: {
        sendMessage('sendTextMessage', {
          type: 'base64-decode',
          result: info.selectionText!
        }, tab?.id)
        break
      }

      case CONTEXT_MENU_ITEMS.GENERATE_QR_LINK: {
        if (info.linkUrl && tab?.id) {
          sendMessage('openQrCodeDialog', {
            type: "gen",
            result: info.linkUrl
          }, tab.id)
        }
        break
      }

      case CONTEXT_MENU_ITEMS.SCAN_QR: {
        if (info.srcUrl && tab?.id) {
          scanQRCodeFromImage(info.srcUrl)
            .then((result) => {
              console.log('扫码成功--->', result, tab.id)
              if (result) {
                // 发送消息给 content script 显示 Modal
                sendMessage('openQrCodeDialog', {
                  type: "scan",
                  result,
                }, tab.id)
              }
            })
            .catch((error) => {
              console.error('扫码失败--->', error)
              // 可以选择显示错误 Modal
              sendMessage('openQrCodeDialog', {
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
});
