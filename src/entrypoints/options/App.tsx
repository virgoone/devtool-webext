import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"

import Aside from "./mods/aside"
import BasicSetting from "./mods/basic-setting"
import QRRulesSetting from "./mods/qr-rules-setting.tsx"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("basic")

  // 检查URL参数来设置初始tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get("tab")
    if (tabParam === "qr-rules") {
      setActiveTab("qr-rules")
    }
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "qr-rules":
        return <QRRulesSetting />
      default:
        return <BasicSetting />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Toaster position="top-center" theme="light" richColors expand />
      <div className="flex">
        {/* Sidebar */}
        <Aside activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
  )
}
