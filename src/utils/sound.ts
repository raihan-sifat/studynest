let audioContext: AudioContext | null = null

function createContext(): void {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (Ctor) {
      audioContext = new Ctor()
    }
  } catch {
    audioContext = null
  }
}

export function initAudio(): void {
  if (!audioContext) {
    createContext()
  }
  if (audioContext && audioContext.state === 'suspended') {
    void audioContext.resume()
  }
}

export function playChime(): void {
  initAudio()
  if (!audioContext) {
    return
  }
  const context = audioContext
  const now = context.currentTime
  const frequencies = [523.25, 659.25, 783.99, 1046.5]
  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = now + index * 0.28
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + 1.15)
  })
}
