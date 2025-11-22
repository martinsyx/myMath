import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL('https://kids-math.com'),
  title: {
    template: '%s | Kids Math Game',
    default: 'Kids Math Game - Fun Interactive Math Games for Children',
  },
  description: "A fun and interactive platform for kids to learn math through games and activities",
  generator: "v0.dev",
  alternates: {
    canonical: '/number-sense/basics/comparison',
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
