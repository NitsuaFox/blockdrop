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
    // Create explosion particles across the width of the cleared line
    for (let i = 0; i < 50; i++) {
      const particle: Particle = {
        x: x + Math.random() * width,
        y: y + Math.random() * 24, // Block height
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2, // Slight upward bias
        life: 0,
        maxLife: 60 + Math.random() * 40,
        color: this.getRandomParticleColor(color),
        size: 2 + Math.random() * 4,
        alpha: 1
      }
      this.particles.push(particle)
    }

    // Create star burst effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const speed = 3 + Math.random() * 2
      const particle: Particle = {
        x: x + width / 2,
        y: y + 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 80,
        color: 0xffffff,
        size: 6,
        alpha: 1
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
    
    // Render all particles
    this.particles.forEach(particle => {
      const graphics = new Graphics()
      
      // Create glow effect
      graphics.beginFill(particle.color, particle.alpha * 0.3)
      graphics.drawCircle(particle.x, particle.y, particle.size + 2)
      graphics.endFill()
      
      // Main particle
      graphics.beginFill(particle.color, particle.alpha)
      graphics.drawCircle(particle.x, particle.y, particle.size)
      graphics.endFill()
      
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