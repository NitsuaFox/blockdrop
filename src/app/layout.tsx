import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BlockDrop - Tetris Clone',
  description: 'Amazing graphics Tetris clone built with Next.js and PixiJS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#000' }}>
        {children}
      </body>
    </html>
  )
}