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

    // Add some test graphics to verify PixiJS is working
    const { Graphics, Text } = require('pixi.js')
    
    // Create a colorful rectangle
    const rect = new Graphics()
    rect.beginFill(0xff0000)
    rect.drawRect(100, 100, 200, 150)
    rect.endFill()
    app.stage.addChild(rect)

    // Add rotating square
    const square = new Graphics()
    square.beginFill(0x00ff00)
    square.drawRect(-25, -25, 50, 50)
    square.endFill()
    square.x = 400
    square.y = 200
    app.stage.addChild(square)

    // Add title text
    const title = new Text('BlockDrop Tetris', {
      fontSize: 48,
      fill: 0xffffff,
      fontWeight: 'bold'
    })
    title.x = 400 - title.width / 2
    title.y = 50
    app.stage.addChild(title)

    // Animate the square
    app.ticker.add(() => {
      square.rotation += 0.02
    })

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