import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://kids-math.com"),
  applicationName: "EasyMath AI",
  title: {
    template: "%s | EasyMath AI",
    default: "EasyMath AI – 自适应儿童数学平台",
  },
  description:
    "EasyMath AI 通过自适应出题、IRT 能力评估与学习报告，让 5-12 岁孩子在互动数学游戏中持续提升计算力与数感。",
  keywords: [
    "EasyMath AI",
    "kids math games",
    "adaptive learning",
    "addition practice",
    "math assessment",
    "learning analytics",
  ],
  authors: [{ name: "EasyMath AI Team", url: "https://kids-math.com" }],
  creator: "EasyMath AI",
  publisher: "EasyMath",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://kids-math.com",
    siteName: "EasyMath AI",
    title: "EasyMath AI – 自适应儿童数学平台",
    description:
      "AI 驱动的儿童数学练习，结合实时难度调节、学习报告与中英文内容，帮助孩子在 100 以内运算与数感训练中稳步进阶。",
    locale: "zh_CN",
    images: [
      {
        url: "https://kids-math.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EasyMath AI – Adaptive Math Practice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EasyMath AI – 自适应儿童数学平台",
    description:
      "用 AI 加持的互动数学练习与学习报告，帮助孩子建立扎实的数感与运算力。",
    images: ["https://kids-math.com/og-image.jpg"],
  },
  category: "education",
  generator: "Codex CLI",
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="font-sans">
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
