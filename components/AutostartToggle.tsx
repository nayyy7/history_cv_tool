"use client";

import { useEffect, useState } from "react";

export function AutostartToggle() {
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const api = window.clipboardAPI;
    if (!api?.getOpenAtLogin) return;
    setAvailable(true);
    api.getOpenAtLogin().then(setEnabled).catch(() => setAvailable(false));
  }, []);

  if (!available) return null;

  async function onChange(next: boolean) {
    setEnabled(next);
    const api = window.clipboardAPI;
    if (!api?.setOpenAtLogin) return;
    const applied = await api.setOpenAtLogin(next);
    setEnabled(applied);
  }

  return (
    <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-rose-700">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-300"
      />
      开机自动启动
    </label>
  );
}
