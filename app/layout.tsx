import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
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
    <html lang="en" className={`${inter.variable} ${fredoka.variable} antialiased`}>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8356923986420655" crossOrigin="anonymous"></script>
      </head>
      {/* <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['WebSite', 'WebApplication'],
              name: 'Kids Math Game',
              description: 'A fun and interactive platform designed for kids to learn math through games and activities.',
              applicationCategory: 'EducationalApplication',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              },
              audience: {
                '@type': 'EducationalAudience',
                educationalRole: 'student',
                ageRange: '5-12'
              },
              teaches: [
                'Number Sense',
                'Addition',
                'Subtraction',
                'Multiplication',
                'Division'
              ],
              publisher: {
                '@type': 'Organization',
                name: 'EasyMath'
              }
            })
          }}
        />
      </head> */}
      <body className="font-sans">
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                +
              </div>
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
                Kids Math Game
              </Link>
            </div>
            <nav className="flex items-center">
              <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
