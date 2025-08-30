import React from 'react'

export default function IframePlayer({ src }: { src: string }) {
  return (
    <iframe
      src={src}
      className="w-full h-full block"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write; microphone; camera"
      allowFullScreen
      frameBorder={0}
      style={{ border: '0', position: 'absolute', inset: 0 }}
      title="Yayın"
      loading="eager"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-pointer-lock allow-presentation allow-top-navigation"
    />
  )
}