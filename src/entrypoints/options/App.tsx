import { Toaster } from "@/components/ui/sonner"

import Aside from "./mods/aside"
import BasicSetting from "./mods/basic-setting"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Toaster position="top-center" theme="light" richColors expand />
      <div className="flex">
        {/* Sidebar */}
        <Aside />

        {/* Main Content */}
        <BasicSetting />
      </div>
    </div>
  )
}
