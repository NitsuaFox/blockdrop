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
}

export class ParticleSystem {
  private particles: Particle[] = []
  private container: Container

  constructor(container: Container) {
    this.container = container
  }

  public createLineExplosion(x: number, y: number, width: number, color: number) {
    // Massive explosion particles across the width of the cleared line
    for (let i = 0; i < 150; i++) {
      const particle: Particle = {
        x: x + Math.random() * width,
        y: y + Math.random() * 32, // Bigger block height
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 3, // More upward bias
        life: 0,
        maxLife: 80 + Math.random() * 60,
        color: this.getRandomParticleColor(color),
        size: 3 + Math.random() * 6,
        alpha: 1
      }
      this.particles.push(particle)
    }

    // Enhanced star burst effect with more particles
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const speed = 5 + Math.random() * 4
      const particle: Particle = {
        x: x + width / 2,
        y: y + 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 120,
        color: 0xffffff,
        size: 8 + Math.random() * 4,
        alpha: 1
      }
      this.particles.push(particle)
    }

    // Add shockwave effect
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2
      const speed = 8 + Math.random() * 3
      const particle: Particle = {
        x: x + width / 2,
        y: y + 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40,
        color: 0x00ffff,
        size: 2,
        alpha: 0.8
      }
      this.particles.push(particle)
    }
  }

  public createBlockBreakEffect(x: number, y: number, color: number) {
    // Create smaller explosion for individual blocks
    for (let i = 0; i < 15; i++) {
      const particle: Particle = {
        x: x + 12 + (Math.random() - 0.5) * 12,
        y: y + 12 + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        color: this.getRandomParticleColor(color),
        size: 1 + Math.random() * 2,
        alpha: 1
      }
      this.particles.push(particle)
    }
  }

  public createGlowTrail(x: number, y: number, color: number) {
    // Create glowing trail particles for moving pieces
    const particle: Particle = {
      x: x + 12 + (Math.random() - 0.5) * 24,
      y: y + 12 + (Math.random() - 0.5) * 24,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1,
      life: 0,
      maxLife: 20,
      color: color,
      size: 1,
      alpha: 0.6
    }
    this.particles.push(particle)
  }

  public update() {
    // Update all particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy
      
      // Apply gravity
      particle.vy += 0.1
      
      // Apply air resistance
      particle.vx *= 0.98
      particle.vy *= 0.98
      
      // Update life
      particle.life++
      particle.alpha = 1 - (particle.life / particle.maxLife)
      
      // Remove dead particles
      if (particle.life >= particle.maxLife) {
        this.particles.splice(i, 1)
      }
    }
  }

  public render() {
    // Clear previous particles
    this.container.removeChildren()
    
    // Render all particles with enhanced effects
    this.particles.forEach(particle => {
      const graphics = new Graphics()
      
      // Multiple glow layers for amazing effect
      for (let i = 4; i >= 1; i--) {
        graphics.beginFill(particle.color, particle.alpha * 0.1 / i)
        graphics.drawCircle(particle.x, particle.y, particle.size + i * 3)
        graphics.endFill()
      }
      
      // Bright core
      graphics.beginFill(0xffffff, particle.alpha * 0.8)
      graphics.drawCircle(particle.x, particle.y, particle.size * 0.3)
      graphics.endFill()
      
      // Main particle with gradient effect
      graphics.beginFill(particle.color, particle.alpha)
      graphics.drawCircle(particle.x, particle.y, particle.size)
      graphics.endFill()
      
      // Add sparkle effect for large particles
      if (particle.size > 5) {
        graphics.lineStyle(1, 0xffffff, particle.alpha)
        graphics.moveTo(particle.x - particle.size, particle.y)
        graphics.lineTo(particle.x + particle.size, particle.y)
        graphics.moveTo(particle.x, particle.y - particle.size)
        graphics.lineTo(particle.x, particle.y + particle.size)
      }
      
      this.container.addChild(graphics)
    })
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

  public clear() {
    this.particles = []
    this.container.removeChildren()
  }
}