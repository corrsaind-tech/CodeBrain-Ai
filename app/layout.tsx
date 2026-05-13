import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MuyMuy AI - Chat Cifrado',
  description: 'Plataforma de chat AI cifrada con CoreHub',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-[#0a0a0a]">
      <body>{children}</body>
    </html>
  )
}
