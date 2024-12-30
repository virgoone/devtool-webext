import { defineExtensionMessaging } from '@webext-core/messaging';
import type { Downloads } from "wxt/browser";

export type QRCodeDialogType = "scan" | "gen"
export type TextMessageType = "base64-encode" | "base64-decode"

export interface ProtocolMap {
  getStringLength(message: { data: string }): number;
  download(options: Downloads.DownloadOptionsType & { path?: string }): number;
  openPopup(): void;
  openOptionsPage(): void;
  openQrCodeDialog(data: { type: QRCodeDialogType, result: string }): void;
  sendTextMessage(data: { type: TextMessageType, result: string }): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();