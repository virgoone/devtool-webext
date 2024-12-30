import { decode, encode } from "js-base64"
import { useEffect } from "react"
import { toast } from "sonner"

import { useQRModal } from "~/hooks/use-qrcode-modal"
import { FloatingToolbar } from "@/components/floating-toolbar"
import { Toaster } from "@/components/ui/sonner"
import { debug } from "@/utils/debug"
import { onMessage } from "@/utils/messaging/extension"

import { GenQRCodeModal } from "./mods/gen-qr-modal"
import { ScanQRCodeModal } from "./mods/scan-qr-modal"

export const App = () => {
  const { qrResult, showType, showQRModal, hideQRModal } = useQRModal()

  useEffect(() => {
    onMessage("openQrCodeDialog", (message) => {
      const { type, result } = message.data
      debug("openQrCodeDialog", message.data)
      if (type === "scan") {
        showQRModal(result, "scan")
      } else if (type === "gen") {
        showQRModal(result, "gen")
      }
    })
    onMessage("sendTextMessage", (message) => {
      const { type, result } = message.data
      debug("sendTextMessage", message.data)
      if (type && !result) {
        toast.error("文字内容不能为空")
        return
      }
      if (type === "base64-encode") {
        const encoded = encode(result)
        toast.success("编码成功", {
          duration: 10000,
          action: {
            label: "复制",
            onClick: () => {
              navigator.clipboard.writeText(encoded)
              toast.success("已复制到剪贴板")
            }
          },
          description: encoded
        })
      } else if (type === "base64-decode") {
        const decoded = decode(result)
        toast.success("解码成功", {
          duration: 10000,
          action: {
            label: "复制",
            onClick: () => {
              navigator.clipboard.writeText(decoded)
              toast.success("已复制到剪贴板")
            }
          },
          description: decoded
        })
      }
    })
  }, [])

  return (
    <>
      <Toaster position="top-center" theme="light" richColors expand />
      <FloatingToolbar />
      {showType === "scan" && (
        <ScanQRCodeModal result={qrResult} onClose={hideQRModal} />
      )}
      {showType === "gen" && (
        <GenQRCodeModal result={qrResult} onClose={hideQRModal} />
      )}
    </>
  )
}
