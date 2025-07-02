import { Application, Graphics, Container, Text, Ticker } from 'pixi.js'
import { ParticleSystem } from './ParticleSystem'

export interface Position {
  x: number
  y: number
}

export interface Tetromino {
  shape: number[][]
  color: number
  glowColor: number
  x: number
  y: number
  type: string
}

export class TetrisGame {
  private app: Application
  private gameContainer!: Container
  private boardContainer!: Container
  private uiContainer!: Container
  private particleContainer!: Container
  private particleSystem!: ParticleSystem
  private board: number[][]
  private currentPiece: Tetromino | null = null
  private nextPiece: Tetromino | null = null
  private score = 0
  private level = 1
  private lines = 0
  private dropTimer = 0
  private dropInterval = 1000 // milliseconds
  private gameRunning = true
  
  // NES Tetris dimensions
  private readonly BOARD_WIDTH = 10
  private readonly BOARD_HEIGHT = 20
  private readonly BLOCK_SIZE = 24
  
  // Tetromino definitions with modern colors
  private tetrominoes = {
    I: { 
      shape: [[1,1,1,1]], 
      color: 0x00ffff, 
      glowColor: 0x66ffff,
      type: 'I'
    },
    O: { 
      shape: [[1,1],[1,1]], 
      color: 0xffff00, 
      glowColor: 0xffff66,
      type: 'O'
    },
    T: { 
      shape: [[0,1,0],[1,1,1]], 
      color: 0xff00ff, 
      glowColor: 0xff66ff,
      type: 'T'
    },
    S: { 
      shape: [[0,1,1],[1,1,0]], 
      color: 0x00ff00, 
      glowColor: 0x66ff66,
      type: 'S'
    },
    Z: { 
      shape: [[1,1,0],[0,1,1]], 
      color: 0xff0000, 
      glowColor: 0xff6666,
      type: 'Z'
    },
    J: { 
      shape: [[1,0,0],[1,1,1]], 
      color: 0x0000ff, 
      glowColor: 0x6666ff,
      type: 'J'
    },
    L: { 
      shape: [[0,0,1],[1,1,1]], 
      color: 0xff8000, 
      glowColor: 0xffaa66,
      type: 'L'
    }
  }

  constructor(app: Application) {
    this.app = app
    this.board = Array(this.BOARD_HEIGHT).fill(null).map(() => Array(this.BOARD_WIDTH).fill(0))
    
    this.setupContainers()
    this.setupUI()
    this.spawnNewPiece()
    this.startGameLoop()
    this.setupControls()
  }

  private setupContainers() {
    // Main game container
    this.gameContainer = new Container()
    this.app.stage.addChild(this.gameContainer)
    
    // Board container with glow effect
    this.boardContainer = new Container()
    this.boardContainer.x = 200
    this.boardContainer.y = 50
    this.gameContainer.addChild(this.boardContainer)
    
    // Particle container (above board)
    this.particleContainer = new Container()
    this.particleContainer.x = 200
    this.particleContainer.y = 50
    this.gameContainer.addChild(this.particleContainer)
    
    // UI container
    this.uiContainer = new Container()
    this.gameContainer.addChild(this.uiContainer)
    
    // Initialize particle system
    this.particleSystem = new ParticleSystem(this.particleContainer)
    
    this.drawBoard()
  }

  private drawBoard() {
    const boardBg = new Graphics()
    boardBg.beginFill(0x0a0a0a, 0.8)
    boardBg.drawRect(-5, -5, this.BOARD_WIDTH * this.BLOCK_SIZE + 10, this.BOARD_HEIGHT * this.BLOCK_SIZE + 10)
    boardBg.endFill()
    
    // Add neon border glow
    boardBg.lineStyle(2, 0x00ffff, 1)
    boardBg.drawRect(-5, -5, this.BOARD_WIDTH * this.BLOCK_SIZE + 10, this.BOARD_HEIGHT * this.BLOCK_SIZE + 10)
    
    this.boardContainer.addChild(boardBg)
  }

  private setupUI() {
    // Score display
    const scoreText = new Text('SCORE: 0', {
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: true,
      dropShadowColor: 0x00ffff,
      dropShadowBlur: 10
    })
    scoreText.x = 450
    scoreText.y = 100
    this.uiContainer.addChild(scoreText)
    
    // Level display
    const levelText = new Text('LEVEL: 1', {
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: true,
      dropShadowColor: 0x00ffff,
      dropShadowBlur: 10
    })
    levelText.x = 450
    levelText.y = 140
    this.uiContainer.addChild(levelText)
    
    // Lines display
    const linesText = new Text('LINES: 0', {
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: true,
      dropShadowColor: 0x00ffff,
      dropShadowBlur: 10
    })
    linesText.x = 450
    linesText.y = 180
    this.uiContainer.addChild(linesText)
  }

  private spawnNewPiece() {
    const pieces = Object.keys(this.tetrominoes)
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)]
    const pieceTemplate = this.tetrominoes[randomPiece as keyof typeof this.tetrominoes]
    
    this.currentPiece = {
      shape: pieceTemplate.shape,
      color: pieceTemplate.color,
      glowColor: pieceTemplate.glowColor,
      x: Math.floor(this.BOARD_WIDTH / 2) - 1,
      y: 0,
      type: pieceTemplate.type
    }
    
    // Check game over
    if (this.checkCollision(this.currentPiece, 0, 0)) {
      this.gameRunning = false
      this.showGameOver()
    }
  }

  private checkCollision(piece: Tetromino, dx: number, dy: number): boolean {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + dx
          const newY = piece.y + y + dy
          
          if (newX < 0 || newX >= this.BOARD_WIDTH || 
              newY >= this.BOARD_HEIGHT || 
              (newY >= 0 && this.board[newY][newX])) {
            return true
          }
        }
      }
    }
    return false
  }

  private placePiece() {
    if (!this.currentPiece) return
    
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const boardY = this.currentPiece.y + y
          const boardX = this.currentPiece.x + x
          if (boardY >= 0) {
            this.board[boardY][boardX] = this.currentPiece.color
          }
        }
      }
    }
    
    this.checkLines()
    this.spawnNewPiece()
  }

  private checkLines() {
    let linesCleared = 0
    const clearedLines: number[] = []
    
    for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== 0)) {
        clearedLines.push(y)
        // Create line explosion effect before clearing
        this.particleSystem.createLineExplosion(
          0, 
          y * this.BLOCK_SIZE, 
          this.BOARD_WIDTH * this.BLOCK_SIZE, 
          0xffffff
        )
        
        this.board.splice(y, 1)
        this.board.unshift(Array(this.BOARD_WIDTH).fill(0))
        linesCleared++
        y++ // Check same line again
      }
    }
    
    if (linesCleared > 0) {
      this.lines += linesCleared
      this.score += this.calculateScore(linesCleared)
      this.level = Math.floor(this.lines / 10) + 1
      this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50)
      this.updateUI()
    }
  }

  private calculateScore(lines: number): number {
    const baseScores = [0, 40, 100, 300, 1200]
    return baseScores[lines] * this.level
  }

  private updateUI() {
    const children = this.uiContainer.children
    ;(children[0] as Text).text = `SCORE: ${this.score}`
    ;(children[1] as Text).text = `LEVEL: ${this.level}`
    ;(children[2] as Text).text = `LINES: ${this.lines}`
  }

  private rotatePiece() {
    if (!this.currentPiece) return
    
    const rotated = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece!.shape.map(row => row[i]).reverse()
    )
    
    const oldShape = this.currentPiece.shape
    this.currentPiece.shape = rotated
    
    if (this.checkCollision(this.currentPiece, 0, 0)) {
      this.currentPiece.shape = oldShape
    }
  }

  private movePiece(dx: number, dy: number) {
    if (!this.currentPiece) return false
    
    if (!this.checkCollision(this.currentPiece, dx, dy)) {
      this.currentPiece.x += dx
      this.currentPiece.y += dy
      return true
    }
    return false
  }

  private hardDrop() {
    if (!this.currentPiece) return
    
    // Drop piece as far as possible
    while (this.movePiece(0, 1)) {
      // Keep dropping until collision
    }
    
    // Place the piece immediately
    this.placePiece()
  }

  private setupControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.gameRunning) return
      
      switch (e.code) {
        case 'ArrowLeft':
          this.movePiece(-1, 0)
          break
        case 'ArrowRight':
          this.movePiece(1, 0)
          break
        case 'ArrowDown':
          if (!this.movePiece(0, 1)) {
            this.placePiece()
          }
          break
        case 'ArrowUp':
          this.hardDrop()
          break
        case 'KeyZ':
        case 'KeyX':
        case 'Space':
          this.rotatePiece()
          break
      }
    })
  }

  private startGameLoop() {
    this.app.ticker.add(() => {
      if (!this.gameRunning) return
      
      this.dropTimer += this.app.ticker.deltaMS
      
      if (this.dropTimer >= this.dropInterval) {
        if (!this.movePiece(0, 1)) {
          this.placePiece()
        }
        this.dropTimer = 0
      }
      
      // Add subtle glow trail for current piece
      if (this.currentPiece && Math.random() < 0.3) {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
          for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
            if (this.currentPiece.shape[y][x]) {
              const drawX = (this.currentPiece.x + x) * this.BLOCK_SIZE
              const drawY = (this.currentPiece.y + y) * this.BLOCK_SIZE
              this.particleSystem.createGlowTrail(drawX, drawY, this.currentPiece.glowColor)
            }
          }
        }
      }
      
      // Update particle system
      this.particleSystem.update()
      
      this.render()
    })
  }

  private render() {
    // Clear previous render
    this.boardContainer.removeChildren()
    this.drawBoard()
    
    // Render placed blocks with glow
    for (let y = 0; y < this.BOARD_HEIGHT; y++) {
      for (let x = 0; x < this.BOARD_WIDTH; x++) {
        if (this.board[y][x]) {
          this.drawGlowBlock(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.board[y][x])
        }
      }
    }
    
    // Render current piece with glow
    if (this.currentPiece) {
      for (let y = 0; y < this.currentPiece.shape.length; y++) {
        for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
          if (this.currentPiece.shape[y][x]) {
            const drawX = (this.currentPiece.x + x) * this.BLOCK_SIZE
            const drawY = (this.currentPiece.y + y) * this.BLOCK_SIZE
            this.drawGlowBlock(drawX, drawY, this.currentPiece.color, this.currentPiece.glowColor)
          }
        }
      }
    }
    
    // Render particles
    this.particleSystem.render()
  }

  private drawGlowBlock(x: number, y: number, color: number, glowColor?: number) {
    const block = new Graphics()
    
    // Glow effect
    if (glowColor) {
      block.beginFill(glowColor, 0.3)
      block.drawRect(x - 2, y - 2, this.BLOCK_SIZE + 4, this.BLOCK_SIZE + 4)
      block.endFill()
    }
    
    // Main block with gradient effect
    block.beginFill(color)
    block.drawRect(x + 1, y + 1, this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2)
    block.endFill()
    
    // Highlight
    block.beginFill(0xffffff, 0.3)
    block.drawRect(x + 2, y + 2, this.BLOCK_SIZE - 6, 3)
    block.endFill()
    
    // Border
    block.lineStyle(1, 0xffffff, 0.5)
    block.drawRect(x + 1, y + 1, this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2)
    
    this.boardContainer.addChild(block)
  }

  private showGameOver() {
    const gameOverText = new Text('GAME OVER', {
      fontSize: 48,
      fill: 0xff0000,
      fontWeight: 'bold',
      dropShadow: true,
      dropShadowColor: 0xff6666,
      dropShadowBlur: 20
    })
    gameOverText.x = this.app.screen.width / 2 - gameOverText.width / 2
    gameOverText.y = this.app.screen.height / 2
    this.uiContainer.addChild(gameOverText)
    
    const restartText = new Text('Press R to Restart', {
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: 'bold'
    })
    restartText.x = this.app.screen.width / 2 - restartText.width / 2
    restartText.y = this.app.screen.height / 2 + 60
    this.uiContainer.addChild(restartText)
    
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyR') {
        this.restart()
      }
    })
  }

  private restart() {
    this.board = Array(this.BOARD_HEIGHT).fill(null).map(() => Array(this.BOARD_WIDTH).fill(0))
    this.score = 0
    this.level = 1
    this.lines = 0
    this.dropTimer = 0
    this.dropInterval = 1000
    this.gameRunning = true
    this.uiContainer.removeChildren()
    this.setupUI()
    this.spawnNewPiece()
  }

  public destroy() {
    this.app.stage.removeChild(this.gameContainer)
  }
}