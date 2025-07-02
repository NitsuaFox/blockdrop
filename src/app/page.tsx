'use client'

import { useEffect, useRef, useState } from 'react'
import { Application } from 'pixi.js'
import { TetrisGame } from '@/game/TetrisGame'

export default function Home() {
  const gameRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const tetrisRef = useRef<TetrisGame | null>(null)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    // Set initial dimensions
    const updateDimensions = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setDimensions({ width, height })
      
      // Resize PIXI application if it exists
      if (appRef.current) {
        appRef.current.renderer.resize(width, height)
        if (tetrisRef.current) {
          tetrisRef.current.handleResize(width, height)
        }
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!gameRef.current) return

    // Initialize PixiJS application - Full browser window
    const app = new Application({
      width: dimensions.width,
      height: dimensions.height,
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
  }, [dimensions])

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