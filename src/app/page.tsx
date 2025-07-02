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
      // Initialize PixiJS application - Fixed size like before
      const app = new Application({
        width: 1200,
        height: 800,
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
      backgroundColor: '#000'
    }}>
      <div ref={gameRef} />
    </div>
  )
}