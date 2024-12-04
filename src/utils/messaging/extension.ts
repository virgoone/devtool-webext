import { defineExtensionMessaging } from '@webext-core/messaging';
import type { Downloads } from "wxt/browser";

export type QRCodeDialogType = "scan" | "gen"

export interface ProtocolMap {
  getStringLength(message: { data: string }): number;
  download(options: Downloads.DownloadOptionsType & { path?: string }): number;
  openPopup(): void;
  openQrCodeDialog(data: { type: QRCodeDialogType, result: string }): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();