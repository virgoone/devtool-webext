import { ExternalLink, Info, LayoutGrid, Mail, QrCode, Zap } from "lucide-react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import "@/locales"

import Logo from "@/assets/icon.png"
import { Button } from "@/components/ui/button"

interface AsideProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Aside({ activeTab, onTabChange }: AsideProps) {
  const { t } = useTranslation()

  return (
    <aside className="w-64 border-r bg-white min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 px-2 mb-6">
        <img src={Logo} className="w-8 h-8 text-purple-500" />
        <span className="text-xl font-semibold">
          {t("name")}
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        <Button
          variant="ghost"
          onClick={() => onTabChange("basic")}
          className={`w-full justify-start gap-3 ${
            activeTab === "basic" ? "bg-purple-50 text-purple-600" : ""
          }`}>
          <LayoutGrid className="w-4 h-4" />
          {t("options.general.basic")}
        </Button>
        <Button
          variant="ghost"
          onClick={() => onTabChange("qr-rules")}
          className={`w-full justify-start gap-3 ${
            activeTab === "qr-rules" ? "bg-purple-50 text-purple-600" : ""
          }`}>
          <QrCode className="w-4 h-4" />
          {t("options.general.qrRules")}
        </Button>
        {/* <Button variant="ghost" className="w-full justify-start gap-3">
        <Zap className="w-4 h-4" />
        侧边栏
      </Button>
      <Button variant="ghost" className="w-full justify-start gap-3">
        <Sparkles className="w-4 h-4" />
        智能菜单
      </Button>
      <Button variant="ghost" className="w-full justify-start gap-3">
        <Translate className="w-4 h-4" />
        翻译
      </Button>
      <Button variant="ghost" className="w-full justify-start gap-3">
        <HelpCircle className="w-4 h-4" />
        网页助手
      </Button>
      <Button variant="ghost" className="w-full justify-start gap-3">
        <MessageSquare className="w-4 h-4" />
        提示词
      </Button>
      <Button variant="ghost" className="w-full justify-start gap-3">
        <Keyboard className="w-4 h-4" />
        键盘快捷键
      </Button> */}
      </nav>

      <div className="border-t pt-4 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-3">
          <Mail className="w-4 h-4" />
          {t("options.general.feedback")}
          <ExternalLink className="w-3 h-3 ml-auto" />
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3">
          <Info className="w-4 h-4" />
          {t("options.general.help")}
          <ExternalLink className="w-3 h-3 ml-auto" />
        </Button>
      </div>
    </aside>
  )
}
