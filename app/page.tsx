"use client";

import { useEffect, useMemo, useState } from "react";
import { AutostartToggle } from "@/components/AutostartToggle";
import { HistoryCard } from "@/components/HistoryCard";
import { SearchBar } from "@/components/SearchBar";
import {
  filterHistory,
  pruneAndCap,
  sortHistory,
  toHistoryItem,
} from "@/lib/history";
import type { HistoryItem } from "@/types/clipboard";

export default function HomePage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const api = window.clipboardAPI;
    setReady(Boolean(api));
    if (!api) return;

    const unsubscribe = api.onItem((payload) => {
      setItems((prev) =>
        pruneAndCap([toHistoryItem(payload), ...prev]),
      );
    });

    const pruneTimer = setInterval(() => {
      setItems((prev) => pruneAndCap(prev));
    }, 60_000);

    return () => {
      unsubscribe();
      clearInterval(pruneTimer);
    };
  }, []);

  const visible = useMemo(
    () => filterHistory(sortHistory(items), query),
    [items, query],
  );

  async function activate(item: HistoryItem) {
    const api = window.clipboardAPI;
    if (!api) return;
    if (item.type === "text" && item.text) {
      await api.writeText(item.text);
      return;
    }
    if (item.type === "image" && item.dataUrl) {
      await api.writeImage(item.dataUrl);
    }
  }

  function togglePin(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item,
      ),
    );
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <main className="min-h-full bg-gradient-to-b from-rose-50 via-rose-50 to-pink-50 p-4 text-rose-950">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-rose-900">
          历史粘贴板
        </h1>
        <p className="mt-1 text-sm text-rose-600">
          点击卡片写回剪贴板，再按 Ctrl+V 粘贴
        </p>
        <AutostartToggle />
      </header>

      <SearchBar value={query} onChange={setQuery} />

      {!ready && (
        <p className="rounded-lg bg-rose-100/70 px-3 py-2 text-sm text-rose-800">
          请用 <code className="rounded bg-white px-1">npm run dev:app</code>{" "}
          启动以启用剪贴板监听
        </p>
      )}

      {ready && visible.length === 0 && (
        <p className="py-12 text-center text-sm text-rose-500">
          {query.trim()
            ? "没有匹配的文字记录"
            : "复制任意内容后将出现在这里"}
        </p>
      )}

      <ul className="space-y-3">
        {visible.map((item) => (
          <HistoryCard
            key={item.id}
            item={item}
            onActivate={activate}
            onTogglePin={togglePin}
            onDelete={remove}
          />
        ))}
      </ul>
    </main>
  );
}
