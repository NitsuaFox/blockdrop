import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BlockDrop - Tetris Clone',
  description: 'Amazing graphics Tetris clone built with Next.js and PixiJS',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: '#000',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        overscrollBehavior: 'none' // Prevent pull-to-refresh
      }}>
        {children}
      </body>
    </html>
  )
}