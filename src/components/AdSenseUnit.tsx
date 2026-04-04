"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSenseUnitProps {
  slot?: string;
  format?: string;
  className?: string;
}

export default function AdSenseUnit({
  slot = "xxxxxxxxxx",
  format = "auto",
  className = "",
}: AdSenseUnitProps) {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  useEffect(() => {
    if (!pubId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet
    }
  }, [pubId]);

  if (!pubId) {
    return (
      <div
        className={`bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400 text-xs ${className}`}
      >
        広告スペース（AdSense PUB_ID未設定）
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={`ca-pub-${pubId}`}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
