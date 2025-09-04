import { useEffect, useState } from "react"

import { QRCodeGenerator } from "@/components/qr-code-generator"
import { Card, CardContent } from "@/components/ui/card"

function IndexPopup() {
  const [initialContent, setInitialContent] =
    useState<string>("https://douni.one")

  useEffect(() => {
    const getCurrentTabUrl = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const text = urlParams.get("text")

        if (text) {
          setInitialContent(decodeURIComponent(text))
        } else {
          // If no text parameter, get current tab URL
          const tabs = await chrome.tabs.query({
            currentWindow: true,
            active: true
          })
          if (tabs[0]?.url) {
            setInitialContent(tabs[0].url)
          }
        }
      } catch (error) {
        console.error("Failed to get current tab URL:", error)
      }
    }

    // Get URL immediately when popup opens
    getCurrentTabUrl()
  }, [])

  return (
    <Card className="w-[360px] h-[600px] flex flex-col p-2 overflow-auto">
      <CardContent className="p-2 flex-1">
        <QRCodeGenerator
          initialContent={initialContent}
          size={300}
          showRuleConfig={true}
          ruleConfigDefaultOpen={false}
          showAdvancedActions={true}
          buttonLayout="vertical"
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}

export default IndexPopup
