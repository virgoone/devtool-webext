'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import "@/locales"

interface Props {
  result: string
  onClose: () => void
}

export function ScanQRCodeModal({ result: qrContent, onClose }: Props) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  const handleOpenLink = () => {
    if (qrContent.startsWith('http://') || qrContent.startsWith('https://')) {
      window.open(qrContent, '_blank')
    } else {
      toast.error(t("invalidUrl"))
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success(t("copySuccess"))
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast.error(t("copyError"))
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  const isLink = useMemo(() => {
    return qrContent.startsWith('http://') || qrContent.startsWith('https://')
  }, [qrContent])

  const isScanError = useMemo(() => {
    return !qrContent || qrContent.trim() === ''
  }, [qrContent])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={true}>
      <DialogContent
        className="sm:max-w-md max-h-[80vh] overflow-y-auto"
        style={{
          zIndex: 9999
        }}>
        <DialogHeader>
          <DialogTitle>{t("scanQRCodeModalTitle")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Textarea
            ref={textareaRef}
            value={qrContent}
            readOnly
            className="min-h-[200px] resize-none font-mono text-sm"
            placeholder=""
          />
          {!isScanError &&
            <div className="flex justify-between gap-4">
              {isLink &&
                <Button variant="outline" onClick={handleOpenLink} className="flex-1 !cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("openLink")}
                </Button>
              }
              <Button onClick={handleCopy} className="flex-1 !cursor-pointer">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {t("copySuccess")}
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    {t("copy")}
                    {isLink ? t("link") :
                      t("content")}
                  </>
                )}
              </Button>
            </div>
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}