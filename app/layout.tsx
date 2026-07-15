import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "历史粘贴板",
  description: "本机历史剪贴板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
