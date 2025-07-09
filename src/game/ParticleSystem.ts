import { Graphics, Container } from 'pixi.js'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: number
  size: number
  alpha: number
  rotation?: number
  rotationSpeed?: number
  sparkLength?: number
  sparkWidth?: number
}

export class ParticleSystem {
  private particles: Particle[] = []
  private container: Container
  private readonly MAX_PARTICLES = 200 // Hard limit to prevent browser freeze

  constructor(container: Container) {
    this.container = container
  }

  public createLineExplosion(x: number, y: number, width: number, color: number) {
    // Check particle limit before adding new ones
    if (this.particles.length > this.MAX_PARTICLES - 30) {
      this.clearOldestParticles(30)
    }
    
    // Epic lightning spark explosion
    for (let i = 0; i < 15; i++) {
      const particle: Particle = {
        x: x + Math.random() * width,
        y: y + Math.random() * 32,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 3,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        color: this.getLightningColor(),
        size: 1 + Math.random() * 2,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        sparkLength: 8 + Math.random() * 12,
        sparkWidth: 1 + Math.random() * 2
      }
      this.particles.push(particle)
    }

    // Lightning bolt burst effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const speed = 5 + Math.random() * 4
      const particle: Particle = {
        x: x + width / 2,
        y: y + 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40,
        color: 0xffffff,
        size: 2,
        alpha: 1,
        rotation: angle,
        rotationSpeed: 0,
        sparkLength: 15 + Math.random() * 10,
        sparkWidth: 2
      }
      this.particles.push(particle)
    }
  }

  public createBlockBreakEffect(x: number, y: number, color: number) {
    // Lightning spark break effect
    for (let i = 0; i < 4; i++) {
      const particle: Particle = {
        x: x + 16 + (Math.random() - 0.5) * 16,
        y: y + 16 + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 0,
        maxLife: 15 + Math.random() * 10,
        color: this.getLightningColor(),
        size: 1,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        sparkLength: 6 + Math.random() * 8,
        sparkWidth: 1
      }
      this.particles.push(particle)
    }
  }

  public createGlowTrail(x: number, y: number, color: number) {
    // Lightning spark trail
    if (Math.random() < 0.1) {
      const particle: Particle = {
        x: x + 16 + (Math.random() - 0.5) * 32,
        y: y + 16 + (Math.random() - 0.5) * 32,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        life: 0,
        maxLife: 12,
        color: this.getLightningColor(),
        size: 1,
        alpha: 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        sparkLength: 4 + Math.random() * 6,
        sparkWidth: 1
      }
      this.particles.push(particle)
    }
  }

  public createTetrisExplosion(centerX: number, centerY: number, boardWidth: number, boardHeight: number) {
    // Clear existing particles to make room for the explosion
    this.particles = []
    
    // MASSIVE CENTRAL EXPLOSION
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2
      const speed = 8 + Math.random() * 12
      const particle: Particle = {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        color: this.getTetrisExplosionColor(),
        size: 3 + Math.random() * 4,
        alpha: 1,
        rotation: angle,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
        sparkLength: 20 + Math.random() * 30,
        sparkWidth: 3 + Math.random() * 2
      }
      this.particles.push(particle)
    }

    // SHOCKWAVE RING
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2
      const speed = 15 + Math.random() * 8
      const particle: Particle = {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 80,
        color: 0xffffff,
        size: 2,
        alpha: 1,
        rotation: angle,
        rotationSpeed: 0,
        sparkLength: 40 + Math.random() * 20,
        sparkWidth: 4
      }
      this.particles.push(particle)
    }

    // SECONDARY EXPLOSIONS (smaller bursts)
    for (let burst = 0; burst < 8; burst++) {
      const burstX = centerX + (Math.random() - 0.5) * boardWidth
      const burstY = centerY + (Math.random() - 0.5) * boardHeight
      
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 4 + Math.random() * 8
        const particle: Particle = {
          x: burstX,
          y: burstY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: Math.random() * 20, // Staggered start times
          maxLife: 50 + Math.random() * 30,
          color: this.getTetrisExplosionColor(),
          size: 2 + Math.random() * 3,
          alpha: 0.8,
          rotation: angle,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          sparkLength: 12 + Math.random() * 18,
          sparkWidth: 2
        }
        this.particles.push(particle)
      }
    }

    // ASCENDING SPARKS (victory celebration)
    for (let i = 0; i < 30; i++) {
      const particle: Particle = {
        x: centerX + (Math.random() - 0.5) * boardWidth * 0.8,
        y: centerY + boardHeight * 0.3,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 15 - 5, // Always going up
        life: 0,
        maxLife: 100 + Math.random() * 50,
        color: this.getTetrisExplosionColor(),
        size: 1 + Math.random() * 2,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        sparkLength: 8 + Math.random() * 12,
        sparkWidth: 1
      }
      this.particles.push(particle)
    }

    console.log('TETRIS EXPLOSION! Created', this.particles.length, 'particles')
  }

  private getTetrisExplosionColor(): number {
    const tetrisColors = [
      0xffffff, // Pure white
      0xffff00, // Bright yellow
      0xff8800, // Bright orange  
      0xff0088, // Hot pink
      0x8800ff, // Purple
      0x0088ff, // Bright blue
      0x00ff88, // Bright green
      0xff4444, // Bright red
      0x44ff44, // Bright lime
      0x4444ff  // Bright blue
    ]
    return tetrisColors[Math.floor(Math.random() * tetrisColors.length)]
  }


  public update() {
    // Update all particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy
      
      // Update rotation for lightning sparks
      if (particle.rotation !== undefined && particle.rotationSpeed !== undefined) {
        particle.rotation += particle.rotationSpeed
      }
      
      // Apply gravity
      particle.vy += 0.08
      
      // Apply air resistance
      particle.vx *= 0.99
      particle.vy *= 0.99
      
      // Update life with flickering effect for lightning
      particle.life++
      const lifeRatio = particle.life / particle.maxLife
      particle.alpha = (1 - lifeRatio) * (0.8 + Math.random() * 0.4) // Flickering effect
      
      // Remove dead particles
      if (particle.life >= particle.maxLife) {
        this.particles.splice(i, 1)
      }
    }
  }

  public render() {
    // Clear previous particles
    this.container.removeChildren()
    
    // Render lightning sparks
    this.particles.forEach(particle => {
      const graphics = new Graphics()
      
      if (particle.sparkLength && particle.sparkWidth && particle.rotation !== undefined) {
        // Draw lightning spark
        this.drawLightningSpark(graphics, particle)
      } else {
        // Draw regular particle with enhanced glow
        this.drawGlowParticle(graphics, particle)
      }
      
      this.container.addChild(graphics)
    })
  }

  private drawLightningSpark(graphics: Graphics, particle: Particle) {
    const length = particle.sparkLength!
    const width = particle.sparkWidth!
    const rotation = particle.rotation!
    
    // Outer glow
    graphics.lineStyle(width + 4, particle.color, particle.alpha * 0.3)
    const endX = particle.x + Math.cos(rotation) * length
    const endY = particle.y + Math.sin(rotation) * length
    graphics.moveTo(particle.x, particle.y)
    graphics.lineTo(endX, endY)
    
    // Middle glow
    graphics.lineStyle(width + 2, particle.color, particle.alpha * 0.6)
    graphics.moveTo(particle.x, particle.y)
    graphics.lineTo(endX, endY)
    
    // Bright core
    graphics.lineStyle(width, 0xffffff, particle.alpha * 0.9)
    graphics.moveTo(particle.x, particle.y)
    graphics.lineTo(endX, endY)
    
    // Add branching sparks
    if (Math.random() < 0.3) {
      const branchAngle = rotation + (Math.random() - 0.5) * 1.5
      const branchLength = length * 0.4
      const branchEndX = endX + Math.cos(branchAngle) * branchLength
      const branchEndY = endY + Math.sin(branchAngle) * branchLength
      
      graphics.lineStyle(1, particle.color, particle.alpha * 0.7)
      graphics.moveTo(endX, endY)
      graphics.lineTo(branchEndX, branchEndY)
    }
  }

  private drawGlowParticle(graphics: Graphics, particle: Particle) {
    // Multiple glow layers
    for (let i = 3; i >= 1; i--) {
      graphics.beginFill(particle.color, particle.alpha * 0.2 / i)
      graphics.drawCircle(particle.x, particle.y, particle.size + i * 2)
      graphics.endFill()
    }
    
    // Bright core
    graphics.beginFill(0xffffff, particle.alpha * 0.9)
    graphics.drawCircle(particle.x, particle.y, particle.size * 0.5)
    graphics.endFill()
    
    // Main particle
    graphics.beginFill(particle.color, particle.alpha)
    graphics.drawCircle(particle.x, particle.y, particle.size)
    graphics.endFill()
  }

  private getLightningColor(): number {
    const lightningColors = [
      0xffffff, // Pure white
      0x00ffff, // Electric cyan  
      0x66ff66, // Electric green
      0xffff66, // Electric yellow
      0xcc99ff, // Electric purple
      0xff6666  // Electric pink
    ]
    return lightningColors[Math.floor(Math.random() * lightningColors.length)]
  }

  private getRandomParticleColor(baseColor: number): number {
    const colors = [
      baseColor,
      0xffffff,
      0xffff00,
      0x00ffff,
      0xff00ff,
      0x00ff00,
      0xff0000,
      0x0000ff
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  private clearOldestParticles(count: number) {
    // Remove the oldest particles to make room for new ones
    this.particles.splice(0, Math.min(count, this.particles.length))
  }

  public clear() {
    this.particles = []
    this.container.removeChildren()
  }
}