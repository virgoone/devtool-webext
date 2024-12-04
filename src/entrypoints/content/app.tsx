import { Toaster } from "@/components/ui/sonner";
import { onMessage } from "@/utils/messaging/extension";
import { GenQRCodeModal } from "./mods/gen-qr-modal";
import { ScanQRCodeModal } from "./mods/scan-qr-modal";
import { useQRModal } from "~/hooks/use-qrcode-modal";

export const App = () => {
  const { qrResult, showType, showQRModal, hideQRModal } = useQRModal()

  useEffect(() => {
    onMessage('openQrCodeDialog', message => {
      const { type, result } = message.data;
      console.log('message.data--->', message.data)
      if (type === "scan") {
        showQRModal(result, "scan")
      } else if (type === "gen") {
        showQRModal(result, "gen")
      }
    })
  }, []);

  console.log('showType--->', showType, qrResult)

  return (
    <>
      <Toaster position="top-center" theme="light" richColors expand />
      {showType === "scan" && <ScanQRCodeModal result={qrResult} onClose={hideQRModal} />}
      {showType === "gen" && <GenQRCodeModal result={qrResult} onClose={hideQRModal} />}
    </>
  );
};