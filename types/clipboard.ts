export type HistoryItemType = "text" | "image";

export type ClipboardItemPayload = {
  type: HistoryItemType;
  text?: string;
  dataUrl?: string;
  at: number;
};

export type HistoryItem = ClipboardItemPayload & {
  id: string;
  pinned: boolean;
};

export type ClipboardAPI = {
  onItem: (callback: (payload: ClipboardItemPayload) => void) => () => void;
  writeText: (text: string) => Promise<boolean>;
  writeImage: (dataUrl: string) => Promise<boolean>;
  getOpenAtLogin: () => Promise<boolean>;
  setOpenAtLogin: (enabled: boolean) => Promise<boolean>;
};

declare global {
  interface Window {
    clipboardAPI?: ClipboardAPI;
  }
}

export {};
