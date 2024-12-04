'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Props {
  result: string
  onClose: () => void
}

export function ScanQRCodeModal({ result: qrContent, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  const handleCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.select()
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenLink = () => {
    if (qrContent.startsWith('http://') || qrContent.startsWith('https://')) {
      window.open(qrContent, '_blank')
    } else {
      toast.error(i18n.t("content.mods.scanQRCodeModal.error.invalidUrl"))
    }
  }

  const isScanError = useMemo(() => {
    return qrContent.includes('扫描失败')
  }, [qrContent])

  const isLink = useMemo(() => {
    return qrContent.startsWith('http://') || qrContent.startsWith('https://')
  }, [qrContent])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
      modal={true}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        style={{
          zIndex: 9999
        }}
      >
        <DialogHeader>
          <DialogTitle>{i18n.t("content.mods.scanQRCodeModal.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Textarea
            ref={textareaRef}
            value={qrContent}
            readOnly
            className="min-h-[100px] resize-none box-border max-w-full"
          />
          {!isScanError &&
            <div className="flex justify-between gap-4">
              {isLink &&
                <Button variant="outline" onClick={handleOpenLink} className="flex-1 !cursor-pointer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {i18n.t("content.mods.scanQRCodeModal.button.openLink")}
                </Button>
              }
              <Button onClick={handleCopy} className="flex-1 !cursor-pointer">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {i18n.t("content.mods.scanQRCodeModal.button.copySuccess")}
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    {i18n.t("content.mods.scanQRCodeModal.button.copy")}
                    {isLink ? i18n.t("content.mods.scanQRCodeModal.button.link") :
                      i18n.t("content.mods.scanQRCodeModal.button.content")}
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

