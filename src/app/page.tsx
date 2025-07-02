'use client'

import { useEffect, useRef } from 'react'
import { Application } from 'pixi.js'

export default function Home() {
  const gameRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)

  useEffect(() => {
    if (!gameRef.current) return

    // Initialize PixiJS application
    const app = new Application({
      width: 800,
      height: 600,
      backgroundColor: 0x1a1a2e,
      antialias: true
    })

    appRef.current = app
    gameRef.current.appendChild(app.view as HTMLCanvasElement)

    // Cleanup function
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true)
      }
    }
  }, [])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#000'
    }}>
      <div ref={gameRef} />
    </div>
  )
}