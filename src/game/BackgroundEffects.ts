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


export class BackgroundEffects {
  private container: Container
  private shapesContainer: Container
  private shapes: FloatingShape[] = []
  private screenWidth: number
  private screenHeight: number
  private time = 0

  constructor(container: Container, screenWidth: number, screenHeight: number) {
    this.container = container
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight

    // Create sub-container for shapes
    this.shapesContainer = new Container()
    this.container.addChild(this.shapesContainer)

    this.initializeShapes()
  }

  private initializeShapes() {
    // Create various floating geometric shapes
    const shapeTypes: ('circle' | 'triangle' | 'diamond' | 'hexagon')[] = ['circle', 'triangle', 'diamond', 'hexagon']
    
    for (let i = 0; i < 16; i++) {
      const shape: FloatingShape = {
        x: Math.random() * this.screenWidth,
        y: Math.random() * this.screenHeight,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        scale: 0.2 + Math.random() * 0.8,
        targetScale: 0.2 + Math.random() * 0.8,
        color: this.getRandomShapeColor(),
        alpha: 0.05 + Math.random() * 0.15,
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        size: 15 + Math.random() * 50,
        pulsePhase: Math.random() * Math.PI * 2
      }
      this.shapes.push(shape)
    }
  }


  private getRandomShapeColor(): number {
    const colors = [
      0x2a4a72, // Desaturated blue
      0x4a6641, // Desaturated green
      0x7a5a33, // Desaturated orange
      0x6a2a2b, // Desaturated red
      0x5a3a7e, // Desaturated purple
      0x3a6a62, // Desaturated cyan
      0x6a3a60, // Desaturated magenta
      0x7a7a3c  // Desaturated yellow
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }


  public update(frequencyData: { bass: number; mid: number; treble: number; overall: number } | null) {
    this.time += 0.016 // ~60fps

    // Update shapes
    this.updateShapes(frequencyData)
  }

  private updateShapes(frequencyData: { bass: number; mid: number; treble: number; overall: number } | null) {
    this.shapes.forEach(shape => {
      // Basic movement
      shape.x += shape.vx
      shape.y += shape.vy
      shape.rotation += shape.rotationSpeed

      // Update pulse phase
      shape.pulsePhase += 0.05

      // Enhanced audio-reactive scaling and movement
      if (frequencyData) {
        const intensity = frequencyData.overall
        shape.targetScale = 0.4 + intensity * 2.0
        
        // Different shapes react to different frequencies with more intensity
        switch (shape.type) {
          case 'circle':
            shape.targetScale += frequencyData.bass * 1.5
            shape.rotationSpeed = (Math.random() - 0.5) * 0.08 * (1 + frequencyData.bass)
            // Bass makes circles move more dramatically
            if (frequencyData.bass > 0.7) {
              shape.vx += (Math.random() - 0.5) * 0.3
              shape.vy += (Math.random() - 0.5) * 0.3
            }
            break
          case 'triangle':
            shape.targetScale += frequencyData.mid * 1.2
            shape.rotationSpeed = (Math.random() - 0.5) * 0.1 * (1 + frequencyData.mid)
            // Mid frequencies make triangles dance
            if (frequencyData.mid > 0.6) {
              shape.pulsePhase += 0.1
            }
            break
          case 'diamond':
            shape.targetScale += frequencyData.treble * 1.8
            shape.rotationSpeed = (Math.random() - 0.5) * 0.12 * (1 + frequencyData.treble)
            // High frequencies make diamonds sparkle and spin fast
            if (frequencyData.treble > 0.5) {
              shape.alpha = Math.min(0.8, shape.alpha + 0.1)
            }
            break
          case 'hexagon':
            shape.targetScale += (frequencyData.bass + frequencyData.treble) * 0.8
            shape.rotationSpeed = (Math.random() - 0.5) * 0.06 * (1 + frequencyData.overall)
            // Hexagons react to overall intensity
            if (frequencyData.overall > 0.8) {
              shape.scale += 0.05
            }
            break
        }
        
        // Overall intensity affects all movement
        if (intensity > 0.7) {
          shape.vx *= 1.2
          shape.vy *= 1.2
        }
      }

      // Smooth scale interpolation
      shape.scale += (shape.targetScale - shape.scale) * 0.1

      // Boundary wrapping
      if (shape.x < -50) shape.x = this.screenWidth + 50
      if (shape.x > this.screenWidth + 50) shape.x = -50
      if (shape.y < -50) shape.y = this.screenHeight + 50
      if (shape.y > this.screenHeight + 50) shape.y = -50

      // More frequent direction changes for more dynamic movement
      if (Math.random() < 0.005) {
        shape.vx += (Math.random() - 0.5) * 0.4
        shape.vy += (Math.random() - 0.5) * 0.4
        
        // Clamp velocity
        shape.vx = Math.max(-1.5, Math.min(1.5, shape.vx))
        shape.vy = Math.max(-1.5, Math.min(1.5, shape.vy))
      }
      
      // Apply friction to prevent infinite acceleration
      shape.vx *= 0.995
      shape.vy *= 0.995
    })
  }


  public render() {
    // Clear previous renders
    this.shapesContainer.removeChildren()
    
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

    switch (shape.type) {
      case 'circle':
        graphics.drawCircle(x, y, size / 2)
        break
      case 'triangle':
        graphics.drawPolygon(this.getRotatedPoints([
          new Point(0, -size / 2),
          new Point(-size / 2, size / 2),
          new Point(size / 2, size / 2)
        ], x, y, rotation))
        break
      case 'diamond':
        graphics.drawPolygon(this.getRotatedPoints([
          new Point(0, -size / 2),
          new Point(size / 2, 0),
          new Point(0, size / 2),
          new Point(-size / 2, 0)
        ], x, y, rotation))
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
        graphics.drawPolygon(this.getRotatedPoints(hexPoints, x, y, rotation))
        break
    }
  }

  private getRotatedPoints(points: Point[], centerX: number, centerY: number, rotation: number): Point[] {
    return points.map(point => {
      const cos = Math.cos(rotation)
      const sin = Math.sin(rotation)
      const rotatedX = point.x * cos - point.y * sin
      const rotatedY = point.x * sin + point.y * cos
      return new Point(centerX + rotatedX, centerY + rotatedY)
    })
  }



  public clear() {
    this.shapesContainer.removeChildren()
  }
}