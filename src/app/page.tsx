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

    console.log('Initializing PixiJS application...')

    try {
      // Calculate responsive dimensions for mobile
      const isMobile = window.innerWidth <= 768
      const gameWidth = isMobile ? Math.min(window.innerWidth - 20, 400) : 1200
      const gameHeight = isMobile ? window.innerHeight - 100 : 800
      
      // Initialize PixiJS application - Responsive size
      const app = new Application({
        width: gameWidth,
        height: gameHeight,
        backgroundColor: 0x0a0a0a,
        antialias: true
      })

      console.log('PixiJS app created, adding to DOM...')
      appRef.current = app
      gameRef.current.appendChild(app.view as HTMLCanvasElement)

      console.log('Initializing Tetris game...')
      // Initialize Tetris game
      tetrisRef.current = new TetrisGame(app)
      console.log('Tetris game initialized successfully')

    } catch (error) {
      console.error('Error initializing game:', error)
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up game...')
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
      backgroundColor: '#000',
      padding: '10px',
      overflow: 'hidden',
      touchAction: 'none', // Prevent pull-to-refresh
      userSelect: 'none', // Prevent text selection
      WebkitUserSelect: 'none'
    }}>
      <div ref={gameRef} style={{
        maxWidth: '100%',
        maxHeight: '100%',
        touchAction: 'manipulation' // Allow touch but prevent default gestures
      }} />
    </div>
  )
}