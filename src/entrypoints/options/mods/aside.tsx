import { ExternalLink, Info, LayoutGrid, Mail, Zap } from "lucide-react"
import React from "react"
import { useTranslation } from "react-i18next"

import Logo from "@/assets/icon.png"
import { Button } from "@/components/ui/button"

export default function Aside() {
  const { t } = useTranslation(["options", "global"])

  return (
    <aside className="w-64 border-r bg-white min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 px-2 mb-6">
        <img src={Logo} className="w-8 h-8 text-purple-500" />
        <span className="text-xl font-semibold">
          {t("name", { ns: "global" })}
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 bg-purple-50 text-purple-600">
          <LayoutGrid className="w-4 h-4" />
          {t("general.basic")}
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
          {t("general.feedback")}
          <ExternalLink className="w-3 h-3 ml-auto" />
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3">
          <Info className="w-4 h-4" />
          {t("general.help")}
          <ExternalLink className="w-3 h-3 ml-auto" />
        </Button>
      </div>
    </aside>
  )
}
