import { decode, encode } from "js-base64"
import {
  Copy,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  QrCode,
  RotateCcw,
  Settings2,
  Star,
  Type,
  X
} from "lucide-react"
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
import React, { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import icon from "@/assets/icon.png"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/utils"
import { sendMessage } from "@/utils/messaging/extension"

import PlaybackToolbar from "./playback-toolbar"

export function FloatingToolbar() {
  const [visible, setVisible] = useState(false)
  const [playbackVisible, setPlaybackVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState("")
  const [showQRCode, setShowQRCode] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<HTMLDivElement>(null)
  const qrCode = useRef<QRCodeStyling>()

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()
      if (!text) {
        setVisible(false)
        setShowQRCode(false)
        return
      }

      setSelectedText(text)
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()

      if (rect) {
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let x = rect.left + window.scrollX
        let y = rect.top + window.scrollY + 28
        if (range && range.getClientRects) {
          const clientRects = range.getClientRects()
          if (clientRects.length > 0) {
            y = clientRects[clientRects.length - 1].top + window.scrollY + 28
          }
        }

        if (x + 200 > viewportWidth) {
          x = viewportWidth - 200
        }

        if (y + 50 > viewportHeight + window.scrollY) {
          y = rect.top + window.scrollY - 50
        }
        const scrollY = window.scrollY

        setPosition({ x, y: y - scrollY })
        setVisible(true)
      }
    }

    // const handleMouseUp = (e: MouseEvent) => {
    //   // 忽略来自工具栏本身的事件
    //   if (toolbarRef.current?.contains(e.target as Node)) {
    //     return
    //   }
    //   setTimeout(handleSelection, 0)
    // }

    // const handleClickOutside = (e: MouseEvent) => {
    //   if (
    //     toolbarRef.current &&
    //     !toolbarRef.current.contains(e.target as Node)
    //   ) {
    //     setVisible(false)
    //     setShowQRCode(false)
    //   }
    // }

    // 在原始页面上添加事件监听器
    // document.addEventListener("selectionchange", handleMouseUp)
    document.addEventListener("selectionchange", handleSelection)

    return () => {
      // document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("selectionchange", handleSelection)
    }
  }, [])

  // QR Code generation logic...
  useEffect(() => {
    if (showQRCode && selectedText) {
      qrCode.current = new QRCodeStyling({
        width: 200,
        height: 200,
        type: "svg" as DrawType,
        data: selectedText,
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
      let attempts = 0
      const maxAttempts = 60 // 约1秒（假设60帧/秒）

      const renderQRCode = () => {
        if (qrRef.current) {
          qrCode.current?.append(qrRef.current)
          console.log("qrRef.current-->", qrRef.current)
        } else if (attempts < maxAttempts) {
          attempts++
          requestAnimationFrame(renderQRCode)
        } else {
          console.error("QR code container not found after maximum attempts")
        }
      }

      renderQRCode()
    }

    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = ""
      }
    }
  }, [showQRCode, selectedText])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText)
      toast.success("已复制到剪贴板")
      setVisible(false)
    } catch (err) {
      toast.error("复制失败")
    }
  }

  const handleGoToSettings = () => {
    sendMessage("openOptionsPage", undefined)
  }

  const handleBase64Encode = () => {
    const encoded = encode(selectedText)
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
    setVisible(false)
  }

  const handleBase64Decode = () => {
    try {
      const decoded = decode(selectedText)
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
      setVisible(false)
    } catch (err) {
      toast.error("解码失败，请确保输入正确的Base64字符串")
    }
  }

  return (
    <TooltipProvider>
      <div
        ref={toolbarRef}
        className={cn(
          "fixed z-[2147483647] flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg",
          {
            hidden: !visible || playbackVisible
          }
        )}
        style={{
          left: position.x,
          top: position.y,
          pointerEvents: "auto"
        }}>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={handleCopy}>
          <img src={icon} alt="icon" className="size-4 rounded-full" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCopy}>
          <Copy className="h-4 w-4" />
        </Button>

        <Popover open={showQRCode} onOpenChange={setShowQRCode}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <QrCode className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[220px] p-2"
            onPointerDownOutside={(e) => {
              if (qrRef.current?.contains(e.target as Node)) {
                e.preventDefault()
              }
            }}>
            <div ref={qrRef} className="w-[200px] h-[200px]" />
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px] rounded-xl bg-white shadow-lg border-none p-1.5">
            <DropdownMenuItem
              className="gap-2 px-3 py-2.5 text-sm text-gray-700 focus:bg-gray-100 rounded-lg hover:bg-gray-100"
              onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              <span className="flex-1">复制</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 px-3 py-2.5 text-sm text-gray-700 focus:bg-gray-100 rounded-lg hover:bg-gray-100"
              onClick={handleBase64Encode}>
              <Type className="h-4 w-4" />
              <span className="flex-1">Base64 编码</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 px-3 py-2.5 text-sm text-gray-700 focus:bg-gray-100 rounded-lg hover:bg-gray-100"
              onClick={handleBase64Decode}>
              <Type className="h-4 w-4" />
              <span className="flex-1">Base64 解码</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5" />

            {/* <DropdownMenuItem
              className="gap-2 px-3 py-2.5 text-sm text-gray-700 focus:bg-gray-100 rounded-lg hover:bg-gray-100"
              onClick={() => {
                setVisible(false)
                setPlaybackVisible(true)
              }}>
              <MessageSquare className="h-4 w-4" />
              <span className="flex-1">朗读</span>
              <Star className="h-4 w-4 text-purple-500" />
            </DropdownMenuItem> */}
            {/* <DropdownMenuItem className="gap-2 px-3 py-2.5 text-sm text-gray-700 focus:bg-gray-100 rounded-lg hover:bg-gray-100">
              <Pencil className="h-4 w-4" />
              <span className="flex-1">改善写作</span>
              <Star className="h-4 w-4 text-purple-500" />
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 px-3 py-2.5 text-sm text-gray-700 focus:bg-gray-100 rounded-lg hover:bg-gray-100">
              <Type className="h-4 w-4" />
              <span className="flex-1">纠正语法错误</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 px-3 py-2.5 text-sm text-gray-700 focus:bg-gray-100 rounded-lg hover:bg-gray-100">
              <RotateCcw className="h-4 w-4" />
              <span className="flex-1">扩展长度</span>
            </DropdownMenuItem> */}
            <DropdownMenuItem
              className="gap-2 px-3 py-2.5 text-sm text-gray-700 focus:bg-gray-100 rounded-lg hover:bg-gray-100"
              onClick={handleGoToSettings}>
              <Settings2 className="size-4" />
              <span className="flex-1">设置</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setVisible(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {selectedText && (
        <PlaybackToolbar
          text={selectedText}
          position={position}
          visible={playbackVisible}
          onClose={() => setPlaybackVisible(false)}
        />
      )}
    </TooltipProvider>
  )
}
