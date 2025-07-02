import { Graphics, Container, Point } from 'pixi.js'

interface FloatingShape {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  scale: number
  targetScale: number
  color: number
  alpha: number
  type: 'circle' | 'triangle' | 'diamond' | 'hexagon'
  size: number
  pulsePhase: number
}

interface RibbonPoint {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

interface Ribbon {
  points: RibbonPoint[]
  color: number
  width: number
  alpha: number
  wavePhase: number
  waveSpeed: number
}

export class BackgroundEffects {
  private container: Container
  private shapesContainer: Container
  private ribbonsContainer: Container
  private shapes: FloatingShape[] = []
  private ribbons: Ribbon[] = []
  private screenWidth: number
  private screenHeight: number
  private time = 0

  constructor(container: Container, screenWidth: number, screenHeight: number) {
    this.container = container
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight

    // Create sub-containers for layering
    this.ribbonsContainer = new Container()
    this.shapesContainer = new Container()
    
    this.container.addChild(this.ribbonsContainer)
    this.container.addChild(this.shapesContainer)

    this.initializeShapes()
    this.initializeRibbons()
  }

  private initializeShapes() {
    // Create various floating geometric shapes
    const shapeTypes: ('circle' | 'triangle' | 'diamond' | 'hexagon')[] = ['circle', 'triangle', 'diamond', 'hexagon']
    
    for (let i = 0; i < 12; i++) {
      const shape: FloatingShape = {
        x: Math.random() * this.screenWidth,
        y: Math.random() * this.screenHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        scale: 0.3 + Math.random() * 0.7,
        targetScale: 0.3 + Math.random() * 0.7,
        color: this.getRandomShapeColor(),
        alpha: 0.1 + Math.random() * 0.3,
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        size: 20 + Math.random() * 40,
        pulsePhase: Math.random() * Math.PI * 2
      }
      this.shapes.push(shape)
    }
  }

  private initializeRibbons() {
    // Create flowing ribbons
    for (let i = 0; i < 4; i++) {
      const ribbon: Ribbon = {
        points: [],
        color: this.getRandomRibbonColor(),
        width: 3 + Math.random() * 5,
        alpha: 0.2 + Math.random() * 0.3,
        wavePhase: Math.random() * Math.PI * 2,
        waveSpeed: 0.02 + Math.random() * 0.03
      }

      // Initialize ribbon points
      for (let j = 0; j < 8; j++) {
        ribbon.points.push({
          x: (j / 7) * this.screenWidth,
          y: this.screenHeight * 0.2 + Math.random() * this.screenHeight * 0.6,
          vx: 0.2 + Math.random() * 0.3,
          vy: (Math.random() - 0.5) * 0.1,
          life: 0,
          maxLife: 300 + Math.random() * 200
        })
      }
      
      this.ribbons.push(ribbon)
    }
  }

  private getRandomShapeColor(): number {
    const colors = [
      0x4a90e2, // Blue
      0x7ed321, // Green
      0xf5a623, // Orange
      0xd0021b, // Red
      0x9013fe, // Purple
      0x50e3c2, // Cyan
      0xbd10e0, // Magenta
      0xf8e71c  // Yellow
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  private getRandomRibbonColor(): number {
    const colors = [
      0x00d4ff, // Electric blue
      0xff006e, // Hot pink
      0x8338ec, // Purple
      0x3a86ff, // Blue
      0x06ffa5, // Mint green
      0xffbe0b, // Golden yellow
      0xff4081, // Pink
      0x00bcd4  // Teal
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  public update(frequencyData: { bass: number; mid: number; treble: number; overall: number } | null) {
    this.time += 0.016 // ~60fps

    // Update shapes
    this.updateShapes(frequencyData)
    
    // Update ribbons
    this.updateRibbons(frequencyData)
  }

  private updateShapes(frequencyData: { bass: number; mid: number; treble: number; overall: number } | null) {
    this.shapes.forEach(shape => {
      // Basic movement
      shape.x += shape.vx
      shape.y += shape.vy
      shape.rotation += shape.rotationSpeed

      // Update pulse phase
      shape.pulsePhase += 0.05

      // Audio-reactive scaling
      if (frequencyData) {
        const intensity = frequencyData.overall
        shape.targetScale = 0.5 + intensity * 1.5
        
        // Different shapes react to different frequencies
        switch (shape.type) {
          case 'circle':
            shape.targetScale += frequencyData.bass * 0.8
            break
          case 'triangle':
            shape.targetScale += frequencyData.mid * 0.6
            break
          case 'diamond':
            shape.targetScale += frequencyData.treble * 1.0
            break
          case 'hexagon':
            shape.targetScale += (frequencyData.bass + frequencyData.treble) * 0.4
            break
        }
      }

      // Smooth scale interpolation
      shape.scale += (shape.targetScale - shape.scale) * 0.1

      // Boundary wrapping
      if (shape.x < -50) shape.x = this.screenWidth + 50
      if (shape.x > this.screenWidth + 50) shape.x = -50
      if (shape.y < -50) shape.y = this.screenHeight + 50
      if (shape.y > this.screenHeight + 50) shape.y = -50

      // Occasionally change direction
      if (Math.random() < 0.002) {
        shape.vx += (Math.random() - 0.5) * 0.2
        shape.vy += (Math.random() - 0.5) * 0.2
        
        // Clamp velocity
        shape.vx = Math.max(-1, Math.min(1, shape.vx))
        shape.vy = Math.max(-1, Math.min(1, shape.vy))
      }
    })
  }

  private updateRibbons(frequencyData: { bass: number; mid: number; treble: number; overall: number } | null) {
    this.ribbons.forEach(ribbon => {
      ribbon.wavePhase += ribbon.waveSpeed

      // Audio-reactive wave intensity
      let waveIntensity = 1.0
      if (frequencyData) {
        waveIntensity = 1.0 + frequencyData.mid * 2.0
        ribbon.alpha = 0.3 + frequencyData.overall * 0.4
      }

      ribbon.points.forEach((point, index) => {
        // Wave motion
        const waveOffset = Math.sin(ribbon.wavePhase + index * 0.5) * 30 * waveIntensity
        point.vy += waveOffset * 0.01

        // Update position
        point.x += point.vx
        point.y += point.vy

        // Update life
        point.life++

        // Reset point when it goes off screen or dies
        if (point.x > this.screenWidth + 100 || point.life > point.maxLife) {
          point.x = -50
          point.y = this.screenHeight * 0.2 + Math.random() * this.screenHeight * 0.6
          point.life = 0
          point.maxLife = 300 + Math.random() * 200
        }

        // Add some randomness to movement
        if (Math.random() < 0.01) {
          point.vy += (Math.random() - 0.5) * 0.05
        }

        // Clamp vertical velocity
        point.vy = Math.max(-0.5, Math.min(0.5, point.vy))
      })
    })
  }

  public render() {
    // Clear previous renders
    this.shapesContainer.removeChildren()
    this.ribbonsContainer.removeChildren()

    // Render ribbons first (behind shapes)
    this.renderRibbons()
    
    // Render shapes
    this.renderShapes()
  }

  private renderShapes() {
    this.shapes.forEach(shape => {
      const graphics = new Graphics()
      
      // Calculate pulsing alpha
      const pulseAlpha = shape.alpha * (0.8 + Math.sin(shape.pulsePhase) * 0.3)
      
      // Outer glow
      graphics.beginFill(shape.color, pulseAlpha * 0.3)
      this.drawShape(graphics, shape, shape.size * shape.scale * 1.4)
      graphics.endFill()

      // Inner glow
      graphics.beginFill(shape.color, pulseAlpha * 0.6)
      this.drawShape(graphics, shape, shape.size * shape.scale * 1.2)
      graphics.endFill()

      // Main shape
      graphics.beginFill(shape.color, pulseAlpha)
      this.drawShape(graphics, shape, shape.size * shape.scale)
      graphics.endFill()

      // Bright core
      graphics.beginFill(0xffffff, pulseAlpha * 0.4)
      this.drawShape(graphics, shape, shape.size * shape.scale * 0.6)
      graphics.endFill()

      this.shapesContainer.addChild(graphics)
    })
  }

  private drawShape(graphics: Graphics, shape: FloatingShape, size: number) {
    const x = shape.x
    const y = shape.y
    const rotation = shape.rotation

    graphics.save()
    graphics.translate(x, y)
    graphics.rotate(rotation)

    switch (shape.type) {
      case 'circle':
        graphics.drawCircle(0, 0, size / 2)
        break
      case 'triangle':
        graphics.drawPolygon([
          new Point(0, -size / 2),
          new Point(-size / 2, size / 2),
          new Point(size / 2, size / 2)
        ])
        break
      case 'diamond':
        graphics.drawPolygon([
          new Point(0, -size / 2),
          new Point(size / 2, 0),
          new Point(0, size / 2),
          new Point(-size / 2, 0)
        ])
        break
      case 'hexagon':
        const hexPoints = []
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2
          hexPoints.push(new Point(
            Math.cos(angle) * size / 2,
            Math.sin(angle) * size / 2
          ))
        }
        graphics.drawPolygon(hexPoints)
        break
    }

    graphics.restore()
  }

  private renderRibbons() {
    this.ribbons.forEach(ribbon => {
      const graphics = new Graphics()
      
      if (ribbon.points.length < 2) return

      // Draw ribbon with smooth curves
      graphics.lineStyle(ribbon.width + 4, ribbon.color, ribbon.alpha * 0.3) // Outer glow
      this.drawRibbonPath(graphics, ribbon.points)

      graphics.lineStyle(ribbon.width + 2, ribbon.color, ribbon.alpha * 0.6) // Middle glow
      this.drawRibbonPath(graphics, ribbon.points)

      graphics.lineStyle(ribbon.width, ribbon.color, ribbon.alpha) // Main ribbon
      this.drawRibbonPath(graphics, ribbon.points)

      graphics.lineStyle(ribbon.width * 0.5, 0xffffff, ribbon.alpha * 0.5) // Bright core
      this.drawRibbonPath(graphics, ribbon.points)

      this.ribbonsContainer.addChild(graphics)
    })
  }

  private drawRibbonPath(graphics: Graphics, points: RibbonPoint[]) {
    graphics.moveTo(points[0].x, points[0].y)
    
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      graphics.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
    }
    
    // Draw to the last point
    if (points.length > 1) {
      graphics.lineTo(points[points.length - 1].x, points[points.length - 1].y)
    }
  }

  public clear() {
    this.shapesContainer.removeChildren()
    this.ribbonsContainer.removeChildren()
  }
}