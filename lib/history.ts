import type { ClipboardItemPayload, HistoryItem } from "@/types/clipboard";

export const MAX_ITEMS = 100;
export const DAY_MS = 24 * 60 * 60 * 1000;

export function toHistoryItem(payload: ClipboardItemPayload): HistoryItem {
  return {
    ...payload,
    id: `${payload.at}-${payload.type}-${Math.random().toString(36).slice(2, 8)}`,
    pinned: false,
  };
}

export function pruneAndCap(items: HistoryItem[], now = Date.now()): HistoryItem[] {
  return items
    .filter((item) => now - item.at <= DAY_MS)
    .slice(0, MAX_ITEMS);
}

export function sortHistory(items: HistoryItem[]): HistoryItem[] {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.at - a.at;
  });
}

export function filterHistory(items: HistoryItem[], query: string): HistoryItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) => item.type === "text" && (item.text ?? "").toLowerCase().includes(q),
  );
}
