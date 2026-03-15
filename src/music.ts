// Background music — picks a random track from the available list.
// Browsers require a user gesture before audio can play; we retry on the
// first pointer/keyboard interaction if the initial autoplay is blocked.

import dreamlandBounce from '../assets/Dreamland_Bounce.mp3'

const TRACKS = [dreamlandBounce]

let audio: HTMLAudioElement | null = null

export function startMusic(): void {
  if (audio) return  // already running

  const src = TRACKS[Math.floor(Math.random() * TRACKS.length)]
  audio = new Audio(src)
  audio.loop = true
  audio.volume = 0.45

  const tryPlay = (): void => {
    audio!.play().catch(() => {
      // Autoplay blocked — retry on first user interaction
      const unlock = (): void => {
        audio!.play().catch(() => {/* ignore */})
        window.removeEventListener('pointerdown', unlock)
        window.removeEventListener('keydown', unlock)
      }
      window.addEventListener('pointerdown', unlock, { once: true })
      window.addEventListener('keydown', unlock, { once: true })
    })
  }

  tryPlay()
}

export function stopMusic(): void {
  if (audio) {
    audio.pause()
    audio = null
  }
}
