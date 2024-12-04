'use client'

import QRCodeStyling, {
  type CornerDotType,
  type CornerSquareType,
  type DotType,
  type DrawType,
  type ErrorCorrectionLevel,
  type Mode,
  type Options,
  type TypeNumber
} from "qr-code-styling"
import { useMemo, useEffect, useRef, useState, type ChangeEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { copyImageToClipboard } from "@/utils/copy-image"
import { ExternalLink, Copy, Check, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Props {
  result: string
  onClose: () => void
}

export function GenQRCodeModal({ result: qrContent, onClose }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState(qrContent)
  const qrCode = useRef<any>()
  const ref = useRef<HTMLDivElement>(null)
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "success" | "error">("idle")

  useEffect(() => {
    const options: Options = {
      width: 300,
      height: 300,
      type: "svg" as DrawType,
      data: url || "https://douni.one",
      margin: 5,
      qrOptions: {
        typeNumber: 0 as TypeNumber,
        mode: "Byte" as Mode,
        errorCorrectionLevel: "Q" as ErrorCorrectionLevel
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 20,
        crossOrigin: "anonymous"
      },
      dotsOptions: {
        color: "#222222",
        type: "rounded" as DotType
      },
      backgroundOptions: {
        color: "#fff"
      },
      cornersSquareOptions: {
        color: "#222222",
        type: "extra-rounded" as CornerSquareType
      },
      cornersDotOptions: {
        color: "#222222",
        type: "dot" as CornerDotType
      }
    }
    qrCode.current = new QRCodeStyling(options)

    let attempts = 0
    const maxAttempts = 60 // 约1秒（假设60帧/秒）

    const renderQRCode = () => {
      if (ref.current) {
        qrCode.current?.append(ref.current)
      } else if (attempts < maxAttempts) {
        attempts++
        requestAnimationFrame(renderQRCode)
      } else {
        console.error('QR code container not found after maximum attempts')
      }
    }

    renderQRCode()

    return () => {
      if (ref.current) {
        ref.current.innerHTML = ''
      }
    }
  }, [url])

  useEffect(() => {
    setIsOpen(true)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  const onDataChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value)
  }

  const onDownloadClick = (format: 'svg' | 'png' = 'svg') => {
    if (!qrCode.current) return
    qrCode.current?.download({
      extension: format
    })
  }

  const onCopyClick = async () => {
    if (!ref.current) return

    const svgElement = ref.current.querySelector('svg')
    if (!svgElement) return

    setCopyStatus("copying")
    try {
      await copyImageToClipboard(svgElement)
      setCopyStatus("success")
      setTimeout(() => setCopyStatus("idle"), 2000)
    } catch (error) {
      setCopyStatus("error")
      setTimeout(() => setCopyStatus("idle"), 2000)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
      modal={true}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        style={{
          zIndex: 9999
        }}
      >
        <DialogHeader>
          <DialogTitle>{i18n.t("content.mods.genQRCodeModal.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div id="canvas" ref={ref} className="w-[300px] h-[300px] flex justify-center m-auto"></div>
          <div className="w-full">
            {url && (
              <Input
                id="url"
                value={url}
                onChange={onDataChange}
                className="box-border"
                placeholder={i18n.t("content.mods.genQRCodeModal.input.placeholder")}
              />
            )}
          </div>
          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={onCopyClick} className="flex-1 !cursor-pointer">
              {copyStatus === 'idle' && <Copy className="mr-2 h-4 w-4" />}
              {copyStatus === 'success' && <Check className="mr-2 h-4 w-4" />}
              {copyStatus === "copying" ? i18n.t("content.mods.genQRCodeModal.button.copying") :
                copyStatus === "success" ? i18n.t("content.mods.genQRCodeModal.button.copySuccess") :
                  copyStatus === "error" ? i18n.t("content.mods.genQRCodeModal.button.copyError") : i18n.t("content.mods.genQRCodeModal.button.copy")}
            </Button>
            <Button onClick={() => onDownloadClick()} className="flex-1 !cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              {i18n.t("content.mods.genQRCodeModal.button.download")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

