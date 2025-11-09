'use client';

import Script from 'next/script';

interface AdSenseProps {
  /**
   * Only load AdSense on pages with substantial content
   * Set to true to enable ads on this page
   */
  enabled?: boolean;
}

export default function AdSense({ enabled = false }: AdSenseProps) {
  if (!enabled) {
    return null;
  }

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8356923986420655"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
