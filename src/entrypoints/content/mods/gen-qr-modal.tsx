"use client"

import { useTranslation } from "react-i18next"

import "@/locales"

import { useEffect, useState } from "react"

import { QRCodeGenerator } from "@/components/qr-code-generator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface Props {
  result: string
  onClose: () => void
}

export function GenQRCodeModal({ result: qrContent, onClose }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setIsOpen(true)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  return (
    <>
      <style>{`
        [data-radix-portal] {
          z-index: 9999999 !important;
        }
        [data-radix-portal] [role="dialog"] {
          z-index: 99999999 !important;
        }
        .qr-modal-content {
          z-index: 99999999 !important;
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={handleClose} modal={true}>
        <DialogContent
          className="w-[95vw] max-w-[95vw] sm:min-w-[400px] sm:w-auto lg:max-w-[600px] p-0 qr-modal-content"
          style={{
            zIndex: 999999
          }}>
          <div className="max-h-[90vh] qr-modal-scroll">
            <DialogHeader className="p-6 pb-0 qr-modal-header">
              <DialogTitle>{t("genQRCodeModalTitle")}</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-4">
              <QRCodeGenerator
                initialContent={qrContent}
                size={280}
                showRuleConfig={true}
                ruleConfigDefaultOpen={true}
                showAdvancedActions={true}
                buttonLayout="vertical"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
