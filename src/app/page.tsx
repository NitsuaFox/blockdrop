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

    // Initialize PixiJS application - Full browser window
    const app = new Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x0a0a0a,
      antialias: true,
      resolution: window.devicePixelRatio || 1
    })

    appRef.current = app
    gameRef.current.appendChild(app.view as HTMLCanvasElement)

    // Initialize Tetris game
    tetrisRef.current = new TetrisGame(app)

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      if (appRef.current) {
        appRef.current.renderer.resize(width, height)
        if (tetrisRef.current) {
          tetrisRef.current.handleResize(width, height)
        }
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize)
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
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      overflow: 'hidden'
    }}>
      <div ref={gameRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}