import { Application, Graphics, Container, Text, Ticker } from 'pixi.js'
import { ParticleSystem } from './ParticleSystem'
import { AudioAnalyzer } from './AudioAnalyzer'
import { BackgroundEffects } from './BackgroundEffects'

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
  rotation: number // 0=spawn, 1=right, 2=180, 3=left
}

export class TetrisGame {
  private app: Application
  private gameContainer!: Container
  private boardContainer!: Container
  private uiContainer!: Container
  private particleContainer!: Container
  private backgroundEffectsContainer!: Container
  private particleSystem!: ParticleSystem
  private audioAnalyzer!: AudioAnalyzer
  private backgroundEffects!: BackgroundEffects
  private board: number[][]
  private currentPiece: Tetromino | null = null
  private ghostPiece: Tetromino | null = null
  private nextPieces: Tetromino[] = []
  private nextPieceContainer!: Container
  private score = 0
  private level = 1
  private lines = 0
  private dropTimer = 0
  private dropInterval = 1000 // milliseconds
  private gameRunning = true
  private backgroundMusic: HTMLAudioElement | null = null
  private musicWaitingForInteraction = false
  private gameFieldBackground!: Graphics
  private gameBorder!: Graphics
  
  // Responsive layout properties
  // Scaled up dimensions for better visuals  
  private readonly BOARD_WIDTH = 10
  private readonly BOARD_HEIGHT = 20
  private readonly BLOCK_SIZE = 32 // Fixed size
  
  // SRS Tetromino definitions with all 4 rotation states
  private tetrominoes = {
    I: {
      shapes: [
        // State 0 (spawn)
        [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
        // State 1 (right)
        [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
        // State 2 (180)
        [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
        // State 3 (left)
        [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]
      ],
      color: 0x00ffff,
      glowColor: 0x66ffff,
      type: 'I'
    },
    O: {
      shapes: [
        // All states are the same for O piece
        [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
        [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
        [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
        [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]
      ],
      color: 0xffff00,
      glowColor: 0xffff66,
      type: 'O'
    },
    T: {
      shapes: [
        [[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
        [[0,1,0,0],[0,1,1,0],[0,1,0,0],[0,0,0,0]],
        [[0,0,0,0],[1,1,1,0],[0,1,0,0],[0,0,0,0]],
        [[0,1,0,0],[1,1,0,0],[0,1,0,0],[0,0,0,0]]
      ],
      color: 0xff00ff,
      glowColor: 0xff66ff,
      type: 'T'
    },
    S: {
      shapes: [
        [[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]],
        [[0,1,0,0],[0,1,1,0],[0,0,1,0],[0,0,0,0]],
        [[0,0,0,0],[0,1,1,0],[1,1,0,0],[0,0,0,0]],
        [[1,0,0,0],[1,1,0,0],[0,1,0,0],[0,0,0,0]]
      ],
      color: 0x00ff00,
      glowColor: 0x66ff66,
      type: 'S'
    },
    Z: {
      shapes: [
        [[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
        [[0,0,1,0],[0,1,1,0],[0,1,0,0],[0,0,0,0]],
        [[0,0,0,0],[1,1,0,0],[0,1,1,0],[0,0,0,0]],
        [[0,1,0,0],[1,1,0,0],[1,0,0,0],[0,0,0,0]]
      ],
      color: 0xff0000,
      glowColor: 0xff6666,
      type: 'Z'
    },
    J: {
      shapes: [
        [[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
        [[0,1,1,0],[0,1,0,0],[0,1,0,0],[0,0,0,0]],
        [[0,0,0,0],[1,1,1,0],[0,0,1,0],[0,0,0,0]],
        [[0,1,0,0],[0,1,0,0],[1,1,0,0],[0,0,0,0]]
      ],
      color: 0x0000ff,
      glowColor: 0x6666ff,
      type: 'J'
    },
    L: {
      shapes: [
        [[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
        [[0,1,0,0],[0,1,0,0],[0,1,1,0],[0,0,0,0]],
        [[0,0,0,0],[1,1,1,0],[1,0,0,0],[0,0,0,0]],
        [[1,1,0,0],[0,1,0,0],[0,1,0,0],[0,0,0,0]]
      ],
      color: 0xff8000,
      glowColor: 0xffaa66,
      type: 'L'
    }
  }

  // SRS Wall Kick Data - Standard for JLSTZ pieces
  private kickTable = {
    // From rotation 0
    '0->1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
    '0->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
    // From rotation 1
    '1->0': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
    '1->2': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
    // From rotation 2
    '2->1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
    '2->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
    // From rotation 3
    '3->0': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
    '3->2': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]]
  }

  // SRS Wall Kick Data - Special for I piece
  private kickTableI = {
    // From rotation 0
    '0->1': [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],
    '0->3': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],
    // From rotation 1
    '1->0': [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
    '1->2': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],
    // From rotation 2
    '2->1': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
    '2->3': [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
    // From rotation 3
    '3->0': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
    '3->2': [[0,0], [-2,0], [1,0], [-2,-1], [1,2]]
  }

  constructor(app: Application) {
    try {
      console.log('TetrisGame constructor started')
      this.app = app
      this.board = Array(this.BOARD_HEIGHT).fill(null).map(() => Array(this.BOARD_WIDTH).fill(0))
      
      console.log('Setting up containers...')
      this.setupContainers()
      console.log('Setting up UI...')
      this.setupUI()
      console.log('Setting up music...')
      this.setupMusic()
      console.log('Filling next piece queue...')
      this.fillNextPieceQueue() // Initialize queue before spawning
      console.log('Spawning new piece...')
      this.spawnNewPiece()
      console.log('Current piece after spawning:', this.currentPiece)
      console.log('Game running state:', this.gameRunning)
      console.log('Board container position:', this.boardContainer.x, this.boardContainer.y)
      console.log('Board container children count:', this.boardContainer.children.length)
      console.log('Starting game loop...')
      this.startGameLoop()
      console.log('Setting up controls...')
      this.setupControls()
      console.log('Setting up touch controls...')
      this.setupTouchControls()
      console.log('TetrisGame constructor completed')
    } catch (error) {
      console.error('Error in TetrisGame constructor:', error)
      throw error
    }
  }

  private setupContainers() {
    // Main game container
    this.gameContainer = new Container()
    this.app.stage.addChild(this.gameContainer)
    
    // Check if mobile layout
    const isMobile = this.app.screen.width <= 768
    
    // Board container - responsive positioning
    this.boardContainer = new Container()
    if (isMobile) {
      this.boardContainer.x = (this.app.screen.width - (this.BOARD_WIDTH * this.BLOCK_SIZE)) / 2
      this.boardContainer.y = 80
    } else {
      this.boardContainer.x = (this.app.screen.width - (this.BOARD_WIDTH * this.BLOCK_SIZE)) / 2
      this.boardContainer.y = 120
    }
    this.gameContainer.addChild(this.boardContainer)
    
    // Add title (after board container is created)
    this.setupTitle()
    
    // Background effects container (behind board)
    this.backgroundEffectsContainer = new Container()
    this.gameContainer.addChild(this.backgroundEffectsContainer)
    
    // Setup game field background for audio reactivity
    this.gameFieldBackground = new Graphics()
    this.backgroundEffectsContainer.addChild(this.gameFieldBackground)
    
    // Setup game border for audio reactivity
    this.gameBorder = new Graphics()
    this.backgroundEffectsContainer.addChild(this.gameBorder)
    
    // Particle container (above board)
    this.particleContainer = new Container()
    this.particleContainer.x = this.boardContainer.x
    this.particleContainer.y = this.boardContainer.y
    this.gameContainer.addChild(this.particleContainer)
    
    // UI container
    this.uiContainer = new Container()
    this.gameContainer.addChild(this.uiContainer)
    
    // Next piece container (left side, aligned with game board)
    this.nextPieceContainer = new Container()
    if (isMobile) {
      // Position next pieces on the right side for mobile
      this.nextPieceContainer.x = this.boardContainer.x + (this.BOARD_WIDTH * this.BLOCK_SIZE) + 10
      this.nextPieceContainer.y = this.boardContainer.y
    } else {
      // Position one grid space left of the game board, aligned with top
      this.nextPieceContainer.x = this.boardContainer.x - (4 * this.BLOCK_SIZE + this.BLOCK_SIZE) // 4 blocks wide + 1 block gap
      this.nextPieceContainer.y = this.boardContainer.y
    }
    this.gameContainer.addChild(this.nextPieceContainer)
    
    // Initialize particle system
    this.particleSystem = new ParticleSystem(this.particleContainer)
    
    // Initialize audio analyzer
    this.audioAnalyzer = new AudioAnalyzer()
    
    // Initialize background effects
    this.backgroundEffects = new BackgroundEffects(this.backgroundEffectsContainer, this.app.screen.width, this.app.screen.height)
    
    this.drawBoard()
  }

  private setupTitle() {
    const isMobile = this.app.screen.width <= 768
    
    // Main game title
    const titleText = new Text('BlockFall', {
      fontSize: isMobile ? 32 : 48,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: true,
      dropShadowColor: 0x00ffff,
      dropShadowBlur: 20,
      dropShadowDistance: 3
    })
    titleText.x = this.app.screen.width / 2 - titleText.width / 2
    titleText.y = isMobile ? 20 : 30
    this.gameContainer.addChild(titleText)
    
    // Credit line under the game area
    const creditText = new Text('By AustinCreative.UK', {
      fontSize: isMobile ? 12 : 16,
      fill: 0xcccccc,
      fontWeight: 'normal',
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowBlur: 3,
      dropShadowDistance: 1
    })
    creditText.x = this.app.screen.width / 2 - creditText.width / 2
    creditText.y = this.boardContainer.y + (this.BOARD_HEIGHT * this.BLOCK_SIZE) + (isMobile ? 10 : 20)
    this.gameContainer.addChild(creditText)
  }

  private drawBoard() {
    const boardBg = new Graphics()
    
    // Multiple layered background for depth
    // Outer glow effect
    for (let i = 20; i >= 1; i--) {
      boardBg.beginFill(0x001133, 0.02)
      boardBg.drawRect(-5 - i, -5 - i, this.BOARD_WIDTH * this.BLOCK_SIZE + 10 + i*2, this.BOARD_HEIGHT * this.BLOCK_SIZE + 10 + i*2)
      boardBg.endFill()
    }
    
    // Main background with gradient effect
    boardBg.beginFill(0x0f0f1f, 0.9)
    boardBg.drawRect(-5, -5, this.BOARD_WIDTH * this.BLOCK_SIZE + 10, this.BOARD_HEIGHT * this.BLOCK_SIZE + 10)
    boardBg.endFill()
    
    // Inner shadow
    boardBg.beginFill(0x000000, 0.3)
    boardBg.drawRect(0, 0, this.BOARD_WIDTH * this.BLOCK_SIZE, this.BOARD_HEIGHT * this.BLOCK_SIZE)
    boardBg.endFill()
    
    // Grid lines with subtle glow
    boardBg.lineStyle(1, 0x1a1a3a, 0.3)
    for (let x = 0; x <= this.BOARD_WIDTH; x++) {
      boardBg.moveTo(x * this.BLOCK_SIZE, 0)
      boardBg.lineTo(x * this.BLOCK_SIZE, this.BOARD_HEIGHT * this.BLOCK_SIZE)
    }
    for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
      boardBg.moveTo(0, y * this.BLOCK_SIZE)
      boardBg.lineTo(this.BOARD_WIDTH * this.BLOCK_SIZE, y * this.BLOCK_SIZE)
    }
    
    // Animated neon border
    const time = Date.now() * 0.002
    const glowIntensity = 0.8 + Math.sin(time) * 0.3
    
    // Multiple border layers for amazing glow
    boardBg.lineStyle(8, 0x00ffff, 0.1)
    boardBg.drawRect(-8, -8, this.BOARD_WIDTH * this.BLOCK_SIZE + 16, this.BOARD_HEIGHT * this.BLOCK_SIZE + 16)
    
    boardBg.lineStyle(4, 0x00ffff, 0.3)
    boardBg.drawRect(-6, -6, this.BOARD_WIDTH * this.BLOCK_SIZE + 12, this.BOARD_HEIGHT * this.BLOCK_SIZE + 12)
    
    boardBg.lineStyle(2, 0x00ffff, glowIntensity)
    boardBg.drawRect(-4, -4, this.BOARD_WIDTH * this.BLOCK_SIZE + 8, this.BOARD_HEIGHT * this.BLOCK_SIZE + 8)
    
    boardBg.lineStyle(1, 0xffffff, 1)
    boardBg.drawRect(-2, -2, this.BOARD_WIDTH * this.BLOCK_SIZE + 4, this.BOARD_HEIGHT * this.BLOCK_SIZE + 4)
    
    this.boardContainer.addChild(boardBg)
  }

  private setupUI() {
    const isMobile = this.app.screen.width <= 768
    const rightPanelX = isMobile ? 10 : this.boardContainer.x + (this.BOARD_WIDTH * this.BLOCK_SIZE) + 50
    const startY = isMobile ? this.boardContainer.y + (this.BOARD_HEIGHT * this.BLOCK_SIZE) + 60 : 150
    
    // Score display
    const scoreText = new Text('SCORE: 0', {
      fontSize: isMobile ? 20 : 28,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: true,
      dropShadowColor: 0x00ffff,
      dropShadowBlur: 10
    })
    scoreText.x = rightPanelX
    scoreText.y = startY
    this.uiContainer.addChild(scoreText)
    
    // Level display
    const levelText = new Text('LEVEL: 1', {
      fontSize: isMobile ? 20 : 28,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: true,
      dropShadowColor: 0x00ffff,
      dropShadowBlur: 10
    })
    levelText.x = isMobile ? rightPanelX + 120 : rightPanelX
    levelText.y = isMobile ? startY : startY + 50
    this.uiContainer.addChild(levelText)
    
    // Lines display
    const linesText = new Text('LINES: 0', {
      fontSize: isMobile ? 20 : 28,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: true,
      dropShadowColor: 0x00ffff,
      dropShadowBlur: 10
    })
    linesText.x = isMobile ? rightPanelX + 240 : rightPanelX
    linesText.y = isMobile ? startY : startY + 100
    this.uiContainer.addChild(linesText)

    // Music control hint
    const musicText = new Text('M: Toggle Music', {
      fontSize: isMobile ? 14 : 18,
      fill: 0xcccccc,
      fontWeight: 'bold'
    })
    musicText.x = rightPanelX
    musicText.y = isMobile ? startY + 40 : startY + 150
    this.uiContainer.addChild(musicText)
    
    // Controls info - different for mobile
    const controlsText = new Text(isMobile ? 'Tap controls below' : 'CONTROLS:\nArrows: Move\nZ/Space: Rotate CCW\nX: Rotate CW\nUp: Hard Drop', {
      fontSize: isMobile ? 14 : 16,
      fill: 0x888888,
      fontWeight: 'bold',
      lineHeight: 20
    })
    controlsText.x = rightPanelX
    controlsText.y = isMobile ? startY + 65 : startY + 200
    this.uiContainer.addChild(controlsText)
  }

  private setupMusic() {
    try {
      // Randomly select between available music tracks
      const musicTracks = [
        '/sounds/tetris-music.mp3',
        '/sounds/tetris-music2.mp3'
      ]
      const randomTrack = musicTracks[Math.floor(Math.random() * musicTracks.length)]
      
      console.log('Selected music track:', randomTrack)
      this.backgroundMusic = new Audio(randomTrack)
      this.backgroundMusic.loop = true
      this.backgroundMusic.volume = 0.6
      
      console.log('Music file loaded, attempting to play...')
      
      // Set up event listeners for audio analyzer connection
      this.backgroundMusic.addEventListener('play', () => {
        console.log('Music started playing, connecting audio analyzer...')
        // Connect audio analyzer when music starts playing
        setTimeout(() => {
          if (this.audioAnalyzer.connect(this.backgroundMusic!)) {
            console.log('Audio analyzer connected successfully')
          } else {
            console.log('Audio analyzer connection failed')
          }
        }, 100) // Small delay to ensure audio is fully playing
      })
      
      this.backgroundMusic.addEventListener('error', (e) => {
        console.error('Music loading error:', e)
      })
      
      // Try to start music immediately
      this.backgroundMusic.play().then(() => {
        console.log('Music autoplay successful')
      }).catch(() => {
        console.log('Music autoplay blocked, waiting for user interaction')
        // If autoplay fails, start music on ANY user interaction
        this.musicWaitingForInteraction = true
        this.setupAutoplayWorkaround()
        this.updateMusicUI()
      })
    } catch (error) {
      console.log('Could not load background music:', error)
    }
  }

  private setupAutoplayWorkaround() {
    const startMusic = () => {
      if (this.backgroundMusic && this.backgroundMusic.paused) {
        this.backgroundMusic.play().catch(console.error)
        this.musicWaitingForInteraction = false
        this.updateMusicUI()
        // Remove listeners after music starts
        document.removeEventListener('keydown', startMusic)
        document.removeEventListener('click', startMusic)
        document.removeEventListener('touchstart', startMusic)
      }
    }

    // Start music on any user interaction
    document.addEventListener('keydown', startMusic)
    document.addEventListener('click', startMusic) 
    document.addEventListener('touchstart', startMusic)
  }

  private updateMusicUI() {
    // Update the music control text based on state
    const musicText = this.uiContainer.children[3] as Text
    if (this.musicWaitingForInteraction) {
      musicText.text = '🎵 Press any key for music'
      musicText.style.fill = 0xffff00 // Yellow to grab attention
    } else {
      musicText.text = 'M: Toggle Music'
      musicText.style.fill = 0xcccccc
    }
  }

  private toggleMusic() {
    if (!this.backgroundMusic) return
    
    if (this.backgroundMusic.paused) {
      this.backgroundMusic.play().catch(console.error)
    } else {
      this.backgroundMusic.pause()
    }
  }

  private spawnNewPiece() {
    // Initialize queue if empty
    if (!this.nextPieces || this.nextPieces.length === 0) {
      this.fillNextPieceQueue()
    }
    
    // Get next piece from queue
    const nextPiece = this.nextPieces.shift()
    if (!nextPiece) {
      // Fallback to direct generation if queue is somehow empty
      const pieces = Object.keys(this.tetrominoes)
      const randomPiece = pieces[Math.floor(Math.random() * pieces.length)]
      const pieceTemplate = this.tetrominoes[randomPiece as keyof typeof this.tetrominoes]
      
      this.currentPiece = {
        shape: pieceTemplate.shapes[0],
        color: pieceTemplate.color,
        glowColor: pieceTemplate.glowColor,
        x: Math.floor(this.BOARD_WIDTH / 2) - 2,
        y: 0,
        type: pieceTemplate.type,
        rotation: 0
      }
      
      this.fillNextPieceQueue()
      this.updateGhostPiece()
      
      if (this.checkCollision(this.currentPiece, 0, 0)) {
        this.gameRunning = false
        this.showGameOver()
      }
      return
    }
    
    this.currentPiece = {
      shape: nextPiece.shape,
      color: nextPiece.color,
      glowColor: nextPiece.glowColor,
      x: Math.floor(this.BOARD_WIDTH / 2) - 2, // Center in 4x4 grid
      y: 0,
      type: nextPiece.type,
      rotation: 0
    }
    
    // Add new piece to queue
    this.addRandomPieceToQueue()
    
    // Update ghost piece
    this.updateGhostPiece()
    
    // Check game over
    if (this.checkCollision(this.currentPiece, 0, 0)) {
      this.gameRunning = false
      this.showGameOver()
    }
  }
  
  private fillNextPieceQueue() {
    try {
      console.log('Filling next piece queue...')
      // Initialize the array if it doesn't exist
      if (!this.nextPieces) {
        this.nextPieces = []
      }
      
      // Fill queue with 3 pieces initially
      for (let i = 0; i < 3; i++) {
        this.addRandomPieceToQueue()
      }
      console.log('Next piece queue filled with', this.nextPieces.length, 'pieces')
    } catch (error) {
      console.error('Error filling next piece queue:', error)
      throw error
    }
  }
  
  private addRandomPieceToQueue() {
    const pieces = Object.keys(this.tetrominoes)
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)]
    const pieceTemplate = this.tetrominoes[randomPiece as keyof typeof this.tetrominoes]
    
    const newPiece: Tetromino = {
      shape: pieceTemplate.shapes[0], // Always spawn in state 0
      color: pieceTemplate.color,
      glowColor: pieceTemplate.glowColor,
      x: 0, // Position will be set when rendering preview
      y: 0,
      type: pieceTemplate.type,
      rotation: 0
    }
    
    this.nextPieces.push(newPiece)
  }

  private updateGhostPiece() {
    if (!this.currentPiece) {
      this.ghostPiece = null
      return
    }
    
    // Create ghost piece as copy of current piece
    this.ghostPiece = {
      ...this.currentPiece,
      x: this.currentPiece.x,
      y: this.currentPiece.y
    }
    
    // Drop ghost piece to the bottom
    while (!this.checkCollision(this.ghostPiece, 0, 1)) {
      this.ghostPiece.y++
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
        
        // Create line explosion effect
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

  private rotatePiece(clockwise: boolean = true) {
    if (!this.currentPiece) return
    
    const oldRotation = this.currentPiece.rotation
    const newRotation = clockwise 
      ? (oldRotation + 1) % 4 
      : (oldRotation + 3) % 4
    
    this.attemptRotation(oldRotation, newRotation)
  }

  private attemptRotation(fromRotation: number, toRotation: number) {
    if (!this.currentPiece) return
    
    const pieceTemplate = this.tetrominoes[this.currentPiece.type as keyof typeof this.tetrominoes]
    const newShape = pieceTemplate.shapes[toRotation]
    
    // Get appropriate kick table
    const kickTable = this.currentPiece.type === 'I' ? this.kickTableI : this.kickTable
    const kickKey = `${fromRotation}->${toRotation}`
    const kicks = kickTable[kickKey as keyof typeof kickTable] || [[0,0]]
    
    // Try each kick offset
    for (const [kickX, kickY] of kicks) {
      const testPiece: Tetromino = {
        ...this.currentPiece,
        shape: newShape,
        x: this.currentPiece.x + kickX,
        y: this.currentPiece.y + kickY,
        rotation: toRotation
      }
      
      if (!this.checkCollision(testPiece, 0, 0)) {
        // Success! Apply the rotation and kick
        this.currentPiece.shape = newShape
        this.currentPiece.x = testPiece.x
        this.currentPiece.y = testPiece.y
        this.currentPiece.rotation = toRotation
        this.updateGhostPiece() // Update ghost when piece rotates
        return
      }
    }
    
    // If we get here, rotation failed - no valid kick found
  }

  private movePiece(dx: number, dy: number) {
    if (!this.currentPiece) return false
    
    if (!this.checkCollision(this.currentPiece, dx, dy)) {
      this.currentPiece.x += dx
      this.currentPiece.y += dy
      this.updateGhostPiece() // Update ghost when piece moves
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
      // Music toggle works even when game is not running
      if (e.code === 'KeyM') {
        this.toggleMusic()
        return
      }
      
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
        case 'Space':
          this.rotatePiece(false) // Counterclockwise
          break
        case 'KeyX':
          this.rotatePiece(true) // Clockwise
          break
      }
    })
  }

  private setupTouchControls() {
    const isMobile = this.app.screen.width <= 768
    if (!isMobile) return

    // Create touch control buttons
    const buttonContainer = new Container()
    const buttonY = this.app.screen.height - 100
    const buttonSize = 60

    // Left button
    const leftButton = this.createTouchButton('←', 50, buttonY, buttonSize, 0x4444ff)
    leftButton.interactive = true
    leftButton.on('pointerdown', () => this.movePiece(-1, 0))
    buttonContainer.addChild(leftButton)

    // Right button
    const rightButton = this.createTouchButton('→', 150, buttonY, buttonSize, 0x4444ff)
    rightButton.interactive = true
    rightButton.on('pointerdown', () => this.movePiece(1, 0))
    buttonContainer.addChild(rightButton)

    // Down button
    const downButton = this.createTouchButton('↓', 250, buttonY, buttonSize, 0x44ff44)
    downButton.interactive = true
    downButton.on('pointerdown', () => {
      if (!this.movePiece(0, 1)) {
        this.placePiece()
      }
    })
    buttonContainer.addChild(downButton)

    // Rotate button
    const rotateButton = this.createTouchButton('↻', this.app.screen.width - 150, buttonY, buttonSize, 0xff4444)
    rotateButton.interactive = true
    rotateButton.on('pointerdown', () => this.rotatePiece(false))
    buttonContainer.addChild(rotateButton)

    // Hard drop button
    const hardDropButton = this.createTouchButton('↕', this.app.screen.width - 50, buttonY, buttonSize, 0xff44ff)
    hardDropButton.interactive = true
    hardDropButton.on('pointerdown', () => this.hardDrop())
    buttonContainer.addChild(hardDropButton)

    this.gameContainer.addChild(buttonContainer)
  }

  private createTouchButton(text: string, x: number, y: number, size: number, color: number): Container {
    const button = new Container()
    button.x = x - size / 2
    button.y = y - size / 2

    // Button background
    const bg = new Graphics()
    bg.beginFill(color, 0.7)
    bg.drawRoundedRect(0, 0, size, size, 8)
    bg.endFill()
    
    // Button border
    bg.lineStyle(2, 0xffffff, 0.8)
    bg.drawRoundedRect(2, 2, size - 4, size - 4, 6)
    
    button.addChild(bg)

    // Button text
    const buttonText = new Text(text, {
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: 'bold'
    })
    buttonText.x = (size - buttonText.width) / 2
    buttonText.y = (size - buttonText.height) / 2
    button.addChild(buttonText)

    return button
  }

  private startGameLoop() {
    console.log('Starting game loop...')
    let frameCount = 0
    this.app.ticker.add(() => {
      frameCount++
      if (frameCount === 1) {
        console.log('First game loop frame running')
      }
      
      if (!this.gameRunning) {
        if (frameCount < 10) console.log('Game not running, skipping frame')
        return
      }
      
      this.dropTimer += this.app.ticker.deltaMS
      
      if (this.dropTimer >= this.dropInterval) {
        if (!this.movePiece(0, 1)) {
          this.placePiece()
        }
        this.dropTimer = 0
      }
      
      // Very subtle glow trail for current piece (much less frequent)
      if (this.currentPiece && Math.random() < 0.05) {
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
      
      // Get frequency data for audio-reactive effects
      const frequencyData = this.audioAnalyzer.getFrequencyData()
      
      // Update background effects
      this.backgroundEffects.update(frequencyData)
      
      // Update audio-reactive field and border effects
      this.updateAudioReactiveEffects(frequencyData)
      
      if (frameCount < 5) {
        console.log('About to render frame', frameCount)
      }
      this.render()
    })
  }

  private render() {
    try {
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
      
      // Render ghost piece first (behind current piece)
      if (this.ghostPiece && this.currentPiece && this.ghostPiece.y !== this.currentPiece.y) {
        for (let y = 0; y < this.ghostPiece.shape.length; y++) {
          for (let x = 0; x < this.ghostPiece.shape[y].length; x++) {
            if (this.ghostPiece.shape[y][x]) {
              const drawX = (this.ghostPiece.x + x) * this.BLOCK_SIZE
              const drawY = (this.ghostPiece.y + y) * this.BLOCK_SIZE
              this.drawGhostBlock(drawX, drawY, this.ghostPiece.color)
            }
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
      
      // Render background effects
      this.backgroundEffects.render()
      
      // Render next piece queue
      this.renderNextPieceQueue()
      
      // Render particles
      this.particleSystem.render()
    } catch (error) {
      console.error('Error in render function:', error)
    }
  }

  private drawGlowBlock(x: number, y: number, color: number, glowColor?: number) {
    const blockContainer = new Container()
    
    // Outer glow layers for amazing effect
    if (glowColor) {
      for (let i = 8; i >= 1; i--) {
        const glow = new Graphics()
        const alpha = 0.15 - (i * 0.015)
        glow.beginFill(glowColor, alpha)
        glow.drawRect(x - i*2, y - i*2, this.BLOCK_SIZE + i*4, this.BLOCK_SIZE + i*4)
        glow.endFill()
        blockContainer.addChild(glow)
      }
    }
    
    // Deep shadow for 3D depth
    const shadow = new Graphics()
    shadow.beginFill(0x000000, 0.6)
    shadow.drawRect(x + 3, y + 3, this.BLOCK_SIZE, this.BLOCK_SIZE)
    shadow.endFill()
    blockContainer.addChild(shadow)
    
    // Glass base layer with transparency
    const glassBase = new Graphics()
    glassBase.beginFill(color, 0.85)
    glassBase.drawRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE)
    glassBase.endFill()
    blockContainer.addChild(glassBase)
    
    // Glass reflection layers
    const topReflection = new Graphics()
    topReflection.beginFill(0xffffff, 0.6)
    topReflection.drawRect(x + 2, y + 1, this.BLOCK_SIZE - 4, 8)
    topReflection.endFill()
    blockContainer.addChild(topReflection)
    
    const leftReflection = new Graphics()
    leftReflection.beginFill(0xffffff, 0.3)
    leftReflection.drawRect(x + 1, y + 2, 6, this.BLOCK_SIZE - 4)
    leftReflection.endFill()
    blockContainer.addChild(leftReflection)
    
    // Specular highlight (glass shine)
    const specular = new Graphics()
    specular.beginFill(0xffffff, 0.8)
    specular.drawRect(x + 3, y + 3, this.BLOCK_SIZE - 12, 3)
    specular.endFill()
    blockContainer.addChild(specular)
    
    // Glass depth shadows
    const bottomShadow = new Graphics()
    bottomShadow.beginFill(0x000000, 0.4)
    bottomShadow.drawRect(x + 2, y + this.BLOCK_SIZE - 6, this.BLOCK_SIZE - 4, 4)
    bottomShadow.endFill()
    blockContainer.addChild(bottomShadow)
    
    const rightShadow = new Graphics()
    rightShadow.beginFill(0x000000, 0.4)
    rightShadow.drawRect(x + this.BLOCK_SIZE - 6, y + 2, 4, this.BLOCK_SIZE - 4)
    rightShadow.endFill()
    blockContainer.addChild(rightShadow)
    
    // Crystal-like border with refraction effect
    const border = new Graphics()
    border.lineStyle(3, 0xffffff, 0.8)
    border.drawRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE)
    border.lineStyle(1, glowColor || color, 1.0)
    border.drawRect(x + 1, y + 1, this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2)
    border.lineStyle(1, 0xffffff, 0.5)
    border.drawRect(x + 2, y + 2, this.BLOCK_SIZE - 4, this.BLOCK_SIZE - 4)
    blockContainer.addChild(border)
    
    // Animated sparkles for glass effect
    if (Math.random() < 0.15) {
      const sparkle = new Graphics()
      sparkle.beginFill(0xffffff, 0.9)
      const sparkleX = x + 4 + Math.random() * (this.BLOCK_SIZE - 8)
      const sparkleY = y + 4 + Math.random() * (this.BLOCK_SIZE - 8)
      sparkle.drawCircle(sparkleX, sparkleY, 1.5)
      sparkle.endFill()
      blockContainer.addChild(sparkle)
    }
    
    this.boardContainer.addChild(blockContainer)
  }

  private drawGhostBlock(x: number, y: number, color: number) {
    const ghostContainer = new Container()
    
    // Subtle ghost outline
    const ghostOutline = new Graphics()
    ghostOutline.lineStyle(2, color, 0.4)
    ghostOutline.drawRect(x + 2, y + 2, this.BLOCK_SIZE - 4, this.BLOCK_SIZE - 4)
    ghostContainer.addChild(ghostOutline)
    
    // Semi-transparent fill
    const ghostFill = new Graphics()
    ghostFill.beginFill(color, 0.15)
    ghostFill.drawRect(x + 3, y + 3, this.BLOCK_SIZE - 6, this.BLOCK_SIZE - 6)
    ghostFill.endFill()
    ghostContainer.addChild(ghostFill)
    
    // Dotted pattern for ghost effect
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if ((i + j) % 2 === 0) {
          const dot = new Graphics()
          dot.beginFill(color, 0.3)
          dot.drawCircle(x + 6 + i * 6, y + 6 + j * 6, 1)
          dot.endFill()
          ghostContainer.addChild(dot)
        }
      }
    }
    
    this.boardContainer.addChild(ghostContainer)
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

  private updateAudioReactiveEffects(frequencyData: { bass: number; mid: number; treble: number; overall: number } | null) {
    if (!frequencyData) return
    
    // Update game field background pulsing with overall music intensity
    this.updateGameFieldBackground(frequencyData.overall)
    
    // Update border effects with different frequency bands
    this.updateGameBorder(frequencyData.bass, frequencyData.mid, frequencyData.treble)
  }
  
  private updateGameFieldBackground(intensity: number) {
    this.gameFieldBackground.clear()
    
    // Create pulsing background behind the game field
    const pulse = 0.3 + intensity * 0.7 // Range: 0.3 to 1.0
    const alpha = 0.05 + intensity * 0.15 // Very subtle, range: 0.05 to 0.2
    
    // Gradient background that pulses with music
    const bgWidth = this.BOARD_WIDTH * this.BLOCK_SIZE + 40
    const centerX = this.boardContainer.x + (this.BOARD_WIDTH * this.BLOCK_SIZE) / 2
    const centerY = this.boardContainer.y + (this.BOARD_HEIGHT * this.BLOCK_SIZE) / 2
    
    // Create radial gradient effect
    for (let i = 8; i >= 1; i--) {
      const size = (bgWidth / 2) * pulse * (i / 8)
      const layerAlpha = alpha * (0.8 - i * 0.1)
      
      this.gameFieldBackground.beginFill(0x001133, layerAlpha)
      this.gameFieldBackground.drawCircle(centerX, centerY, size)
      this.gameFieldBackground.endFill()
    }
  }
  
  private updateGameBorder(bass: number, mid: number, treble: number) {
    this.gameBorder.clear()
    
    const boardX = this.boardContainer.x
    const boardY = this.boardContainer.y
    const boardWidth = this.BOARD_WIDTH * this.BLOCK_SIZE
    const boardHeight = this.BOARD_HEIGHT * this.BLOCK_SIZE
    
    // Bass - thick outer glow (red-orange)
    if (bass > 0.1) {
      const bassIntensity = bass * 0.8
      const bassColor = 0xff4400
      this.gameBorder.lineStyle(12 * bassIntensity, bassColor, 0.3 * bassIntensity)
      this.gameBorder.drawRect(boardX - 15, boardY - 15, boardWidth + 30, boardHeight + 30)
    }
    
    // Mid - medium border (cyan-blue)
    if (mid > 0.1) {
      const midIntensity = mid * 0.9
      const midColor = 0x00aaff
      this.gameBorder.lineStyle(8 * midIntensity, midColor, 0.5 * midIntensity)
      this.gameBorder.drawRect(boardX - 10, boardY - 10, boardWidth + 20, boardHeight + 20)
    }
    
    // Treble - thin inner sparkle (white-yellow)
    if (treble > 0.1) {
      const trebleIntensity = treble * 1.0
      const trebleColor = 0xffffaa
      this.gameBorder.lineStyle(4 * trebleIntensity, trebleColor, 0.7 * trebleIntensity)
      this.gameBorder.drawRect(boardX - 5, boardY - 5, boardWidth + 10, boardHeight + 10)
      
      // Add sparkle effects on high treble
      if (treble > 0.6) {
        for (let i = 0; i < 4; i++) {
          const sparkleX = boardX + Math.random() * boardWidth
          const sparkleY = boardY + Math.random() * boardHeight
          this.gameBorder.beginFill(0xffffff, trebleIntensity * 0.8)
          this.gameBorder.drawCircle(sparkleX, sparkleY, 2 + Math.random() * 3)
          this.gameBorder.endFill()
        }
      }
    }
  }
  
  private renderNextPieceQueue() {
    // Clear previous renders
    this.nextPieceContainer.removeChildren()
    
    // Safety check for nextPieces array
    if (!this.nextPieces || this.nextPieces.length === 0) {
      return
    }
    
    // Get frequency data for music reactivity
    const frequencyData = this.audioAnalyzer.getFrequencyData()
    
    // No title text needed
    
    // Box dimensions to match game grid (4x4 blocks)
    const boxWidth = 4 * this.BLOCK_SIZE
    const boxHeight = 4 * this.BLOCK_SIZE
    const boxGap = this.BLOCK_SIZE // 1 grid space gap
    
    // Render each next piece in a box
    this.nextPieces.forEach((piece, index) => {
      const boxY = index * (boxHeight + boxGap)
      
      // Calculate music reactivity for each box (border effects only)
      let bassIntensity = 0.0
      let midIntensity = 0.0
      let trebleIntensity = 0.0
      let glowIntensity = 0.5
      
      if (frequencyData) {
        bassIntensity = frequencyData.bass
        midIntensity = frequencyData.mid
        trebleIntensity = frequencyData.treble
        glowIntensity = 0.5 + frequencyData.overall * 0.5
      }
      
      // Create container for this preview box (no scaling)
      const boxContainer = new Container()
      boxContainer.x = 0
      boxContainer.y = boxY
      
      // Draw reactive box background with music-reactive borders
      const boxBg = new Graphics()
      
      // Bass - thick outer glow (red-orange) similar to main game
      if (bassIntensity > 0.1) {
        boxBg.lineStyle(8 * bassIntensity, 0xff4400, 0.3 * bassIntensity)
        boxBg.drawRoundedRect(-10, -10, boxWidth + 20, boxHeight + 20, 8)
      }
      
      // Mid - medium border (cyan-blue)
      if (midIntensity > 0.1) {
        boxBg.lineStyle(6 * midIntensity, 0x00aaff, 0.5 * midIntensity)
        boxBg.drawRoundedRect(-6, -6, boxWidth + 12, boxHeight + 12, 6)
      }
      
      // Treble - thin inner sparkle (white-yellow)
      if (trebleIntensity > 0.1) {
        boxBg.lineStyle(3 * trebleIntensity, 0xffffaa, 0.7 * trebleIntensity)
        boxBg.drawRoundedRect(-3, -3, boxWidth + 6, boxHeight + 6, 4)
      }
      
      // Box fill with glass effect
      boxBg.beginFill(0x111122, 0.4)
      boxBg.drawRoundedRect(0, 0, boxWidth, boxHeight, 5)
      boxBg.endFill()
      
      // Bright inner border
      boxBg.lineStyle(1, 0xffffff, glowIntensity)
      boxBg.drawRoundedRect(2, 2, boxWidth - 4, boxHeight - 4, 4)
      
      boxContainer.addChild(boxBg)
      
      // Calculate piece position within box (centered, smaller blocks)
      const pieceSize = this.BLOCK_SIZE * 0.7 // Smaller than game blocks
      const offsetX = (boxWidth - piece.shape[0].length * pieceSize) / 2
      const offsetY = (boxHeight - piece.shape.length * pieceSize) / 2
      
      // Render the piece blocks
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const blockX = offsetX + x * pieceSize
            const blockY = offsetY + y * pieceSize
            this.drawPreviewBlock(boxContainer, blockX, blockY, pieceSize, piece.color, piece.glowColor, glowIntensity)
          }
        }
      }
      
      this.nextPieceContainer.addChild(boxContainer)
    })
  }
  
  private drawPreviewBlock(container: Container, x: number, y: number, size: number, color: number, glowColor: number, intensity: number) {
    const block = new Graphics()
    
    // Outer glow (music reactive)
    for (let i = 3; i >= 1; i--) {
      block.beginFill(glowColor, intensity * 0.2 / i)
      block.drawRect(x - i, y - i, size + i * 2, size + i * 2)
      block.endFill()
    }
    
    // Main block with glass effect
    block.beginFill(color, 0.9)
    block.drawRect(x, y, size, size)
    block.endFill()
    
    // Glass reflection
    block.beginFill(0xffffff, 0.4 * intensity)
    block.drawRect(x + 2, y + 1, size - 4, 6)
    block.endFill()
    
    block.beginFill(0xffffff, 0.2 * intensity)
    block.drawRect(x + 1, y + 2, 4, size - 4)
    block.endFill()
    
    // Bright specular highlight
    block.beginFill(0xffffff, 0.8 * intensity)
    block.drawRect(x + 2, y + 2, size - 8, 2)
    block.endFill()
    
    container.addChild(block)
  }

  public destroy() {
    // Stop background music
    if (this.backgroundMusic) {
      this.backgroundMusic.pause()
      this.backgroundMusic = null
    }
    
    // Disconnect audio analyzer
    if (this.audioAnalyzer) {
      this.audioAnalyzer.disconnect()
    }
    
    // Clear background effects
    if (this.backgroundEffects) {
      this.backgroundEffects.clear()
    }
    
    this.app.stage.removeChild(this.gameContainer)
  }
}