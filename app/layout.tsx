import type React from "react"
import type { Metadata } from "next"
import { Inter, Fredoka } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const fredoka = Fredoka({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fredoka",
})

export const metadata: Metadata = {
  title: "EasyMath - Kids Math Games",
  description: "A fun and interactive platform for kids to learn math through games and activities",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fredoka.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
