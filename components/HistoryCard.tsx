import type { HistoryItem } from "@/types/clipboard";

type HistoryCardProps = {
  item: HistoryItem;
  onActivate: (item: HistoryItem) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
};

export function HistoryCard({
  item,
  onActivate,
  onTogglePin,
  onDelete,
}: HistoryCardProps) {
  return (
    <li className="overflow-hidden rounded-xl border border-rose-200/80 bg-white shadow-sm transition hover:border-rose-300">
      <button
        type="button"
        onClick={() => onActivate(item)}
        className="block w-full p-3 text-left"
      >
        <time className="mb-1 block text-xs text-rose-400">
          {new Date(item.at).toLocaleTimeString()}
          {item.pinned ? " · 已置顶" : ""}
        </time>
        {item.type === "image" && item.dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.dataUrl}
            alt="剪贴板图片"
            className="max-h-40 rounded-md object-contain"
          />
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm text-rose-950">
            {item.text ?? ""}
          </p>
        )}
      </button>
      <div className="flex gap-2 border-t border-rose-100 px-3 py-2">
        <button
          type="button"
          onClick={() => onTogglePin(item.id)}
          className="rounded-md px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
        >
          {item.pinned ? "取消置顶" : "置顶"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="rounded-md px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
        >
          删除
        </button>
      </div>
    </li>
  );
}
