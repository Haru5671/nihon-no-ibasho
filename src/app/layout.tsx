import type { Metadata } from "next";
import Script from "next/script";
import PageTracker from "@/components/PageTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "にほんのいばしょ — AI時代に、人間が人間の存在意味を支え合う場所",
  description:
    "AI時代に人間の「存在意味」「役割」「つながり」を再定義し、心の拠り所となるオンラインコミュニティ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased pt-[57px]">
        <PageTracker />
        {children}
        {process.env.NEXT_PUBLIC_ADSENSE_PUB_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
