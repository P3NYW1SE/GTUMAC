import { useEffect, useRef } from 'react'

// Dynamic import to avoid bundler resolution issues if package name changes
export default function ClapprPlayer({ src, autoPlay = true }: { src: string; autoPlay?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    let disposed = false
    async function mount() {
      if (!containerRef.current) return
      try {
        const mod = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/clappr@0.6.14/dist/clappr.min.js')
        const Player = (mod as any).default || (window as any).Clappr?.Player
        if (!Player) return
        playerRef.current?.destroy?.()
        const p = new Player({
          source: src,
          autoPlay,
          mute: true,
          width: '100%',
          height: '100%',
          playback: { hlsjsConfig: { maxBufferLength: 30 } },
          mediacontrol: { seekbar: '#6366f1', buttons: '#ffffff' },
        })
        if (!disposed && containerRef.current) p.attachTo(containerRef.current)
        playerRef.current = p
      } catch (e) {
        console.error('Clappr yüklenemedi', e)
      }
    }
    mount()
    return () => { disposed = true; try { playerRef.current?.destroy?.() } catch {}; playerRef.current = null }
  }, [src, autoPlay])

  return <div ref={containerRef} className="w-full h-full" />
}