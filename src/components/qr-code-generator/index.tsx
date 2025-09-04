"use client"

import { useTranslation } from "react-i18next"

import "@/locales"

import {
  Check,
  ChevronDown,
  ChevronUp,
  Code,
  Copy,
  Download,
  ExternalLink,
  Link
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
import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { QRRuleType, useAppConfig } from "@/store/config"
import { copyImageToClipboard } from "@/utils/copy-image"
import { sendMessage } from "@/utils/messaging/extension"
import { matchesPattern } from "@/utils/url"

interface QRCodeGeneratorProps {
  /** 初始的二维码内容 */
  initialContent: string
  /** 二维码尺寸 */
  size?: number
  /** 是否显示URL规则配置 */
  showRuleConfig?: boolean
  /** URL规则配置默认是否展开 */
  ruleConfigDefaultOpen?: boolean
  /** 是否显示高级操作按钮（复制链接、编码链接等） */
  showAdvancedActions?: boolean
  /** 自定义类名 */
  className?: string
  /** 按钮布局方式 */
  buttonLayout?: "horizontal" | "vertical"
}

export function QRCodeGenerator({
  initialContent,
  size = 280,
  showRuleConfig = true,
  ruleConfigDefaultOpen = true,
  showAdvancedActions = true,
  className = "",
  buttonLayout = "vertical"
}: QRCodeGeneratorProps) {
  const [url, setUrl] = useState(initialContent)
  const [finalUrl, setFinalUrl] = useState(initialContent) // 最终的拼接URL

  // 监听 initialContent 变化，更新 url 状态
  useEffect(() => {
    setUrl(initialContent)
    setFinalUrl(initialContent)
  }, [initialContent])
  const qrCode = useRef<any>(null)
  const ref = useRef<HTMLDivElement>(null)
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copying" | "success" | "error"
  >("idle")
  const [copyLinkStatus, setCopyLinkStatus] = useState<
    "idle" | "copying" | "success" | "error"
  >("idle")
  const [copyEncodeLinkStatus, setCopyEncodeLinkStatus] = useState<
    "idle" | "copying" | "success" | "error"
  >("idle")
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [fixedRulesEnabled, setFixedRulesEnabled] = useState<
    Record<string, boolean>
  >({})
  const [isRuleConfigOpen, setIsRuleConfigOpen] = useState(
    ruleConfigDefaultOpen
  )
  const { t } = useTranslation()
  const config = useAppConfig()

  // 初始化规则状态
  useEffect(() => {
    if (!showRuleConfig) return

    const initializeRules = async () => {
      const initialFixedRules: Record<string, boolean> = {}
      const initialInputValues: Record<string, string> = {}

      // 获取当前页面URL进行域名匹配
      let currentUrl = window.location.href

      // 如果是在popup中，尝试获取当前活跃tab的URL
      if (window.location.protocol === "chrome-extension:") {
        try {
          const tabs = await chrome.tabs.query({
            currentWindow: true,
            active: true
          })
          if (tabs[0]?.url) {
            currentUrl = tabs[0].url
          }
        } catch (error) {
          console.warn("Failed to get active tab URL:", error)
        }
      }

      config.qrRulesConfig.rules.forEach((rule) => {
        // 检查规则是否启用且域名匹配
        if (
          rule.enabled &&
          matchesPattern(currentUrl, rule.domainPattern || "*")
        ) {
          initialFixedRules[rule.id] = true // 规则默认启用
          rule.parameters.forEach((param) => {
            if (param.type === QRRuleType.Input && param.defaultValue) {
              initialInputValues[param.id] = param.defaultValue
            }
          })
        }
      })

      setFixedRulesEnabled(initialFixedRules)
      setInputValues(initialInputValues)
    }

    initializeRules()
  }, [config.qrRulesConfig.rules, showRuleConfig])

  // 构建最终URL
  useEffect(() => {
    if (!url) {
      setFinalUrl("")
      return
    }

    if (!showRuleConfig) {
      setFinalUrl(url)
      return
    }

    try {
      // 使用store中的buildQRUrl方法，传入当前URL进行域名匹配和规则启用状态
      const currentUrl = window.location.href

      const finalUrl = config.buildQRUrl(
        url,
        inputValues,
        currentUrl,
        fixedRulesEnabled
      )
      setFinalUrl(finalUrl)
    } catch (error) {
      console.error("Invalid URL:", error)
      setFinalUrl(url)
    }
  }, [
    url,
    inputValues,
    fixedRulesEnabled,
    config.qrRulesConfig,
    showRuleConfig
  ])

  useEffect(() => {
    const options: Options = {
      width: size,
      height: size,
      type: "svg" as DrawType,
      data: finalUrl || "https://douni.one",
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
        // 清空容器内容，避免重复添加
        ref.current.innerHTML = ""
        qrCode.current?.append(ref.current)
      } else if (attempts < maxAttempts) {
        attempts++
        requestAnimationFrame(renderQRCode)
      } else {
        console.error("QR code container not found after maximum attempts")
      }
    }

    renderQRCode()

    return () => {
      if (ref.current) {
        ref.current.innerHTML = ""
      }
    }
  }, [finalUrl, size])

  const onDataChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value)
  }

  const onDownloadClick = (format: "svg" | "png" = "svg") => {
    if (!qrCode.current) return
    qrCode.current?.download({
      extension: format
    })
  }

  const onCopyClick = async () => {
    if (!ref.current) return

    const svgElement = ref.current.querySelector("svg")
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

  // 复制链接
  const onCopyLinkClick = async () => {
    setCopyLinkStatus("copying")
    try {
      await navigator.clipboard.writeText(finalUrl)
      setCopyLinkStatus("success")
      toast.success(t("linkCopied"))
      setTimeout(() => setCopyLinkStatus("idle"), 2000)
    } catch (error) {
      setCopyLinkStatus("error")
      toast.error(t("linkCopyFailed"))
      setTimeout(() => setCopyLinkStatus("idle"), 2000)
    }
  }

  // 复制编码链接
  const onCopyEncodeLinkClick = async () => {
    setCopyEncodeLinkStatus("copying")
    try {
      const encodedUrl = encodeURIComponent(finalUrl)
      await navigator.clipboard.writeText(encodedUrl)
      setCopyEncodeLinkStatus("success")
      toast.success(t("encodeLinkCopied"))
      setTimeout(() => setCopyEncodeLinkStatus("idle"), 2000)
    } catch (error) {
      setCopyEncodeLinkStatus("error")
      toast.error(t("encodeLinkCopyFailed"))
      setTimeout(() => setCopyEncodeLinkStatus("idle"), 2000)
    }
  }

  // 处理输入参数值变化
  const handleInputValueChange = (paramId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [paramId]: value }))
  }

  // 处理规则启用状态变化
  const handleFixedRuleToggle = (ruleId: string, enabled: boolean) => {
    setFixedRulesEnabled((prev) => ({ ...prev, [ruleId]: enabled }))
  }

  const [availableRules, setAvailableRules] = useState<any[]>([])

  // 更新可用规则列表
  useEffect(() => {
    if (!showRuleConfig) {
      setAvailableRules([])
      return
    }

    const updateAvailableRules = async () => {
      let currentUrl = window.location.href

      // 如果是在popup中，尝试获取当前活跃tab的URL
      if (window.location.protocol === "chrome-extension:") {
        try {
          const tabs = await chrome.tabs.query({
            currentWindow: true,
            active: true
          })
          if (tabs[0]?.url) {
            currentUrl = tabs[0].url
          }
        } catch (error) {
          console.warn(
            "Failed to get active tab URL for availableRules:",
            error
          )
        }
      }

      const filteredRules = config.qrRulesConfig.rules.filter((rule) => {
        if (!rule.enabled) return false
        // 检查域名是否匹配
        return matchesPattern(currentUrl, rule.domainPattern || "*")
      })

      setAvailableRules(filteredRules)
    }

    updateAvailableRules()
  }, [config.qrRulesConfig.rules, showRuleConfig])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 二维码显示区域 */}
      <div
        id="canvas"
        ref={ref}
        className="flex justify-center m-auto flex-shrink-0"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          maxWidth: "90vw",
          maxHeight: `${size}px`
        }}
      />

      {/* 基础URL输入 */}
      <div className="w-full">
        {url && (
          <div className="space-y-2">
            <Label htmlFor="url">{t("originalUrl")}</Label>
            <Input
              id="url"
              value={url}
              onChange={onDataChange}
              className="box-border"
              placeholder={t("qrPlaceholder")}
            />
          </div>
        )}
      </div>

      {/* URL规则配置 */}
      {showRuleConfig &&
        config.qrRulesConfig.globalEnabled &&
        availableRules.length > 0 && (
          <Collapsible
            open={isRuleConfigOpen}
            onOpenChange={setIsRuleConfigOpen}
            className="space-y-3">
            <hr className="border-gray-200" />
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md -m-2">
                <div className="flex items-center gap-2">
                  <div>
                    <Label className="text-sm font-medium cursor-pointer">
                      {t("urlConfig")}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("urlConfigDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async (e) => {
                      e.stopPropagation()
                      // 打开设置页面，直接跳转到二维码规则配置tab
                      try {
                        await sendMessage("openOptionsPage", {
                          tab: "qr-rules"
                        })
                      } catch (error) {
                        console.error("打开设置页面失败:", error)
                        // 备用方案：使用window.open
                        const optionsUrl =
                          chrome.runtime.getURL("options.html") +
                          "?tab=qr-rules"
                        window.open(optionsUrl, "_blank")
                      }
                    }}
                    className="h-auto p-1 text-gray-500 hover:text-gray-700"
                    title="打开二维码规则设置">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  {isRuleConfigOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-3">
              <div
                className="space-y-4 border rounded-lg bg-gray-50/50 p-3"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#cbd5e1 #f1f5f9"
                }}>
                {availableRules.map((rule) => (
                  <div key={rule.id} className="space-y-3">
                    {/* 规则标题 */}
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                      <Switch
                        id={`rule-${rule.id}`}
                        checked={fixedRulesEnabled[rule.id] !== false}
                        onCheckedChange={(checked) =>
                          handleFixedRuleToggle(rule.id, checked)
                        }
                      />
                      <Label
                        htmlFor={`rule-${rule.id}`}
                        className="text-sm font-medium">
                        {rule.name}
                      </Label>
                      {rule.description && (
                        <span className="text-xs text-gray-500">
                          ({rule.description})
                        </span>
                      )}
                    </div>

                    {/* 参数列表 */}
                    {fixedRulesEnabled[rule.id] !== false && (
                      <div className="pl-6 space-y-2">
                        {rule.parameters.map((param) => (
                          <div
                            key={param.id}
                            className="bg-white border border-gray-200 rounded-md p-2">
                            {param.type === QRRuleType.Fixed ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                                    固定
                                  </span>
                                  <span className="font-mono text-sm text-gray-700">
                                    {param.key}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400 text-sm">
                                    =
                                  </span>
                                  <span className="font-mono text-green-600 text-sm font-medium">
                                    {param.value}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                                      输入
                                    </span>
                                    <span className="font-mono text-sm text-gray-700">
                                      {param.key}
                                    </span>
                                  </div>
                                  {param.defaultValue && (
                                    <span className="text-xs text-gray-500">
                                      默认: {param.defaultValue}
                                    </span>
                                  )}
                                </div>
                                <Input
                                  value={inputValues[param.id] || ""}
                                  onChange={(e) =>
                                    handleInputValueChange(
                                      param.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder={
                                    param.defaultValue ||
                                    `请输入 ${param.key} 值`
                                  }
                                  className="text-sm h-8"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

      {/* 最终URL显示 */}
      {finalUrl && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {finalUrl !== url ? t("generatedUrl") : t("finalUrl")}
          </Label>
          <div className="p-3 bg-gray-50 rounded-lg text-xs break-all font-mono border">
            {finalUrl}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="space-y-2 mt-4">
        {buttonLayout === "vertical" ? (
          <>
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={onCopyClick}
                className="flex-1 !cursor-pointer">
                {copyStatus === "idle" && <Copy className="mr-2 h-4 w-4" />}
                {copyStatus === "success" && <Check className="mr-2 h-4 w-4" />}
                {copyStatus === "copying"
                  ? t("copying")
                  : copyStatus === "success"
                    ? t("copySuccess")
                    : copyStatus === "error"
                      ? t("copyError")
                      : t("copyImage")}
              </Button>
              <Button
                onClick={() => onDownloadClick()}
                className="flex-1 !cursor-pointer">
                <Download className="mr-2 h-4 w-4" />
                {t("downloadImage")}
              </Button>
            </div>

            {showAdvancedActions && (
              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={onCopyLinkClick}
                  className="flex-1 !cursor-pointer">
                  {copyLinkStatus === "idle" && (
                    <Link className="mr-2 h-4 w-4" />
                  )}
                  {copyLinkStatus === "success" && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {copyLinkStatus === "copying"
                    ? t("copying")
                    : copyLinkStatus === "success"
                      ? t("copySuccess")
                      : copyLinkStatus === "error"
                        ? t("copyError")
                        : t("copyLink")}
                </Button>
                <Button
                  variant="outline"
                  onClick={onCopyEncodeLinkClick}
                  className="flex-1 !cursor-pointer">
                  {copyEncodeLinkStatus === "idle" && (
                    <Code className="mr-2 h-4 w-4" />
                  )}
                  {copyEncodeLinkStatus === "success" && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {copyEncodeLinkStatus === "copying"
                    ? t("copying")
                    : copyEncodeLinkStatus === "success"
                      ? t("copySuccess")
                      : copyEncodeLinkStatus === "error"
                        ? t("copyError")
                        : t("copyEncodeLink")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={onCopyClick}
              className="!cursor-pointer">
              {copyStatus === "idle" && <Copy className="mr-2 h-4 w-4" />}
              {copyStatus === "success" && <Check className="mr-2 h-4 w-4" />}
              {copyStatus === "copying"
                ? t("copying")
                : copyStatus === "success"
                  ? t("copySuccess")
                  : copyStatus === "error"
                    ? t("copyError")
                    : t("copyImage")}
            </Button>
            <Button
              onClick={() => onDownloadClick()}
              className="!cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              {t("downloadImage")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
