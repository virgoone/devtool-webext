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
import { useEffect, useRef, useState, type ChangeEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { copyImageToClipboard } from "@/utils/copy-image"

function IndexPopup() {
  const [options, setOptions] = useState<Options>({
    width: 300,
    height: 300,
    type: "svg" as DrawType,
    data: "https://douni.one",
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
  })
  const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling(options))
  const ref = useRef<HTMLDivElement>(null)
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "success" | "error">("idle")

  useEffect(() => {
    if (!qrCode) return
    qrCode.update(options)
  }, [qrCode, options])

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current)
    }
  }, [qrCode, ref])

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const text = urlParams.get("text")

    if (text) {
      setOptions((options) => ({
        ...options,
        data: decodeURIComponent(text)
      }))
    } else {
      // If no text parameter, get current tab URL
      chrome.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
        if (tabs[0]?.url) {
          setOptions((options) => ({
            ...options,
            data: tabs[0].url
          }))
        }
      })
    }
  }, [])

  const onDataChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOptions((options) => ({
      ...options,
      data: event.target.value
    }))
  }

  const onDownloadClick = () => {
    if (!qrCode) return
    qrCode.download({
      extension: "svg"
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
    <Card className="w-[360px] flex flex-col p-2">
      <CardContent className="p-0 space-y-2">
        <div ref={ref} className="w-[340px] flex justify-center"></div>
        <div className="w-full pl-6 pr-6">
          {options.data && (
            <Input
              id="url"
              value={options.data}
              onChange={onDataChange}
              placeholder={i18n.t("popup.input.placeholder")}
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-6 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCopyClick}>
          {copyStatus === "copying" ? i18n.t("popup.button.copying") :
            copyStatus === "success" ? i18n.t("popup.button.copySuccess") :
              copyStatus === "error" ? i18n.t("popup.button.copyError") : i18n.t("popup.button.copy")}
        </Button>
        <Button
          variant="default"
          className="flex-1"
          onClick={onDownloadClick}>
          {i18n.t("popup.button.download")}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default IndexPopup