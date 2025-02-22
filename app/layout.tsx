import type { Metadata } from 'next'
import { Lora, Playfair_Display } from 'next/font/google'

import './globals.css'

const lora = Lora({ 
  subsets: ['latin'],
  variable: '--font-lora',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'TEI Comment Aligner',
  description: 'Align comments with TEI text passages for 19th-century Italian novels',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${lora.variable} ${playfair.variable}`}>
      <body className="font-serif bg-gradient-to-br from-[#f8f4e9] to-[#f0e8d5]">
        {children}
      </body>
    </html>
  )
}

