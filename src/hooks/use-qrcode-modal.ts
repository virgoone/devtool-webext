import { useState } from 'react'

export function useQRModal() {
  const [qrResult, setQRResult] = useState<string>("")
  const [showType, setShowType] = useState<"scan" | "gen" | undefined>(undefined)

  const showQRModal = (result: string, type: "scan" | "gen") => {
    setQRResult(result)
    setShowType(type)
  }

  const hideQRModal = () => {
    setQRResult("")
    setShowType(undefined)
  }

  return {
    qrResult,
    showQRModal,
    hideQRModal,
    showType,
  }
}