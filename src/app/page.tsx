'use client'

import { useEffect, useRef } from 'react'
import { Application } from 'pixi.js'
import { TetrisGame } from '@/game/TetrisGame'

export default function Home() {
  const gameRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const tetrisRef = useRef<TetrisGame | null>(null)

  useEffect(() => {
    if (!gameRef.current) return

    // Initialize PixiJS application - Much bigger for better visuals
    const app = new Application({
      width: 1200,
      height: 800,
      backgroundColor: 0x0a0a0a,
      antialias: true,
      resolution: window.devicePixelRatio || 1
    })

    appRef.current = app
    gameRef.current.appendChild(app.view as HTMLCanvasElement)

    // Initialize Tetris game
    tetrisRef.current = new TetrisGame(app)

    // Cleanup function
    return () => {
      if (tetrisRef.current) {
        tetrisRef.current.destroy()
      }
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