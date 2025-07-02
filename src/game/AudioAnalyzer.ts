export class AudioAnalyzer {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private source: MediaElementAudioSourceNode | null = null
  private dataArray: Uint8Array | null = null
  private connected = false

  public connect(audioElement: HTMLAudioElement): boolean {
    try {
      // Don't connect twice
      if (this.connected) {
        console.log('Audio analyzer already connected')
        return true
      }
      
      console.log('Creating audio context...')
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }
      
      console.log('Creating analyser node...')
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256 // Good balance of frequency resolution and performance
      this.analyser.smoothingTimeConstant = 0.8 // Smooth out rapid changes
      
      console.log('Creating media source...')
      // Create source from audio element
      this.source = this.audioContext.createMediaElementSource(audioElement)
      
      console.log('Connecting audio nodes...')
      // Connect: source -> analyser -> destination
      this.source.connect(this.analyser)
      this.analyser.connect(this.audioContext.destination)
      
      // Create data array for frequency data
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
      
      this.connected = true
      console.log('Audio analyzer connected successfully')
      return true
    } catch (error) {
      console.warn('Audio analysis not available:', error)
      return false
    }
  }

  public getFrequencyData(): { bass: number; mid: number; treble: number; overall: number } | null {
    if (!this.analyser || !this.dataArray || !this.connected) {
      return null
    }

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray)
    
    // Calculate frequency ranges (0-255 scale)
    const bass = this.getAverageFrequency(0, 10) / 255 // Low frequencies (0-85Hz)
    const mid = this.getAverageFrequency(10, 40) / 255 // Mid frequencies (85-340Hz)  
    const treble = this.getAverageFrequency(40, 128) / 255 // High frequencies (340Hz+)
    const overall = this.getAverageFrequency(0, 128) / 255 // All frequencies

    return { bass, mid, treble, overall }
  }

  private getAverageFrequency(startIndex: number, endIndex: number): number {
    if (!this.dataArray) return 0
    
    let sum = 0
    let count = 0
    
    for (let i = startIndex; i < Math.min(endIndex, this.dataArray.length); i++) {
      sum += this.dataArray[i]
      count++
    }
    
    return count > 0 ? sum / count : 0
  }

  public resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
  }

  public disconnect() {
    if (this.source) {
      this.source.disconnect()
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
    this.connected = false
  }
}