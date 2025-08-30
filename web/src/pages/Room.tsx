import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { API_BASE_URL } from '../config'

function readJwt<T=any>(token: string | null): T | null {
  if (!token) return null
  try {
    const [, payload] = token.split('.')
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch { return null }
}

export default function Room() {
  const { id } = useParams()
  const token = localStorage.getItem('token')
  const claims = readJwt<{ isAdmin?: boolean }>(token)
  const isAdmin = !!claims?.isAdmin

  // Socket ve state
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [streamUrl, setStreamUrl] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [viewers, setViewers] = useState(0)
  const [presence, setPresence] = useState<any[]>([])
  const chatRef = useRef<HTMLDivElement>(null)

  // Socket bağlantısı
  useEffect(() => {
    if (!token || !id) return

    console.log('Socket bağlanıyor...')
    const newSocket = io(API_BASE_URL, {
      auth: { token }
    })

    newSocket.on('connect', () => {
      console.log('Socket bağlandı!')
      setConnected(true)
      setSocket(newSocket)

      // Odaya katıl
      newSocket.emit('room:join', id, (response: any) => {
        console.log('Oda yanıtı:', response)
        if (response?.hlsUrl) {
          setStreamUrl(response.hlsUrl)
        }
        if (response?.presence) {
          setPresence(response.presence)
        }
      })
    })

    newSocket.on('disconnect', () => {
      console.log('Socket bağlantısı kesildi')
      setConnected(false)
    })

    // Chat mesajı
    newSocket.on('chat:message', (msg: any) => {
      console.log('Mesaj geldi:', msg)
      setMessages(prev => [...prev, msg])
    })

    // İstatistikler
    newSocket.on('room:stats', (stats: any) => {
      setViewers(stats.viewers || 0)
    })

    // Katılımcılar
    newSocket.on('room:presence', (list: any[]) => {
      setPresence(list)
    })

    // Tepki
    newSocket.on('reaction', (reaction: any) => {
      console.log('Tepki:', reaction)
      // Tepki animasyonu buraya eklenebilir
    })

    return () => {
      newSocket.emit('room:leave', id)
      newSocket.disconnect()
    }
  }, [token, id])

  // Chat otomatik scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Mesaj gönder
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !socket || !connected) return

    console.log('Mesaj gönderiliyor:', text)
    socket.emit('chat:message', { roomId: id, text })
    setText('')
  }

  // Tepki gönder
  const sendReaction = (type: string) => {
    if (!socket || !connected) return
    socket.emit('reaction', { roomId: id, type })
  }

  if (!token) {
    return (
      <div className="text-center py-12">
        <p className="text-white">Lütfen giriş yapın</p>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Video Player */}
      <div className="lg:col-span-2 space-y-4">
        {/* Player Container */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            {streamUrl ? (
              <iframe
                src={streamUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ border: 0 }}
                title="Yayın"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mx-auto mb-2"></div>
                  <p>Yayın yükleniyor...</p>
                </div>
              </div>
            )}
            
            {/* İzleyici sayısı */}
            <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded text-white text-sm">
              👥 {viewers} izleyici
            </div>
          </div>

          {/* Yeniden yükle */}
          <div className="mt-3 text-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all"
            >
              🔄 Yeniden Yükle
            </button>
          </div>
        </div>

        {/* Tepkiler */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <h3 className="text-white font-medium mb-3">⚡ Tepki Ver</h3>
          <div className="flex gap-3">
            <button onClick={() => sendReaction('👏')} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-xl transition-all">👏</button>
            <button onClick={() => sendReaction('🎉')} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-xl transition-all">🎉</button>
            <button onClick={() => sendReaction('🔥')} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-xl transition-all">🔥</button>
            <button onClick={() => sendReaction('❤️')} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-xl transition-all">❤️</button>
          </div>
        </div>
      </div>

      {/* Sağ Panel - Chat */}
      <div className="space-y-4">
        {/* Chat */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-medium">💬 Canlı Sohbet</h3>
          </div>

          {/* Mesajlar */}
          <div ref={chatRef} className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <p>Henüz mesaj yok 🤔</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">
                      {msg.user?.name || 'Anonim'}
                    </span>
                    <span className="text-xs text-white/50">
                      {new Date(msg.at).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Mesaj gönder */}
          <div className="p-4 border-t border-white/10">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Mesajın..."
                className="flex-1 p-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/50"
                disabled={!connected}
              />
              <button
                type="submit"
                disabled={!text.trim() || !connected}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all"
              >
                📤
              </button>
            </form>
          </div>
        </div>

        {/* Katılımcılar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <h3 className="text-white font-medium mb-3">👥 Katılımcılar ({presence.length})</h3>
          {presence.length === 0 ? (
            <p className="text-white/60 text-center py-4">Kimse yok 😔</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {presence.map((p, i) => (
                <div
                  key={i}
                  className="px-3 py-1 rounded-full bg-white/20 text-white text-sm"
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bağlantı durumu */}
        <div className="text-center">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            connected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            {connected ? 'Bağlı' : 'Bağlantı Yok'}
          </span>
        </div>
      </div>
    </div>
  )
}