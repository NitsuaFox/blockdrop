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
  private readonly MAX_PARTICLES = 200 // Hard limit to prevent browser freeze

  constructor(container: Container) {
    this.container = container
  }

  public createLineExplosion(x: number, y: number, width: number, color: number) {
    // Check particle limit before adding new ones
    if (this.particles.length > this.MAX_PARTICLES - 30) {
      this.clearOldestParticles(30)
    }
    
    // Much smaller explosion - only 28 particles total
    for (let i = 0; i < 20; i++) {
      const particle: Particle = {
        x: x + Math.random() * width,
        y: y + Math.random() * 32,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        life: 0,
        maxLife: 40 + Math.random() * 20,
        color: this.getRandomParticleColor(color),
        size: 2 + Math.random() * 3,
        alpha: 1
      }
      this.particles.push(particle)
    }

    // Small star burst effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const speed = 3 + Math.random() * 2
      const particle: Particle = {
        x: x + width / 2,
        y: y + 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 60,
        color: 0xffffff,
        size: 4,
        alpha: 1
      }
      this.particles.push(particle)
    }
  }

  public createBlockBreakEffect(x: number, y: number, color: number) {
    // Much smaller explosion for individual blocks
    for (let i = 0; i < 5; i++) {
      const particle: Particle = {
        x: x + 16 + (Math.random() - 0.5) * 16,
        y: y + 16 + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 0,
        maxLife: 20 + Math.random() * 10, // Much shorter
        color: this.getRandomParticleColor(color),
        size: 1 + Math.random(),
        alpha: 1
      }
      this.particles.push(particle)
    }
  }

  public createGlowTrail(x: number, y: number, color: number) {
    // Much less frequent trail particles
    if (Math.random() < 0.1) { // Only 10% chance
      const particle: Particle = {
        x: x + 16 + (Math.random() - 0.5) * 32,
        y: y + 16 + (Math.random() - 0.5) * 32,
        vx: (Math.random() - 0.5) * 1,
        vy: Math.random() + 0.5,
        life: 0,
        maxLife: 15, // Shorter life
        color: color,
        size: 1,
        alpha: 0.5
      }
      this.particles.push(particle)
    }
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

  private clearOldestParticles(count: number) {
    // Remove the oldest particles to make room for new ones
    this.particles.splice(0, Math.min(count, this.particles.length))
  }

  public clear() {
    this.particles = []
    this.container.removeChildren()
  }
}