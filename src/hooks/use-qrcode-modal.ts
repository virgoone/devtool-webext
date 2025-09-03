import { useState, useCallback } from 'react'

export function useQRModal() {
  const [qrResult, setQRResult] = useState<string>("")
  const [showType, setShowType] = useState<"scan" | "gen" | undefined>(undefined)

  const showQRModal = useCallback((result: string, type: "scan" | "gen") => {
    setQRResult(result)
    setShowType(type)
  }, [])

  const hideQRModal = useCallback(() => {
    setQRResult("")
    setShowType(undefined)
  }, [])

  return {
    qrResult,
    showQRModal,
    hideQRModal,
    showType,
  }
}